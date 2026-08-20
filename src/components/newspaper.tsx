import { useState } from "react";
import type { Edition, Obituary } from "@/lib/edition-types";
import { cn } from "@/lib/utils";

export function Newspaper({ edition }: { edition: Edition }) {
  const [open, setOpen] = useState<Obituary | null>(null);
  const lead = edition.obituaries[0];
  const rest = edition.obituaries.slice(1);

  return (
    <article className="paper-grain relative mx-auto max-w-5xl border border-ink bg-paper px-4 py-5 shadow-[8px_12px_0_0_rgba(28,22,18,0.12)] sm:px-8 sm:py-7">
      <header className="relative border-b-2 border-ink pb-4 text-center">
        <p className="text-[10px] tracking-[0.35em] text-muted sm:text-xs">{edition.kicker}</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="hidden h-px flex-1 bg-ink sm:block" />
          <h1 className="font-display text-5xl font-bold tracking-[0.2em] text-ink sm:text-6xl">
            默哀报
          </h1>
          <span className="hidden h-px flex-1 bg-ink sm:block" />
        </div>
        <p className="font-display mt-1 text-xs italic tracking-[0.4em] text-ink-soft sm:text-sm">
          MOURNING POST
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-y border-ink py-1.5 text-[10px] tracking-widest text-ink-soft sm:text-xs">
          <span>{edition.companyName} 停尸房专刊</span>
          <span>{edition.dateLabel}</span>
          <span>第 {edition.issueNo} 期 · 售价三炷香</span>
        </div>
        <div
          className="seal pointer-events-none absolute right-0 top-0 size-14 text-lg sm:right-2 sm:top-2 sm:size-20 sm:text-2xl"
          aria-hidden
        >
          讣
        </div>
      </header>

      <section className="grid gap-5 border-b border-ink py-5 sm:grid-cols-[minmax(0,8.5rem)_1fr] sm:gap-7">
        {lead ? (
          <button type="button" onClick={() => setOpen(lead)} className="justify-self-center sm:justify-self-start">
            <Portrait src={lead.portraitUrl} name={lead.name} className="h-44 w-32" />
          </button>
        ) : null}
        <div>
          <p className="text-[10px] tracking-[0.3em] text-seal">头版</p>
          <h2 className="mt-1 font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl">
            {edition.headline}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{edition.lede}</p>
          {lead ? (
            <button type="button" onClick={() => setOpen(lead)} className="mt-3 text-left">
              <p className="font-display text-base font-semibold">{lead.name}</p>
              <p className="text-[10px] tracking-widest text-muted">
                {lead.ageLabel} · 沉默 {lead.daysSilent} 天 · {lead.status}
              </p>
              <p className="mt-1 font-display text-sm italic text-ink">「{lead.lastWords}」</p>
            </button>
          ) : null}
        </div>
      </section>

      <div className="mt-6 grid gap-6 border-t border-ink pt-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionLabel>讣告栏</SectionLabel>
          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            {rest.map((o) => (
              <ObituaryCard key={o.id} obit={o} onOpen={() => setOpen(o)} />
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-6 border-t border-rule pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          <section>
            <SectionLabel>犯罪栏</SectionLabel>
            <ul className="mt-2 space-y-3">
              {edition.crime.map((c) => (
                <li key={c.charge} className="text-sm leading-relaxed">
                  <p className="font-semibold text-seal">{c.charge}</p>
                  <p className="text-ink-soft">
                    被告 {c.accused}。{c.evidence}
                  </p>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <SectionLabel>社会版</SectionLabel>
            <ul className="mt-2 space-y-3">
              {edition.society.map((s) => (
                <li key={s.headline}>
                  <p className="font-semibold leading-snug">{s.headline}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.body}</p>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <SectionLabel>办公气候</SectionLabel>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{edition.weather}</p>
          </section>
          <section>
            <SectionLabel>分类广告</SectionLabel>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink-soft">
              {edition.classifieds.map((ad) => (
                <li key={ad} className="border-b border-dashed border-rule pb-2 last:border-0">
                  {ad}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <footer className="mt-8 border-t-2 border-ink pt-3 text-center text-[10px] leading-relaxed tracking-wide text-muted">
        {edition.colophon}
      </footer>

      {open ? (
        <AutopsyDialog obit={open} onClose={() => setOpen(null)} />
      ) : null}
    </article>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="border-b border-ink pb-1 text-xs tracking-[0.35em] text-ink">{children}</h3>
  );
}

function ObituaryCard({ obit, onOpen }: { obit: Obituary; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="flex gap-3 text-left">
      <Portrait src={obit.portraitUrl} name={obit.name} className="h-24 w-16 shrink-0" />
      <div className="min-w-0">
        <h4 className="font-display text-base font-semibold leading-snug">{obit.name}</h4>
        <p className="text-[10px] tracking-widest text-muted">{obit.ageLabel}</p>
        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ink-soft">{obit.cause}</p>
      </div>
    </button>
  );
}

function Portrait({ src, name, className }: { src: string; name: string; className?: string }) {
  return (
    <span className={cn("block overflow-hidden bg-paper-deep", className)}>
      <img
        src={src}
        alt={`${name} 遗照`}
        className="oval-portrait h-full w-full object-cover object-top"
        crossOrigin="anonymous"
      />
    </span>
  );
}

function AutopsyDialog({ obit, onClose }: { obit: Obituary; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-ink/50 p-0 sm:place-items-center sm:p-6"
      role="dialog"
      aria-modal
      aria-labelledby="autopsy-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] w-full overflow-auto border border-ink bg-paper p-5 shadow-2xl sm:max-w-lg sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] tracking-[0.35em] text-seal">验尸报告</p>
        <div className="mt-3 flex gap-4">
          <Portrait src={obit.portraitUrl} name={obit.name} className="h-36 w-24 shrink-0" />
          <div>
            <h3 id="autopsy-title" className="font-display text-xl font-semibold">
              {obit.name}
            </h3>
            <p className="mt-1 text-xs tracking-widest text-muted">{obit.ageLabel}</p>
            <p className="mt-2 text-sm text-ink-soft">状态 {obit.status}</p>
            <p className="text-sm text-ink-soft">已沉默 {obit.daysSilent} 天</p>
          </div>
        </div>
        <dl className="mt-5 space-y-3 text-sm leading-relaxed">
          <div>
            <dt className="text-[10px] tracking-[0.3em] text-muted">死因</dt>
            <dd className="mt-1">{obit.cause}</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.3em] text-muted">临终遗言</dt>
            <dd className="mt-1 font-display italic">「{obit.lastWords}」</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.3em] text-muted">墓志铭</dt>
            <dd className="mt-1">{obit.epitaph}</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.3em] text-muted">家属</dt>
            <dd className="mt-1">{obit.nextOfKin}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-11 w-full border border-ink text-sm tracking-widest hover:bg-ink hover:text-paper"
        >
          盖棺
        </button>
      </div>
    </div>
  );
}
