-- AI Tool Match Database Schema
-- Run this in your Supabase SQL editor

-- Tools
create table tools (
  id text primary key,
  name text not null,
  category text not null check (category in ('no-code','low-code','vibe-code','code')),
  ratings jsonb not null,
  notes text
);

-- Scenarios
create table scenarios (
  id text primary key,
  title text not null,
  description text not null,
  targets jsonb not null,
  weights jsonb not null
);

-- Session (for a single conference run)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  name text,
  mode text default 'sprint' check (mode in ('sprint','rounds')),
  duration_seconds int default 300, -- 5-minute sprint
  created_at timestamptz default now(),
  facilitator_pin text
);

-- Players
create table players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  codename text not null,
  created_at timestamptz default now()
);
create index on players(session_id);

-- Optional: if doing fixed rounds (not used in sprint mode)
create table rounds (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  scenario_id text references scenarios(id),
  starts_at timestamptz,
  ends_at timestamptz
);
create index on rounds(session_id);

-- Session → Scenario pool (for sprint mode)
create table session_scenarios (
  session_id uuid references sessions(id) on delete cascade,
  scenario_id text references scenarios(id),
  weight int default 1,
  primary key (session_id, scenario_id)
);

-- Responses (each decision)
create table responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  scenario_id text references scenarios(id),
  tool_id text references tools(id),
  presented_at timestamptz,
  submitted_at timestamptz default now(),
  latency_ms int, -- reaction time
  accuracy numeric, -- 0..1
  time_score numeric, -- 0..1
  score numeric -- 0..100 final
);
create index on responses(session_id);
create index on responses(player_id);
create index on responses(scenario_id);

-- Materialized views for quick leaderboards
create materialized view leaderboard as
select p.codename,
       avg(r.score) as avg_score,
       count(*) as picks,
       avg(r.latency_ms) as avg_latency_ms
from responses r
join players p on p.id = r.player_id
group by p.codename;

-- Insert a default session for testing
insert into sessions (id, name, mode, duration_seconds) 
values ('00000000-0000-0000-0000-000000000000', 'Default Session', 'sprint', 300);

-- Enable Row Level Security (optional)
alter table sessions enable row level security;
alter table players enable row level security;
alter table responses enable row level security;

-- Create policies for public access (adjust as needed)
create policy "Allow public read access on sessions" on sessions for select using (true);
create policy "Allow public insert/update on sessions" on sessions for all using (true);

create policy "Allow public read access on players" on players for select using (true);
create policy "Allow public insert/update on players" on players for all using (true);

create policy "Allow public read access on responses" on responses for select using (true);
create policy "Allow public insert/update on responses" on responses for all using (true);
