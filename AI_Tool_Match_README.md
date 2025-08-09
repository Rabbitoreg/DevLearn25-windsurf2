# AI Tool Match – Conference Game (README)

*A gameful, live, multi‑player simulation where attendees act as an AI agent and pick the right tool for the job.*

---

## 0) Elevator Pitch
In this session, 80–100 participants play an **AI Tool Match** game on their phones/laptops. For each realistic scenario ("prompt"), players pick the best AI tool **card** from a shared deck, each card showing the same set of attributes (strengths/weaknesses). Choices and scores stream into a central database. We show **live leaderboards** (individual + collective) and debrief why certain tools were the better fit. Designed for **L&D professionals**—many are **not coders**.

---

## 1) Audience, Constraints, Success
**Audience:** L&D pros (novice → intermediate tech).  
**Constraints:** 45–60 minutes, 80–100 concurrent users, unpredictable Wi‑Fi, no logins, mobile‑friendly.  
**Success looks like:**
- Participants can articulate how to choose an AI tool given context/constraints.  
- We demonstrate a spectrum: **no‑code → low‑code → vibe‑code → full‑code**.  
- Everyone sees **personal results** and our **collective score**.

---

## 2) Game Overview
**Goal:** For each scenario, pick the best‑fit tool card using attribute trade‑offs.  
**Session Mode:** **Sprint** — a single **5‑minute** timebox. Players progress through scenarios **as fast as they can**. No fixed rounds; each player may answer a different count based on pace.  
**Identity:** Players choose a **codename** (no PII).  
**Outputs:** Individual score, team average, heatmaps of attribute reasoning.

### Two Entry Points
- **Player app** (attendees): `/join` → codename → `/play` (**sprint**) → `/me` (personal results). Minimal UI, quick picks, immediate score + rationale.
- **Admin app** (facilitator/projector): `/admin` shows **sprint status**, **submissions/min**, rolling leaderboards, and attribute heatmaps. **Projector‑friendly** (large type, high contrast) and **auto‑refresh** every 2–3s during the sprint.

### Core Entities
- **Tool Card** – consistent attribute ratings (1–5) + metadata.  
- **Scenario** – a realistic prompt with **target attribute profile** and weights.  
- **Response** – player’s selected tool (+ optional rationale) **plus latency** (reaction time).  
- **Score** – combines **accuracy** (attribute fit) and **speed** (reaction time).

### Attributes (now 10 canonical)
1. **Ease of Use** (novice‑friendly UI)  
2. **Flexibility** (freedom vs. templatized)  
3. **Collaboration** (multi‑user, roles, sharing)  
4. **Privacy/Security** (data retention, SOC2/ISO, PII handling)  
5. **Cost** (free tier, predictable pricing)  
6. **Speed** (latency, reliability)  
7. **Integrations** (LMS/LRS, APIs, SSO, webhooks)  
8. **Code Capability** (no‑code / low‑code / code‑first)  
9. **Application** (1=no‑code, 3=code snippets, 4=complex codebase)  
10. **Accessibility/Compliance** (WCAG, SSO, auditability)

> We can prune to **7–9** for gameplay speed (recommend 1–7 + Application), but keep **Application** for clarity when teaching the spectrum.

---

## 3) Scoring (Sprint mode)
We score each decision on two things—**accuracy** and **speed**. Like an LLM, both matter.

### 3.1 Accuracy (range‑aware)
Attributes mostly use a 1–5 scale; **Application** uses 1–4. Normalize per attribute range to keep things fair.
```
// per attribute a
range[a] = a == 'application' ? 3 : 4  // max possible diff
accuracy = 1 - ( Σ_a W[a] * |R[a] - T[a]| ) / ( Σ_a W[a] * range[a] )
// accuracy ∈ [0,1]
```

### 3.2 Speed (reaction time)
Let `latency` be milliseconds from scenario shown → pick submitted. Convert to a time score with a cap `Tmax` (default **25s**):
```
timeScore = max(0, 1 - latency / (Tmax * 1000))  // ∈ [0,1]
```
> Tweak `Tmax` per scenario difficulty if desired.

### 3.3 Final per‑decision score
Combine with weights (defaults): **α=0.7** accuracy, **β=0.3** speed.
```
finalScore = 100 * ( α * accuracy + β * timeScore )
```
Session score is the mean of a player’s decision scores. Leaderboards can also show **throughput** (decisions/min) for added spice.

---

