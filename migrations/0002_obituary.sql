create table if not exists feishu_connections (
  user_id text primary key,
  app_id text not null default '',
  app_secret text not null default '',
  bitable_app_token text not null default '',
  bitable_table_id text not null default '',
  name_field text not null default '项目名',
  owner_field text not null default '负责人',
  status_field text not null default '状态',
  updated_field text not null default '最后更新',
  deadline_field text not null default '截止日期',
  webhook_url text not null default '',
  folder_token text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists editions (
  id serial primary key,
  user_id text not null,
  issue_no integer not null default 1,
  company_name text not null default '',
  source text not null default 'demo',
  body jsonb not null,
  feishu_doc_token text,
  feishu_webhook_sent boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists editions_user_id_idx on editions (user_id);
