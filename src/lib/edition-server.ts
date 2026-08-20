import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { demoCorpses, demoEdition, issueDateLabel } from "@/lib/seed-edition";
import type { Corpse, Edition, FeishuPublicConnection, Obituary } from "@/lib/edition-types";
import { createFeishuDoc, listBitableRecords, postWebhook } from "@/lib/feishu.server";

const DEAD_STATUS = /暂停|取消|已取消|已结束|已上线|won't|done|stall|hold|废弃|归档|每周复活|评审/;

function daysSince(raw: string | null): number {
  if (!raw) return 999;
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return 60;
  return Math.max(0, Math.round((Date.now() - t) / 86400000));
}

function isDead(c: Corpse): boolean {
  if (DEAD_STATUS.test(c.status)) return true;
  if (daysSince(c.lastActive) >= 21) return true;
  if (c.deadline && daysSince(c.deadline) >= 7 && !/完成|关闭/.test(c.status)) return true;
  if ((!c.owner || c.owner === "无主" || c.owner.includes("离职")) && daysSince(c.lastActive) >= 14) {
    return true;
  }
  return false;
}

function mask(s: string): string {
  if (!s) return "";
  if (s.length <= 4) return "••••";
  return `${s.slice(0, 3)}••••${s.slice(-2)}`;
}

export const getLatestEdition = createServerFn({ method: "GET" }).handler(async () => {
  return demoEdition;
});

export const getConnection = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<FeishuPublicConnection> => {
    const sql = await getSql();
    const rows = await sql<{
      app_id: string;
      bitable_app_token: string;
      bitable_table_id: string;
      name_field: string;
      owner_field: string;
      status_field: string;
      updated_field: string;
      deadline_field: string;
      webhook_url: string;
      folder_token: string;
    }>`select app_id, bitable_app_token, bitable_table_id, name_field, owner_field, status_field, updated_field, deadline_field, webhook_url, folder_token from feishu_connections where user_id = ${context.userId}`;
    const r = rows[0];
    if (!r) {
      return {
        configured: false,
        appIdMasked: "",
        bitableAppToken: "",
        bitableTableId: "",
        nameField: "项目名",
        ownerField: "负责人",
        statusField: "状态",
        updatedField: "最后更新",
        deadlineField: "截止日期",
        webhookConfigured: false,
        folderConfigured: false,
      };
    }
    return {
      configured: Boolean(r.app_id),
      appIdMasked: mask(r.app_id),
      bitableAppToken: r.bitable_app_token,
      bitableTableId: r.bitable_table_id,
      nameField: r.name_field,
      ownerField: r.owner_field,
      statusField: r.status_field,
      updatedField: r.updated_field,
      deadlineField: r.deadline_field,
      webhookConfigured: Boolean(r.webhook_url),
      folderConfigured: Boolean(r.folder_token),
    };
  });

const saveSchema = z.object({
  appId: z.string(),
  appSecret: z.string(),
  bitableAppToken: z.string(),
  bitableTableId: z.string(),
  nameField: z.string(),
  ownerField: z.string(),
  statusField: z.string(),
  updatedField: z.string(),
  deadlineField: z.string(),
  webhookUrl: z.string(),
  folderToken: z.string(),
});

export const saveConnection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<{ app_secret: string }>`
      select app_secret from feishu_connections where user_id = ${context.userId}`;
    const secret = data.appSecret.trim() || existing[0]?.app_secret || "";
    await sql`
      insert into feishu_connections (
        user_id, app_id, app_secret, bitable_app_token, bitable_table_id,
        name_field, owner_field, status_field, updated_field, deadline_field,
        webhook_url, folder_token, updated_at
      ) values (
        ${context.userId}, ${data.appId.trim()}, ${secret}, ${data.bitableAppToken.trim()},
        ${data.bitableTableId.trim()}, ${data.nameField.trim() || "项目名"},
        ${data.ownerField.trim() || "负责人"}, ${data.statusField.trim() || "状态"},
        ${data.updatedField.trim() || "最后更新"}, ${data.deadlineField.trim() || "截止日期"},
        ${data.webhookUrl.trim()}, ${data.folderToken.trim()}, now()
      )
      on conflict (user_id) do update set
        app_id = excluded.app_id,
        app_secret = case when excluded.app_secret = '' then feishu_connections.app_secret else excluded.app_secret end,
        bitable_app_token = excluded.bitable_app_token,
        bitable_table_id = excluded.bitable_table_id,
        name_field = excluded.name_field,
        owner_field = excluded.owner_field,
        status_field = excluded.status_field,
        updated_field = excluded.updated_field,
        deadline_field = excluded.deadline_field,
        webhook_url = excluded.webhook_url,
        folder_token = excluded.folder_token,
        updated_at = now()`;
    return { ok: true as const };
  });