## 4) Content Model
### Tool Card (JSON)
```json
{
  "id": "cursor",
  "name": "Cursor",
  "category": "vibe-code",
  "ratings": {
    "ease": 3,
    "flexibility": 4,
    "collaboration": 3,
    "privacy": 3,
    "cost": 3,
    "speed": 4,
    "integrations": 4,
    "code": 5,
    "application": 4,
    "a11y": 3
  },
  "notes": "Strong for code-centric workflows; learning curve for non-coders."
}
```

### Scenario (JSON)
```json
{
  "id": "microlearning-generator",
  "title": "Spin up a branded microlearning with quiz by Friday",
  "description": "Designer with limited coding needs to generate microlearning content, publish quickly, and collect xAPI.",
  "targets": {
    "ease": 5,
    "flexibility": 3,
    "collaboration": 4,
    "privacy": 4,
    "cost": 3,
    "speed": 5,
    "integrations": 4,
    "code": 2,
    "application": 1,
    "a11y": 4
  },
  "weights": {
    "ease": 3,
    "speed": 3,
    "integrations": 2,
    "privacy": 2,
    "collaboration": 2,
    "flexibility": 1,
    "cost": 1,
    "code": 1,
    "application": 3,
    "a11y": 2
  }
}
```

---

## 5) Architecture Options (pick one track)
We’ll show a **spectrum** to fit different comfort levels and still converge on the same UX.

### Track A — **No‑Code** (fastest)
- **Data:** Airtable (Tools, Scenarios, Players, Responses).  
- **App:** Softr or Glide for the player UI; Airtable Interface for the facilitator dashboard.  
- **Automation:** Make/Zapier to compute scores and push leaderboards.  
- **Pros:** Minimal setup, friendly UI. **Cons:** Vendor limits, rate caps, trickier real‑time.

### Track B — **Low‑Code**
- **Data:** Supabase (Postgres) or Firebase.  
- **App:** Retool/Appsmith for fast admin + public player page.  
- **Functions:** Serverless scoring endpoint (Supabase Edge / Cloud Functions).  
- **Pros:** Real‑time, SQL power. **Cons:** Light coding required.

### Track C — **Vibe‑Code** (agent‑assisted build)
- **Stack:** Next.js + Supabase + Tailwind + shadcn/ui.  
- **Assistants:** Lovable / Cursor / Replit Agent to scaffold pages, DB, and APIs from the spec below.  
- **Pros:** Custom + fast with AI help. **Cons:** Still engineering; review outputs.

### Track D — **Full‑Code** (most control)
- **Stack:** Next.js or Remix, Supabase/Postgres, Edge Functions, Vercel.  
- **Pros:** Performance, autonomy. **Cons:** Time/complexity.

---

## 6) Data Schema (SQL – Supabase/Postgres)
```sql
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
```

**Privacy:** Only store `codename`; no emails or PII.

---

## 7) API Surface (minimal)
- `POST /join` → `{ codename }` ⇒ `{ playerId }`
- `POST /scenario/next` → returns the next scenario for this player: `{ scenario, startedAt }`
- `POST /pick` → `{ playerId, scenarioId, toolId, presentedAt, submittedAt, rationale? }` ⇒ `{ accuracy, timeScore, score }`
- `GET /me` → personal history + score
- `GET /leaderboard` → top N + team average
- `GET /heatmap` → aggregate attribute mismatches across all answered scenarios
- `GET /admin/summary` → aggregated results for projector (sprint status, submissions/min, leaderboard, heatmap)

> For Track A (no‑code): emulate with Airtable forms and automations; for Track B–D, expose these directly.

---

## 8) Live Session Run‑of‑Show (ROS)
**T‑10 min:** Project the **/admin** dashboard and display a QR code to **/join**. Attendees pick codenames.

**Sprint (5 minutes, no fixed rounds):**
1. Facilitator presses **Start Sprint** (clock counts down from 5:00).  
2. Players receive Scenario A immediately; on submit they get the **next** scenario.  
3. Each pick is auto‑scored: **accuracy** + **speed** (reaction time).  
4. Admin shows: submissions/min, median accuracy, median latency, rolling leaderboard.

**Finish:** At 0:00, lock new scenarios; let active submissions finish (≤10s grace). Show overall leaderboard, throughput, and attribute heatmap → debrief.

**Offline fallback:** Paper cards + Google Form (scenario → tool choice + self‑timestamp). Apps Script computes scores and streams a simple leaderboard.

---

## 9) UX Notes
- **Mobile‑first** layout; one‑tap select; high‑contrast; WCAG AA.  
- **No login.** Store `playerId` in local storage.  
- **Fast feedback**: score confetti + short “why” snippet.  
- **Accessibility:** semantic HTML, ARIA on timer, keyboard shortcuts.

---

