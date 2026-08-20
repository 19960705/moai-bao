import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/watch")({
  component: Watch,
});

function Watch() {
  return (
    <main className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
      <p className="text-[10px] tracking-[0.35em] text-seal">演示片</p>
      <h1 className="font-display mt-2 text-3xl font-semibold">第 37 期已印毕</h1>
      <p className="mt-2 text-sm text-ink-soft">59 秒。点画面播放，请开声音。读完请默哀三秒。</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="/demo/moai-bao-demo.mp4"
          download="默哀报-第37期-demo.mp4"
          className="inline-flex h-10 items-center border border-ink bg-seal px-4 text-xs tracking-widest text-paper hover:bg-ink"
        >
          下载视频到电脑
        </a>
        <a
          href="/demo/moai-bao-source.zip"
          download="默哀报-源码.zip"
          className="inline-flex h-10 items-center border border-ink px-4 text-xs tracking-widest hover:bg-ink hover:text-paper"
        >
          下载源码
        </a>
      </div>
      <div className="mt-6 overflow-hidden border border-ink bg-ink">
        <video
          className="aspect-video w-full bg-ink"
          controls
          playsInline
          preload="metadata"
          poster="/demo/poster.jpg"
          src="/demo/moai-bao-demo.mp4"
        >
          浏览器不肯放这段片子。请点「下载视频到电脑」。
        </video>
      </div>
      <p className="mt-4 text-xs tracking-widest text-muted">
        <Link to="/" className="underline decoration-seal underline-offset-4">
          回到报纸
        </Link>
      </p>
    </main>
  );
}