export const listCorpses = createServerFn({ method: "GET" }).handler(async (): Promise<Corpse[]> => {
  return demoCorpses;
});

export const pullFeishu = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ corpses: Corpse[]; dead: number; error?: string }> => {
    const sql = await getSql();
    const rows = await sql<{
      app_id: string;
      app_secret: string;
      bitable_app_token: string;
      bitable_table_id: string;
      name_field: string;
      owner_field: string;
      status_field: string;
      updated_field: string;
      deadline_field: string;
    }>`select app_id, app_secret, bitable_app_token, bitable_table_id, name_field, owner_field, status_field, updated_field, deadline_field from feishu_connections where user_id = ${context.userId}`;
    const r = rows[0];
    if (!r?.app_id || !r.app_secret || !r.bitable_app_token || !r.bitable_table_id) {
      return { corpses: demoCorpses, dead: demoCorpses.filter(isDead).length, error: "还没接入飞书。先去编辑部填自建应用。" };
    }
    try {
      const corpses = await listBitableRecords({
        creds: { appId: r.app_id, appSecret: r.app_secret },
        appToken: r.bitable_app_token,
        tableId: r.bitable_table_id,
        nameField: r.name_field,
        ownerField: r.owner_field,
        statusField: r.status_field,
        updatedField: r.updated_field,
        deadlineField: r.deadline_field,
      });
      return { corpses, dead: corpses.filter(isDead).length };
    } catch (e) {
      return {
        corpses: demoCorpses,
        dead: demoCorpses.filter(isDead).length,
        error: e instanceof Error ? e.message : "飞书读取失败",
      };
    }
  });

function editionToParagraphs(ed: Edition): string[] {
  const lines = [
    `${ed.companyName} · 默哀报 第${ed.issueNo}期`,
    ed.dateLabel,
    ed.headline,
    ed.lede,
    "—— 讣告 ——",
    ...ed.obituaries.flatMap((o) => [
      `【${o.name}】${o.ageLabel} 家属：${o.nextOfKin}`,
      `死因：${o.cause}`,
      `临终遗言：${o.lastWords}`,
      `墓志铭：${o.epitaph}`,
    ]),
    "—— 犯罪栏 ——",
    ...ed.crime.map((c) => `${c.charge}｜被告 ${c.accused}｜${c.evidence}`),
    "—— 社会版 ——",
    ...ed.society.map((s) => `${s.headline}：${s.body}`),
    ed.weather,
    "—— 分类广告 ——",
    ...ed.classifieds,
    ed.colophon,
  ];
  return lines;
}

export const publishToFeishu = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ edition: z.any() }).parse(input))
  .handler(async ({ context, data }) => {
    const edition = data.edition as Edition;
    const sql = await getSql();
    const rows = await sql<{
      app_id: string;
      app_secret: string;
      webhook_url: string;
      folder_token: string;
    }>`select app_id, app_secret, webhook_url, folder_token from feishu_connections where user_id = ${context.userId}`;
    const r = rows[0];
    if (!r?.app_id && !r?.webhook_url) {
      return { ok: false as const, error: "先接入飞书：至少需要自建应用，或一个群机器人 Webhook。" };
    }

    const paragraphs = editionToParagraphs(edition);
    const text = paragraphs.join("\n");
    let docToken: string | undefined;
    let webhookSent = false;
    const notes: string[] = [];

    if (r.app_id && r.app_secret) {
      try {
        docToken = await createFeishuDoc({
          creds: { appId: r.app_id, appSecret: r.app_secret },
          folderToken: r.folder_token || undefined,
          title: `默哀报 第${edition.issueNo}期 · ${edition.headline}`,
          paragraphs,
        });
        notes.push("云文档已下葬");
      } catch (e) {
        notes.push(e instanceof Error ? `文档：${e.message}` : "文档写回失败");
      }
    }

    if (r.webhook_url) {
      try {
        await postWebhook(r.webhook_url, `默哀报 第${edition.issueNo}期`, text.slice(0, 1800));
        webhookSent = true;
        notes.push("讣告已发到群");
      } catch (e) {
        notes.push(e instanceof Error ? `群：${e.message}` : "群发失败");
      }
    }

    await sql.query(
      `insert into editions (user_id, issue_no, company_name, source, body, feishu_doc_token, feishu_webhook_sent)
       values ($1, $2, $3, $4, $5::jsonb, $6, $7)`,
      [
        context.userId,
        edition.issueNo,
        edition.companyName,
        edition.source,
        JSON.stringify(edition),
        docToken ?? null,
        webhookSent,
      ],
    );

    if (!docToken && !webhookSent) {
      return { ok: false as const, error: notes.join("；") || "飞书写回失败" };
    }
    return { ok: true as const, docToken, webhookSent, notes };
  });