## 10) Facilitator Dashboard
- Start/stop **Sprint**; show **time remaining**.  
- Live metrics: submissions/min, active players, median accuracy, median latency.  
- Leaderboard (avg score, picks count) and heatmap by attribute.  
- Pause to insert “teach moments” (why one tool outscored another).

---

## 11) Builder Prompt (for vibe‑coding tools)
Paste the following into Lovable/Cursor/Replit Agent to scaffold Track C:

```
Build a mobile-first web app called "AI Tool Match" using Next.js + Supabase.
Session mode is **Sprint**: a single 5-minute timebox with continuous scenarios (no fixed rounds).
Features: join with codename (no PII), scenario feed (`POST /scenario/next`), per-decision scoring with accuracy (range-aware) and speed (latency vs Tmax=25s), live leaderboard, personal results.
Add the **Application** attribute (1,3,4 scale) alongside other attributes in tools/scenarios.
Create tables per README §6. Implement endpoints per §7 using Next.js Route Handlers. Host on Vercel. Use Tailwind + shadcn/ui.
Pages: /join, /play, /me, /leaderboard, /admin. Admin: projector-friendly, auto-refresh.
Accessibility: WCAG AA, timer ARIA live region.
```

---

## 11.1) Vibe‑Coding Standards (naming, debugging, agent guardrails)
**Keep content (tools/scenarios) separate from code.** Store decks in `/content/*.json` or Airtable.

### Naming conventions
- **Files/folders:** `kebab-case` for files (`tool-card.tsx`), `kebab-case` routes (`/admin/summary`).  
- **DB tables:** `snake_case` (`session_scenarios`). Columns: `snake_case`.
- **Types/interfaces:** `PascalCase` (`ToolCard`, `ScenarioTarget`).  
- **Env vars:** `SCREAMING_SNAKE_CASE` (`NEXT_PUBLIC_SUPABASE_URL`).
- **Commits:** `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.

### Project structure (Track C/D)
```
/content           # JSON packs (deck.tools.json, scenarios.json)
/app               # Next.js routes
  /join /play /me /leaderboard /admin
