import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createFileRoute("/guide")({
  component: Guide,
});

function Guide() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-[10px] tracking-[0.35em] text-seal">上手指南 · 投稿用</p>
      <h1 className="font-display mt-2 text-4xl font-semibold">默哀报怎么跑</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        飞书负责抬尸和收报。Grok 负责验尸和写讣告。两边都要在场，才算参赛作品。演示数据只够看报，不够过审。
      </p>

      <Section title="它是什么">
        <p>
          每周一份内部讣告小报。从飞书多维表格读项目，把沉默超过三周、状态停摆、截止日期发臭、或负责人已离职的写成讣告，再把报纸发回飞书群和云文档。
        </p>
      </Section>

      <Section title="为什么做">
        <p>
          公司里的项目很少正式宣布死亡。它们停在「进行中」，表格还在跳，人已经不看了。默哀报把这件事写成可以传阅的一版报纸，让「下周再说」有案可查。
        </p>
      </Section>

      <Section title="核心链路（评委看这个）">
        <ol className="list-decimal space-y-2 pl-5">
          <li>飞书多维表格《项目跟踪》 → 停尸房「从飞书抬出」</li>
          <li>Grok 验尸，写头版、讣告、犯罪栏 → 「让主笔写本周讣告」</li>
          <li>飞书群机器人 + 云文档收下报纸 → 「发往飞书」</li>
        </ol>
        <p className="mt-3 text-sm text-ink-soft">读、写、生成，三步都要跑通。只展示演示报纸不算。</p>
      </Section>

      <Section title="死亡判定">
        <ul className="list-disc space-y-1 pl-5">
          <li>状态含：暂停、取消、已上线、评审、归档、废弃、每周复活</li>
          <li>最后更新距今 ≥ 21 天</li>
          <li>截止日期逾期 ≥ 7 天，且状态不是完成 / 关闭</li>
          <li>负责人为空、无主、或含「离职」，且沉默 ≥ 14 天</li>
        </ul>
      </Section>

      <Section title="一、飞书自建应用">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            打开{" "}
            <a className="underline decoration-seal" href="https://open.feishu.cn/app" target="_blank" rel="noreferrer">
              飞书开放平台
            </a>
            ，创建<strong>企业自建应用</strong>。
          </li>
          <li>
            权限管理开通：
            <ul className="mt-1 list-disc pl-5">
              <li>查看、检索和获取多维表格中的数据（读记录）</li>
              <li>创建与编辑云文档（docx）</li>
            </ul>
          </li>
          <li>版本管理里创建版本并申请开通，至少对自己生效。</li>
          <li>
            凭证与基础信息里复制 <code className="bg-paper-deep px-1">App ID</code>（cli_ 开头）和{" "}
            <code className="bg-paper-deep px-1">App Secret</code>。
          </li>
        </ol>
      </Section>

      <Section title="二、多维表格《项目跟踪》">
        <p>新建多维表格，表名随意。列名请与下表一致（或稍后在编辑部改成你的列名）：</p>
        <div className="mt-3 overflow-x-auto border border-ink">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-deep">
              <tr>
                <th className="px-3 py-2">列名</th>
                <th className="px-3 py-2">类型</th>
                <th className="px-3 py-2">例子</th>
              </tr>
            </thead>
            <tbody>
              <Row name="项目名" type="文本" ex="增长引擎 3.0" />
              <Row name="负责人" type="文本 / 人员" ex="小周；实习生（已离职）" />
              <Row name="状态" type="文本 / 单选" ex="进行中 / 暂停 / 评审中 / 已上线" />
              <Row name="最后更新" type="日期" ex="2026-05-26" />
              <Row name="截止日期" type="日期" ex="2026-06-01" />
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          <a className="underline decoration-seal" href="/guide/bitable-sample.csv" download="项目跟踪-样例.csv">
            下载样例 CSV
          </a>
          （复明日集团七具，可直接导入）。导入后把<strong>本应用添加为该多维表格的协作者</strong>，权限至少「可阅读」。
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          浏览器打开表格，地址类似{" "}
          <code className="break-all bg-paper-deep px-1">feishu.cn/base/APPTOKEN?table=TBLXXX</code>
          。<code className="bg-paper-deep px-1">APPTOKEN</code> 填「多维表格 app_token」，
          <code className="bg-paper-deep px-1">TBLXXX</code> 填「数据表 table_id」。
        </p>
      </Section>

      <Section title="三、群机器人（写回）">
        <ol className="list-decimal space-y-2 pl-5">
          <li>目标群 → 设置 → 群机器人 → 添加自定义机器人。</li>
          <li>
            复制 Webhook，形如{" "}
            <code className="break-all bg-paper-deep px-1">https://open.feishu.cn/open-apis/bot/v2/hook/…</code>
          </li>
        </ol>
        <p className="mt-2 text-sm text-ink-soft">云文档文件夹 token 可选。不填则文档建在应用默认位置。</p>
      </Section>

      <Section title="四、在默哀报里接上">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            点顶栏 <strong>入内</strong>，注册一个账号。
          </li>
          <li>
            进 <Link className="underline decoration-seal" to="/press">编辑部</Link>，把 App ID、Secret、表格 token、表 ID、Webhook 填进去，保存钥匙。
          </li>
          <li>
            去 <Link className="underline decoration-seal" to="/morgue">停尸房</Link>，点「从飞书抬出」。应看到你表里的项目。
          </li>
          <li>回编辑部，点「让主笔写本周讣告」。头版会按这批尸体重排。</li>
          <li>点「发往飞书」。群里应收到讣告，云空间多一份文档。</li>
        </ol>
      </Section>

      <Section title="本地运行">
        <pre className="mt-2 overflow-x-auto border border-ink bg-paper-deep p-3 text-sm">{`git clone https://github.com/19960705/moai-bao.git
cd moai-bao
npm install
npm run dev`}</pre>
        <p className="mt-2 text-sm text-ink-soft">
          源码：
          <a className="ml-1 underline decoration-seal" href="https://github.com/19960705/moai-bao">
            github.com/19960705/moai-bao
          </a>
        </p>
      </Section>

      <p className="mt-10 text-center text-[10px] tracking-[0.3em] text-muted">读完请默哀三秒 · 然后去接飞书</p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 border-t border-ink pt-5">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-2 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}

function Row({ name, type, ex }: { name: string; type: string; ex: string }) {
  return (
    <tr className="border-t border-rule">
      <td className="px-3 py-2 font-semibold">{name}</td>
      <td className="px-3 py-2 text-ink-soft">{type}</td>
      <td className="px-3 py-2 text-ink-soft">{ex}</td>
    </tr>
  );
}