export const rewriteEdition = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ corpses: z.array(z.any()), companyName: z.string().optional() }).parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true; edition: Edition } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "主笔今天不出诊（AI 不可用）" };

    const corpses = (data.corpses as Corpse[]).filter(isDead).slice(0, 8);
    if (corpses.length === 0) return { ok: false, error: "停尸房是空的。没有死项目，本报停刊。" };

    const prompt = `你是一份中文黑色幽默报纸《默哀报》的主笔。把下列飞书项目写成周五讣告小报。语气冷、短、脏、像民国小报，不要emoji，不要markdown标题符号。

公司：${data.companyName || "复明日集团"}
死者：
${corpses
  .map(
    (c) =>
      `- ${c.name}｜负责人 ${c.owner}｜状态 ${c.status}｜最后活动 ${c.lastActive ?? "未知"}｜截止 ${c.deadline ?? "无"}｜${c.notes}`,
  )
  .join("\n")}

只输出 JSON，形状：
{
  "headline": "头版大标题",
  "lede": "导语，80字内",
  "obituaries": [{"id":"原id","name":"","ageLabel":"享年…","cause":"","lastWords":"","epitaph":"一句墓志铭","nextOfKin":""}],
  "crime": [{"charge":"","accused":"","evidence":""}],
  "society": [{"headline":"","body":""}],
  "weather": "办公气候一句",
  "classifieds": ["广告1","广告2"]
}`;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1800,
        temperature: 0.9,
      }),
    });
    if (!res.ok) return { ok: false, error: `主笔拒写（${res.status}）` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = body.choices?.[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ok: false, error: "主笔写飞了，不是一份报纸。" };

    let parsed: {
      headline: string;
      lede: string;
      obituaries: {
        id: string;
        name: string;
        ageLabel: string;
        cause: string;
        lastWords: string;
        epitaph: string;
        nextOfKin: string;
      }[];
      crime: { charge: string; accused: string; evidence: string }[];
      society: { headline: string; body: string }[];
      weather: string;
      classifieds: string[];
    };
    try {
      parsed = JSON.parse(jsonMatch[0]) as typeof parsed;
    } catch {
      return { ok: false, error: "主笔的手稿无法排版。" };
    }

    const portraits = [
      "/portraits/engine.jpg",
      "/portraits/honey.jpg",
      "/portraits/website.jpg",
      "/portraits/wiki.jpg",
      "/portraits/success.jpg",
      "/portraits/party.jpg",
      "/portraits/okr.jpg",
    ];

    const obituaries: Obituary[] = (parsed.obituaries ?? []).map((o, i) => {
      const src = corpses.find((c) => c.id === o.id) ?? corpses[i];
      return {
        id: o.id || src?.id || `n${i}`,
        name: o.name || src?.name || "无名项目",
        ageLabel: o.ageLabel || `享年${daysSince(src?.lastActive ?? null)}天`,
        owner: src?.owner ?? "无主",
        cause: o.cause || "死因不详",
        lastWords: o.lastWords || "下周一定。",
        epitaph: o.epitaph || "待补墓志铭。",
        nextOfKin: o.nextOfKin || src?.owner || "无",
        portraitUrl: portraits[i % portraits.length] ?? portraits[0]!,
        status: src?.status ?? "",
        daysSilent: daysSince(src?.lastActive ?? null),
      };
    });

    const now = new Date();
    const edition: Edition = {
      issueNo: 1 + (Math.floor(Date.now() / 86400000) % 90),
      dateLabel: issueDateLabel(now),
      companyName: data.companyName || demoEdition.companyName,
      kicker: "飞书停尸房专刊 · 验尸完毕 · 请默哀",
      headline: parsed.headline || "本周有人死了，只是状态没改",
      lede: parsed.lede || demoEdition.lede,
      obituaries,
      crime: parsed.crime?.length ? parsed.crime : demoEdition.crime,
      society: parsed.society?.length ? parsed.society : demoEdition.society,
      weather: parsed.weather || demoEdition.weather,
      classifieds: parsed.classifieds?.length ? parsed.classifieds : demoEdition.classifieds,
      colophon: `默哀报 · 根据飞书多维表格验尸排版 · ${now.toISOString().slice(0, 10)}`,
      source: corpses[0]?.source === "feishu" ? "feishu" : "demo",
    };

    return { ok: true, edition };
  });
