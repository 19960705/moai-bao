import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { getConnection, publishToFeishu, rewriteEdition, saveConnection } from "@/lib/edition-server";
import { useEditionStore } from "@/lib/edition-store";
import { toast } from "sonner";
import type { FeishuPublicConnection } from "@/lib/edition-types";

export const Route = createFileRoute("/press")({ component: Press });

function Press() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="mx-auto max-w-xl px-4 py-20 text-sm tracking-widest text-muted">编辑部开门中…</div>;
  }
  if (!user) return <RedirectToSignIn />;
  return <PressInner />;
}

function PressInner() {
  const nav = useNavigate();
  const { edition, corpses, setEdition } = useEditionStore();
  const [conn, setConn] = useState<FeishuPublicConnection | null>(null);
  const [busy, setBusy] = useState<"save" | "write" | "publish" | null>(null);
  const [form, setForm] = useState({
    appId: "",
    appSecret: "",
    bitableAppToken: "",
    bitableTableId: "",
    nameField: "项目名",
    ownerField: "负责人",
    statusField: "状态",
    updatedField: "最后更新",
    deadlineField: "截止日期",
    webhookUrl: "",
    folderToken: "",
  });

  useEffect(() => {
    void getConnection()
      .then((c) => {
        setConn(c);
        setForm((f) => ({
          ...f,
          bitableAppToken: c.bitableAppToken,
          bitableTableId: c.bitableTableId,
          nameField: c.nameField,
          ownerField: c.ownerField,
          statusField: c.statusField,
          updatedField: c.updatedField,
          deadlineField: c.deadlineField,
        }));
      })
      .catch(() => setConn(null));
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save");
    try {
      await saveConnection({ data: form });
      toast("编辑部已记下飞书钥匙。");
      const c = await getConnection();
      setConn(c);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "没能保存");
    } finally {
      setBusy(null);
    }
  }

  async function onWrite() {
    setBusy("write");
    try {
      const res = await rewriteEdition({
        data: { corpses, companyName: edition.companyName },
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setEdition(res.edition);
      toast("本周讣告已写好。");
      void nav({ to: "/" });
    } catch {
      toast.error("主笔拒写。");
    } finally {
      setBusy(null);
    }
  }

  async function onPublish() {
    setBusy("publish");
    try {
      const res = await publishToFeishu({ data: { edition } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast(res.notes?.join(" · ") || "已发往飞书。");
    } catch {
      toast.error("飞书拒收这份报纸。");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <p className="text-[10px] tracking-[0.35em] text-seal">编辑部</p>
      <h1 className="font-display mt-2 text-3xl font-semibold">把死者写回飞书</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        飞书负责抬出尸体、收下讣告。主笔（Grok）负责死因、遗言和墓志铭。两边都要在场，否则不算参赛作品。
      </p>

      <form onSubmit={(e) => void onSave(e)} className="mt-8 space-y-4 border border-ink p-5">
        <p className="text-xs tracking-[0.3em]">飞书自建应用</p>
        <Field
          label="App ID"
          value={form.appId}
          placeholder={conn?.appIdMasked || "cli_xxx"}
          onChange={(v) => setForm({ ...form, appId: v })}
        />
        <Field
          label="App Secret"
          value={form.appSecret}
          placeholder={conn?.configured ? "已保存，不回显" : "留在编辑部，不进报纸"}
          type="password"
          onChange={(v) => setForm({ ...form, appSecret: v })}
        />
        <Field
          label="多维表格 app_token"
          value={form.bitableAppToken}
          onChange={(v) => setForm({ ...form, bitableAppToken: v })}
        />
        <Field
          label="数据表 table_id"
          value={form.bitableTableId}
          onChange={(v) => setForm({ ...form, bitableTableId: v })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="项目名列" value={form.nameField} onChange={(v) => setForm({ ...form, nameField: v })} />
          <Field label="负责人列" value={form.ownerField} onChange={(v) => setForm({ ...form, ownerField: v })} />
          <Field label="状态列" value={form.statusField} onChange={(v) => setForm({ ...form, statusField: v })} />
          <Field label="最后更新列" value={form.updatedField} onChange={(v) => setForm({ ...form, updatedField: v })} />
          <Field label="截止日期列" value={form.deadlineField} onChange={(v) => setForm({ ...form, deadlineField: v })} />
        </div>
        <Field
          label="群机器人 Webhook（写回）"
          value={form.webhookUrl}
          placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/…"
          onChange={(v) => setForm({ ...form, webhookUrl: v })}
        />
        <Field
          label="云文档文件夹 token（可选）"
          value={form.folderToken}
          onChange={(v) => setForm({ ...form, folderToken: v })}
        />
        <Button type="submit" className="w-full" disabled={busy === "save"}>
          {busy === "save" ? "登记中…" : "保存钥匙"}
        </Button>
        <p className="text-[11px] leading-relaxed text-muted">
          {conn?.configured
            ? `已接入。群机器人 ${conn.webhookConfigured ? "已接" : "未接"}，云文档 ${conn.folderConfigured ? "已接" : "未接"}。`
            : "未接入时仍可用复明日集团演示尸体出报。发往飞书必须填钥匙。"}
        </p>
      </form>

      <div className="mt-6 flex flex-col gap-2">
        <Button variant="outline" onClick={() => void onWrite()} disabled={busy === "write"}>
          {busy === "write" ? "主笔执笔中…" : "让主笔写本周讣告"}
        </Button>
        <Button variant="seal" onClick={() => void onPublish()} disabled={busy === "publish"}>
          {busy === "publish" ? "发报中…" : "发往飞书"}
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/">回报纸</Link>
        </Button>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-1">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </label>
  );
}
