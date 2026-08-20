import type { Corpse, Edition } from "./edition-types";

export const DEMO_COMPANY = "复明日集团";

export const demoCorpses: Corpse[] = [
  {
    id: "c1",
    name: "增长引擎 3.0",
    owner: "小周",
    status: "进行中",
    lastActive: "2026-05-26",
    deadline: "2026-06-01",
    notes: "仪表盘 47 张，本周打开次数 0",
    source: "demo",
  },
  {
    id: "c2",
    name: "智能客服「小蜜」",
    owner: "产品汪",
    status: "暂停",
    lastActive: "2026-04-12",
    deadline: null,
    notes: "知识库三句：你好、请稍等、转人工",
    source: "demo",
  },
  {
    id: "c3",
    name: "官网改版",
    owner: "设计组",
    status: "评审中",
    lastActive: "2026-07-03",
    deadline: "2026-03-15",
    notes: "Figma 链接 37 个，上线记录 0",
    source: "demo",
  },
  {
    id: "c4",
    name: "飞书知识库重构",
    owner: "实习生（已离职）",
    status: "进行中",
    lastActive: "2026-02-08",
    deadline: null,
    notes: "三个空白页：概述、待补充、README",
    source: "demo",
  },
  {
    id: "c5",
    name: "客户成功体系",
    owner: "销售部",
    status: "进行中",
    lastActive: "2026-01-20",
    deadline: "2026-02-28",
    notes: "春节前最后一次更新",
    source: "demo",
  },
  {
    id: "c6",
    name: "团建小程序",
    owner: "已离职",
    status: "已上线",
    lastActive: "2025-12-18",
    deadline: null,
    notes: "用户数 0，家属拒绝认领",
    source: "demo",
  },
  {
    id: "c7",
    name: "OKR 对齐会",
    owner: "全员",
    status: "每周复活",
    lastActive: "2026-08-17",
    deadline: null,
    notes: "会后再死，法医建议按吸血鬼处理",
    source: "demo",
  },
];

