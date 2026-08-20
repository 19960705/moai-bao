import { createFileRoute, Link } from "@tanstack/react-router";
import { Newspaper } from "@/components/newspaper";
import { useEditionStore } from "@/lib/edition-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const edition = useEditionStore((s) => s.edition);
  return (
    <main className="px-3 py-6 sm:px-6 sm:py-10">
      <section className="mx-auto mb-6 max-w-5xl border border-ink bg-ink">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
          <p className="text-[10px] tracking-[0.35em] text-paper">演示片 · 五十九秒</p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/demo/moai-bao-demo.mp4"
              download="默哀报-第37期-demo.mp4"
              className="inline-flex h-8 items-center border border-paper px-3 text-[10px] tracking-widest text-paper hover:bg-paper hover:text-ink"
            >
              下载视频
            </a>
            <a
              href="/demo/moai-bao-source.zip"
              download="默哀报-源码.zip"
              className="inline-flex h-8 items-center border border-paper/40 px-3 text-[10px] tracking-widest text-paper/80 hover:bg-paper hover:text-ink"
            >
              下载源码
            </a>
          </div>
        </div>
        <video
          className="aspect-video w-full bg-ink"
          controls
          playsInline
          preload="metadata"
          poster="/demo/poster.jpg"
          src="/demo/moai-bao-demo.mp4"
        >
          浏览器不肯放这段片子。请点上方「下载视频」。
        </video>
      </section>

      <Newspaper edition={edition} />
      <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted">
          {edition.source === "feishu"
            ? "本期刊物根据飞书多维表格验尸排版。点击遗照可开棺。"
            : "本期刊物根据复明日集团飞书多维表格《项目跟踪》验尸排版。点击遗照可开棺。"}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/morgue">去停尸房</Link>
          </Button>
          <Button variant="seal" size="sm" asChild>
            <Link to="/press">发往飞书</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
