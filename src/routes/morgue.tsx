import { createFileRoute, Link } from "@tanstack/react-router";
import { useEditionStore } from "@/lib/edition-store";
import { Button } from "@/components/ui/button";
import { pullFeishu } from "@/lib/edition-server";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";
import { useState } from "react";
import type { Corpse } from "@/lib/edition-types";

export const Route = createFileRoute("/morgue")({ component: Morgue });

function isDead(c: Corpse): boolean {
  if (/暂停|取消|已上线|每周复活|评审|归档|废弃/.test(c.status)) return true;
  const t = c.lastActive ? Date.parse(c.lastActive) : NaN;
  const days = Number.isNaN(t) ? 99 : Math.round((Date.now() - t) / 86400000);
  return days >= 21;
}

function Morgue() {
  const { corpses, setCorpses } = useEditionStore();
  const { user } = useCurrentUserState();
  const [busy, setBusy] = useState(false);
  const dead = corpses.filter(isDead);

  async function sync() {
    if (!user) {
      toast("先入内，再抬飞书的尸体。");
      return;
    }
    setBusy(true);
    try {
      const res = await pullFeishu();
      setCorpses(res.corpses);
      if (res.error) toast.error(res.error);
      else toast(`抬出 ${res.corpses.length} 具，法医认定 ${res.dead} 具死亡。`);
    } catch {
      toast.error("停尸房门锁了。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-[10px] tracking-[0.35em] text-seal">停尸房</p>
      <h1 className="font-display mt-2 text-3xl font-semibold">尚未下葬</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        从飞书多维表格抬出项目。沉默超过三周、状态停摆、截止日期发臭，或负责人已离职的，一律按死亡处理。
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => void sync()} disabled={busy} variant="outline">
          {busy ? "正在抬…" : "从飞书抬出"}
        </Button>
        <Button variant="seal" asChild>
          <Link to="/press">交给主笔</Link>
        </Button>
      </div>

      <ul className="mt-8 divide-y divide-rule border-y border-rule">
        {corpses.map((c) => {
          const deadNow = isDead(c);
          return (
            <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 py-4">
              <div>
                <p className="font-display text-lg">{c.name}</p>
                <p className="text-xs text-muted">
                  负责人 {c.owner} · 状态 {c.status}
                  {c.lastActive ? ` · 最后活动 ${c.lastActive}` : ""}
                </p>
                {c.notes ? <p className="mt-1 text-sm text-ink-soft">{c.notes}</p> : null}
              </div>
              <span
                className={
                  deadNow
                    ? "border border-seal px-2 py-1 text-[10px] tracking-widest text-seal"
                    : "border border-rule px-2 py-1 text-[10px] tracking-widest text-muted"
                }
              >
                {deadNow ? "已故" : "尚有余温"}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-muted">
        本馆现有 {corpses.length} 具，已故 {dead.length} 具。
      </p>
    </main>
  );
}