export const demoEdition: Edition = {
  issueNo: 37,
  dateLabel: "公元二〇二六年八月二十一日 星期五",
  companyName: DEMO_COMPANY,
  kicker: "内部特刊 · 非卖品 · 读完请默哀三秒",
  headline: "本周七具，全部死于「下周再说」",
  lede:
    "本报停尸房于周四深夜完成验尸。复明日集团多维表格《项目跟踪》现存十二条脉搏，七条已被法医裁定死亡——其中三条死状仍标注「进行中」。这不是事故。这是企业文化。",
  obituaries: [
    {
      id: "c1",
      name: "增长引擎 3.0",
      ageLabel: "享年四十七天",
      owner: "小周",
      cause: "仪表盘过多，无人打开。尸体被四十七张图表压住，呼吸早停。",
      lastWords: "再看一周数据。",
      epitaph: "增长过，只是没人在场。",
      nextOfKin: "小周（已读不回）",
      portraitUrl: "/portraits/engine.jpg",
      status: "进行中（活死人）",
      daysSilent: 86,
    },
    {
      id: "c2",
      name: "智能客服「小蜜」",
      ageLabel: "享年三个迭代",
      owner: "产品汪",
      cause: "被折叠进「下个季度再看」。开棺只见三句遗言：你好、请稍等、转人工。",
      lastWords: "正在转接人工。",
      epitaph: "她等的那个人，始终没有来。",
      nextOfKin: "产品汪",
      portraitUrl: "/portraits/honey.jpg",
      status: "暂停",
      daysSilent: 130,
    },
    {
      id: "c3",
      name: "官网改版",
      ageLabel: "享年十四轮评审",
      owner: "设计组",
      cause: "像素级口嗨。现场起获三十七个 Figma 链接，零条上线记录。",
      lastWords: "再改一版。",
      epitaph: "美，是她未能抵达的站点。",
      nextOfKin: "设计组群（99+）",
      portraitUrl: "/portraits/website.jpg",
      status: "评审中",
      daysSilent: 48,
    },
    {
      id: "c4",
      name: "飞书知识库重构",
      ageLabel: "享年两个兴奋的晚上",
      owner: "实习生（已离职）",
      cause: "建完目录就累了。遗体为三页空白，标题分别为概述、待补充、README。",
      lastWords: "我先搭个结构。",
      epitaph: "目录还在，人已经走了。",
      nextOfKin: "无。人事系统已清除。",
      portraitUrl: "/portraits/wiki.jpg",
      status: "进行中（活死人）",
      daysSilent: 193,
    },
    {
      id: "c5",
      name: "客户成功体系",
      ageLabel: "享年未知，春节前已无体温",
      owner: "销售部",
      cause: "状态栏拒不改口，坚持自称进行中。法医定性：活死人，建议火化状态字段。",
      lastWords: "客户那边再跟一跟。",
      epitaph: "成功从未开始，体系已经结束。",
      nextOfKin: "销售部公共邮箱",
      portraitUrl: "/portraits/success.jpg",
      status: "进行中（活死人）",
      daysSilent: 212,
    },
    {
      id: "c6",
      name: "团建小程序",
      ageLabel: "上线当日殉职",
      owner: "已离职",
      cause: "用户数零。开发者携源码走了，家属拒绝认领。",
      lastWords: "先上线再看数据。",
      epitaph: "没有人来参加这场团建。",
      nextOfKin: "拒绝认领",
      portraitUrl: "/portraits/party.jpg",
      status: "已上线",
      daysSilent: 245,
    },
    {
      id: "c7",
      name: "OKR 对齐会",
      ageLabel: "无法确定死亡时间",
      owner: "全员",
      cause: "每周一复活，会后再死。法医建议按吸血鬼处理，勿用普通待办覆盖。",
      lastWords: "那我们对齐一下。",
      epitaph: "对齐过万千，目标仍在逃。",
      nextOfKin: "日历（每周一 10:00）",
      portraitUrl: "/portraits/okr.jpg",
      status: "每周复活",
      daysSilent: 3,
    },
  ],
  crime: [
    {
      charge: "习惯性诈骗",
      accused: "「周五前给到」",
      evidence: "连续十一周签发同一张期票，无一兑付。本报已将其列为惯犯。",
    },
    {
      charge: "弃尸",
      accused: "未认领的 @",
      evidence: "群内发臭 @ 三十四条。最近一条距今六十一天，仍显示「有人提到你」。",
    },
    {
      charge: "伪造生命体征",
      accused: "状态字段「进行中」",
      evidence: "七具尸体中三具死状仍为进行中。这是一起系统性作假。",
    },
  ],
  society: [
    {
      headline: "创新实验室未满月，已现脱水",
      body: "星期二诞生之文档《创新实验室》，目录齐全，正文无一字。本报社会版记者探访时，页面正在加载「正在输入」。",
    },
    {
      headline: "张总本周会议十九小时，产出文档零篇",
      body: "社交界称之为「纯呼吸式管理」。据日历披露，其唯一产出为三十二次「嗯嗯好的」。",
    },
  ],
  weather:
    "今日办公气候：会议低压，待办潮湿，文档能见度不足三页。晚间或有突击周报。请携带未完成的承诺出门。",
  classifieds: [
    "寻：愿意把「进行中」改成「已放弃」的勇士。报酬：清静。",
    "转让：未使用的思维导图二百张，可议价，不包打开。",
    "征婚：一个有 owner 的需求。无回复者勿扰。",
    "招领：上周三的结论。遗失在子群里，权限「可阅读」对不上号。",
  ],
  colophon:
    "默哀报 · 复明日集团停尸房承印 · 主笔：验尸官 · 飞书只负责抬出来，AI 负责写悼词 · 本报言论不代表任何还活着的项目",
  source: "demo",
};

export function issueDateLabel(d = new Date()): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const weeks = ["日", "一", "二", "三", "四", "五", "六"];
  const w = weeks[d.getDay()] ?? "";
  const digits = "〇一二三四五六七八九";
  const year = String(y)
    .split("")
    .map((c) => digits[Number(c)] ?? c)
    .join("");
  return `公元${year}年${m}月${day}日 星期${w}`;
}
