import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-[80dvh] place-items-center px-4 py-10">
      <div className="w-full max-w-md border border-ink bg-paper p-8 text-center">
        <p className="text-[10px] tracking-[0.4em] text-seal">寻人启事</p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-[0.2em]">入 内</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          停尸房与编辑部仅对认领者开放。出示身份后，可将讣告发回飞书。
        </p>
        <div className="mt-6 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                className="w-full tracking-widest"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                以 {p.label} 入内
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">登记处今日休息。</p>
          )}
        </div>
      </div>
    </main>
  );
}
