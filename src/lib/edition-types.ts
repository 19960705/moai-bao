export type Obituary = {
  id: string;
  name: string;
  ageLabel: string;
  owner: string;
  cause: string;
  lastWords: string;
  epitaph: string;
  nextOfKin: string;
  portraitUrl: string;
  status: string;
  daysSilent: number;
};

export type CrimeItem = {
  charge: string;
  accused: string;
  evidence: string;
};

export type SocietyItem = {
  headline: string;
  body: string;
};

export type Edition = {
  issueNo: number;
  dateLabel: string;
  companyName: string;
  kicker: string;
  headline: string;
  lede: string;
  obituaries: Obituary[];
  crime: CrimeItem[];
  society: SocietyItem[];
  weather: string;
  classifieds: string[];
  colophon: string;
  source: "demo" | "feishu";
};

export type Corpse = {
  id: string;
  name: string;
  owner: string;
  status: string;
  lastActive: string | null;
  deadline: string | null;
  notes: string;
  source: "demo" | "feishu";
};

export type FeishuPublicConnection = {
  configured: boolean;
  appIdMasked: string;
  bitableAppToken: string;
  bitableTableId: string;
  nameField: string;
  ownerField: string;
  statusField: string;
  updatedField: string;
  deadlineField: string;
  webhookConfigured: boolean;
  folderConfigured: boolean;
};
