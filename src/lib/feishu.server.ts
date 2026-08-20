import type { Corpse } from "./edition-types";

type FeishuCreds = {
  appId: string;
  appSecret: string;
};

async function tenantToken(creds: FeishuCreds): Promise<string> {
  const res = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: creds.appId, app_secret: creds.appSecret }),
    },
  );
  const body = (await res.json()) as { code?: number; msg?: string; tenant_access_token?: string };
  if (!body.tenant_access_token) {
    throw new Error(body.msg || "飞书租户凭证获取失败");
  }
  return body.tenant_access_token;
}

function fieldText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (v && typeof v === "object" && "name" in v) return String((v as { name: string }).name);
        if (v && typeof v === "object" && "text" in v) return String((v as { text: string }).text);
        return fieldText(v);
      })
      .filter(Boolean)
      .join("、");
  }
  if (typeof value === "object" && value && "text" in value) {
    return String((value as { text: string }).text);
  }
  return JSON.stringify(value);
}

export async function listBitableRecords(input: {
  creds: FeishuCreds;
  appToken: string;
  tableId: string;
  nameField: string;
  ownerField: string;
  statusField: string;
  updatedField: string;
  deadlineField: string;
}): Promise<Corpse[]> {
  const token = await tenantToken(input.creds);
  const url = new URL(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${input.appToken}/tables/${input.tableId}/records`,
  );
  url.searchParams.set("page_size", "80");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = (await res.json()) as {
    code?: number;
    msg?: string;
    data?: { items?: { record_id: string; fields: Record<string, unknown> }[] };
  };
  if (body.code !== 0) throw new Error(body.msg || "读取多维表格失败");
  const items = body.data?.items ?? [];
  return items.map((item) => {
    const f = item.fields ?? {};
    return {
      id: item.record_id,
      name: fieldText(f[input.nameField]) || "未命名项目",
      owner: fieldText(f[input.ownerField]) || "无主",
      status: fieldText(f[input.statusField]) || "未知",
      lastActive: fieldText(f[input.updatedField]) || null,
      deadline: fieldText(f[input.deadlineField]) || null,
      notes: "",
      source: "feishu" as const,
    };
  });
}

export async function postWebhook(webhookUrl: string, title: string, text: string): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      msg_type: "post",
      content: {
        post: {
          zh_cn: {
            title,
            content: [[{ tag: "text", text }]],
          },
        },
      },
    }),
  });
  if (!res.ok) {
    const fallback = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg_type: "text", content: { text: `${title}\n\n${text}` } }),
    });
    if (!fallback.ok) throw new Error("飞书群机器人发送失败");
  }
}

export async function createFeishuDoc(input: {
  creds: FeishuCreds;
  folderToken?: string;
  title: string;
  paragraphs: string[];
}): Promise<string> {
  const token = await tenantToken(input.creds);
  const created = await fetch("https://open.feishu.cn/open-apis/docx/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: input.title,
      folder_token: input.folderToken || undefined,
    }),
  });
  const createdBody = (await created.json()) as {
    code?: number;
    msg?: string;
    data?: { document?: { document_id: string } };
  };
  const docId = createdBody.data?.document?.document_id;
  if (!docId) throw new Error(createdBody.msg || "创建飞书文档失败");

  const children = input.paragraphs.slice(0, 40).map((text) => ({
    block_type: 2,
    text: {
      elements: [{ text_run: { content: text } }],
    },
  }));

  await fetch(
    `https://open.feishu.cn/open-apis/docx/v1/documents/${docId}/blocks/${docId}/children`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ children }),
    },
  );

  return docId;
}