/lib               # scoring, validation, analytics
/components        # UI (card, timer, leaderboard)
/db                # SQL, migrations, seed scripts
```

### Debugging & quality
- **Config flags:** `NEXT_PUBLIC_DEBUG=1` toggles a debug panel (latency, payloads).  
- **Logging:** client → `console.debug/info/error`; server → structured logs.  
- **Validation:** Zod schemas for all API payloads; reject invalid picks.  
- **Tests:** unit tests for scoring (golden vectors), API smoke tests.  
- **Observability:** capture `latency_ms`, `accuracy`, `time_score` per decision.

### Agent (vibe‑coding) guardrails
- Start each agent session with a **system prompt** that includes:  
  1) **Scope** (Sprint mode, endpoints, schema).  
  2) **No secrets**: never write real keys to repo.  
  3) **File boundaries**: edits limited to requested files.  
  4) **Checklists**: create tests when changing scoring.
- Use **diff mode** and review before applying.  
- After generation, run `npm run typecheck && npm run test`.

---

## 12) Content Authoring
- Keep attribute definitions crisp (one‑sentence rubric per level 1–5).  
- Limit deck to **8–12 tools** across no‑code → code spectrum.  
- Scenarios: 4–6; each emphasizes different constraints (privacy, speed, budget, collaboration, integration).

**Attribute rubrics (draft):**
- **Ease:** 1=expert‑only, 3=guided UI, 5=novice‑friendly.  
- **Flexibility:** 1=rigid templates, 3=configurable, 5=highly extensible.  
- **Collaboration:** 1=single user, 3=share links, 5=roles + real‑time.  
- **Privacy:** 1=unknown retention, 3=policy controls, 5=enterprise‑grade.  
- **Cost:** 1=unpredictable, 3=affordable tier, 5=free/low fixed.  
- **Speed:** 1=often slow, 3=usually fast, 5=near‑instant.  
- **Integrations:** 1=few, 3=webhooks/API, 5=rich ecosystem.  
- **Code:** 1=no‑code only, 3=low‑code extensibility, 5=code‑first.  
- **Application:** **1=no‑code**, **3=code snippets**, **4=complex codebase** *(note: 1–4 scale).*  
- **A11y:** 1=unknown, 3=basic compliance, 5=audited + docs.

---

## 12.1) Tool Deck (Content Pack) — **Keep separate from app code**
**Important:** Maintain the tool deck as **content**, not code, so it’s easy to update per audience/market.  
- **Track A (No‑Code):** Airtable table **`Tools`** with columns: `id`, `name`, `category`, `ratings` (JSON), `notes`.  
- **Track B–D (Low/Vibe/Full‑Code):** Store at **`/content/deck.tools.json`**. Load at runtime (edge function or static fetch). Avoid bundling into the app to allow **hot‑swaps without redeploy**.

### tools.json (draft, 10 items)
```json
[
  {
    "id": "softr",
    "name": "Softr",
    "category": "no-code",
    "ratings": {"ease": 5, "flexibility": 3, "collaboration": 4, "privacy": 3, "cost": 4, "speed": 4, "integrations": 4, "code": 1, "application": 1, "a11y": 3},
    "notes": "Airtable-first site/app builder; great for non-coders and fast MVPs."
  },
  {
    "id": "glide",
    "name": "Glide",
    "category": "no-code",
    "ratings": {"ease": 5, "flexibility": 3, "collaboration": 3, "privacy": 3, "cost": 4, "speed": 4, "integrations": 3, "code": 1, "application": 1, "a11y": 3},
    "notes": "Spreadsheet → mobile/web apps quickly; excellent for forms and lists."
  },
  {
    "id": "bubble",
    "name": "Bubble",
    "category": "no-code",
    "ratings": {"ease": 3, "flexibility": 5, "collaboration": 3, "privacy": 3, "cost": 3, "speed": 3, "integrations": 4, "code": 2, "application": 1, "a11y": 2},
    "notes": "Highly flexible no-code web apps; steeper learning curve."
  },
  {
    "id": "retool",
    "name": "Retool",
    "category": "low-code",
    "ratings": {"ease": 3, "flexibility": 4, "collaboration": 4, "privacy": 4, "cost": 3, "speed": 4, "integrations": 5, "code": 3, "application": 3, "a11y": 3},
    "notes": "Internal tools rapidly from data sources; JS when needed."
  },
  {
    "id": "appsmith",
    "name": "Appsmith",
    "category": "low-code",
    "ratings": {"ease": 3, "flexibility": 4, "collaboration": 3, "privacy": 4, "cost": 4, "speed": 4, "integrations": 4, "code": 3, "application": 3, "a11y": 3},
    "notes": "Open-source low-code for internal tools; self-host option."
  },
  {
    "id": "lovable",
    "name": "Lovable",
    "category": "vibe-code",
    "ratings": {"ease": 4, "flexibility": 4, "collaboration": 3, "privacy": 3, "cost": 3, "speed": 4, "integrations": 3, "code": 4, "application": 4, "a11y": 3},
    "notes": "Agent-assisted app builder that outputs editable codebases."
  },
  {
    "id": "cursor",
    "name": "Cursor",
    "category": "vibe-code",
    "ratings": {"ease": 3, "flexibility": 4, "collaboration": 3, "privacy": 3, "cost": 3, "speed": 4, "integrations": 4, "code": 5, "application": 4, "a11y": 3},
    "notes": "AI-first IDE; strong for code-centric workflows and refactors."
  },
  {
    "id": "replit-agent",
    "name": "Replit Agent",
    "category": "vibe-code",
    "ratings": {"ease": 4, "flexibility": 4, "collaboration": 4, "privacy": 3, "cost": 3, "speed": 4, "integrations": 3, "code": 4, "application": 4, "a11y": 3},
    "notes": "Cloud IDE with AI agent; multiplayer dev experience."
  },
  {
    "id": "copilot",
    "name": "GitHub Copilot",
    "category": "code",
    "ratings": {"ease": 4, "flexibility": 5, "collaboration": 4, "privacy": 4, "cost": 3, "speed": 5, "integrations": 5, "code": 5, "application": 4, "a11y": 3},
    "notes": "AI pair programmer inside mainstream IDEs; strong ecosystem."
  },
  {
    "id": "vercel-v0",
    "name": "Vercel v0",
    "category": "vibe-code",
    "ratings": {"ease": 4, "flexibility": 3, "collaboration": 3, "privacy": 3, "cost": 3, "speed": 4, "integrations": 4, "code": 4, "application": 4, "a11y": 3},
    "notes": "UI generator that outputs React/Next components; good handoff to devs."
  }
]
```

**Calibration note:** Ratings are **draft** and intentionally coarse to spark discussion. In rehearsal, run 2–3 calibration scenarios and nudge numbers (±1) until the **top‑1** pick matches expert consensus.

---

## 13) Deployment & Scaling
- **Hosting:** Vercel (Track C/D) or platform defaults (A/B).  
- **Concurrency:** 100 users → avoid per‑request cold starts; pre‑warm **scenario endpoints**.  
- **Real‑time:** Supabase Realtime or poll every 2–3s during sprint.  
- **Caching:** Static deck; serverless cache for leaderboard.

---

## 14) Testing Plan
- **Load test**: synthetic users (50/100) submit within 10s window.  
- **Data validation**: ensure no duplicate codenames within session.  
- **Scoring**: golden test vectors (tool, scenario → expected score).  
- **Accessibility**: keyboard‑only pass + screen reader spot‑checks.

---

## 15) Security/Privacy
- No accounts, no emails.  
- Rate‑limit `/pick`.  
- Store IP hash only if abuse emerges (configurable).  
- Data retention: purge raw responses after 30 days; keep aggregates.

---

## 16) Roadmap
- Explanations: auto‑generate a one‑liner “why this tool fits” from attribute diffs.  
- Team mode: table vs. table.  
- Custom decks by organization.  
- Export to CSV/xAPI for LRS demo.

---

## 17) Quick Start (with content packs)
**Common prep**  
- Create a folder **`/content`** in your repo.  
- Place `deck.tools.json` and `scenarios.json` in `/content` (keep content separate from code).  
- For Tracks **B–D**: set env for Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), run SQL in §6.  
- For Track **A**: create Airtable tables (Tools, Scenarios, Players, Responses); import JSON as CSV or paste.

**Track A (No‑Code in ~60–90 min)**  
1) Airtable base with 4 tables (match §6 fields).  
2) Import `deck.tools.json` → Tools; `scenarios.json` → Scenarios.  
3) Build a Softr/Glide app: `/join` (form) → `/play` (card picker) → `/me` (results).  
4) Automation (Make/Zapier): compute score on submit; update leaderboard.  
5) Airtable Interface for **/admin** dashboard (submissions/min, leaderboard, heatmap).

**Track C (Vibe‑Code in ~90–120 min)**  
1) Create a project (Lovable/Cursor/Windsurf). Paste the **Builder Prompt** (§11).  
2) Add `/content/deck.tools.json` and `/content/scenarios.json`.  
3) Implement minimal endpoints (§7). Use §3 formulas in `/lib/scoring` and import in API.  
4) `npm i && npm run dev` (local).  
5) Deploy to Vercel. Test **/join**, **/play**, **/admin** with 3–5 users.

**Track D (Full‑Code)**  
Same as Track C, but hand‑write pages/components; keep content in `/content` and avoid bundling it.

---

## 18) Facilitator Checklist
- [ ] QR code to /join  
- [ ] Deck seeded; scenarios reviewed  
- [ ] Timer tested; leaderboard live  
- [ ] Offline fallback form ready  
- [ ] Debrief slides with attribute heatmap

---

## 19) License & Credits
MIT © Your Name. Educational demo for conference use. Replace example tools/scenarios with your own content as needed.

---

## 20) IDE Playbooks: Lovable, Cursor, Windsurf
### Lovable
1. **New Project ➜ Web App (Next.js)** and paste the **Builder Prompt** (§11).  
2. Add **`/content/deck.tools.json`** and **`/content/scenarios.json`**.  
3. Ask: *“Create types for ToolCard and Scenario. Build `/lib/scoring.ts` using §3. Scaffold API routes from §7.”*  
4. Ask: *“Wire `/join`, `/play`, `/me`, `/admin` pages. Use Tailwind + shadcn/ui. Add ARIA live region for the timer.”*  
5. Review diffs; ensure no secrets are written. Run `npm run typecheck && npm run test`.  
6. **Deploy** to Vercel from Lovable; verify two entry points.

### Cursor
1. Open folder in **Cursor**. Create `/content/*` and paste the JSON files.  
2. In **Composer**, paste §11 prompt + local constraints (naming in §11.1).  
3. Ask: *“Generate `/lib/scoring.ts` from §3 and Zod schemas for API payloads.”*  
4. Ask: *“Implement Next.js Route Handlers for §7. Read content from `/content` at runtime.”*  
5. Use **Chat** to iteratively fix types and add UI components. Run `npm run dev`.  
6. Commit with conventional messages (feat/fix/docs); deploy to Vercel.

### Windsurf
1. Create a **workspace**; set the **goal**: *Sprint game with JSON content packs.*  
2. Drop in `/content/deck.tools.json` and `/content/scenarios.json`.  
3. Use the **Agent** to scaffold `/lib/scoring.ts`, pages, and APIs per §§3,7,11.  
4. Apply guardrails from §11.1 (no secrets, file boundaries, tests).  
5. Run tasks: install, typecheck, tests, dev server; iterate on errors via agent suggestions.  
6. Push to GitHub, then deploy to Vercel.

**Tip:** In all tools, pin the **system prompt** with scope + guardrails; always review diffs before applying.
