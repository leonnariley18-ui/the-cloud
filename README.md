# cLOUD

**your terpene journal**

A personal strain tracking app built for one — logging cops, sessions, mixes, experiences, and insights from every blunt. Built with React + Vite, hosted on GitHub Pages, persisted with Supabase.

---

## what it does

cLOUD is a private journal for tracking every strain you smoke. Log what you copped, rate your first session, track mixes, capture experiences, and build up a personal library of insights over time — terpene affinities, type breakdowns, bedtime patterns, brand preferences, and more.

### core features

- **re-ups** — group strains by haul (max 2 open at a time). auto-closes when every strain in the batch is finished.
- **cop flow** — log strain name, type, source, terpenes, grow type, first impression. supports TL, dispensary (bag or jar with indoor / greenhouse / outdoor grown), and street sources.
- **first session** — rate 1–5 leaves, set body + mind spectrums (7-notch), tag taste + vibes, toggle bedtime, write session notes.
- **on hand** — strains move here after first session. add notes, log experiences, mix with other on-hand strains.
- **experiences** — capture notable smokes with setting (indoor/outdoor), bedtime toggle, vibe tags, and notes. dual-stored when mixed.
- **mixes** — log any two on-hand strains together. full rating + spectrums. dual-stored on both strains. rate now or queue for later.
- **notes** — quick thoughts while a strain is on hand. editable and deletable. locks when finished.
- **starring** — star strains you can't stop thinking about. powers the suggestions tab.
- **finishing** — mark a cop done. cop-again answer can be updated one final time. everything locks after.

### library

- **⭐ starred** — your favorites at a glance
- **✨ suggestions** — strains recommended based on parent genetics of your starred + 5-leaf strains
- **search** — full-text across names, parents, terpenes, taste, vibes, notes, experiences, and mix notes
- **filters** — cop-again (yes/maybe), min rating (3+/4+/5+), month (dynamic — only shows months you have data for)
- **mixes** — all reviewed mixes sorted by rating
- **legacy** — strains smoked before cLOUD existed, organized by notes and cop-again status
- **insights** — terpenes, types, brands, 🌿 outdoor report, 🌙 bedtime report

### insights

- **terpenes** — avg rating + cop-again % per terpene, toggleable between pure sessions and mixes
- **types** — indica / sativa / hybrid breakdown with ratings
- **brands** — avg rating, cop-again breakdown, and 🌱 grow type preference (indoor vs greenhouse vs outdoor)
- **🌿 outdoor** — dedicated outdoor session report
- **🌙 bedtime** — best bedtime strains, terpene affinity, and a 😬 wrong call list (marked bedtime but hit active or wired)

---

## tech stack

| layer | tool |
|---|---|
| framework | React 18 |
| bundler | Vite |
| charts | Recharts |
| database | Supabase (PostgreSQL) |
| auth | PIN-based (SHA-256 hashed) |
| hosting | GitHub Pages |

---

## project structure

```
the-cloud/
├── public/
│   ├── icon.png          # app icon (PWA)
│   └── manifest.json     # PWA manifest
├── src/
│   ├── App.jsx           # main app (all components + logic)
│   ├── PinAuth.jsx       # PIN login + create screen
│   ├── supabase.js       # supabase client
│   └── main.jsx          # root — auth wrapper + data persistence
├── .env.local            # supabase keys (not committed)
├── index.html
└── vite.config.js
```

---

## supabase schema

```sql
create table users (
  id uuid default gen_random_uuid() primary key,
  pin_hash text not null unique,
  created_at timestamp default now()
);

create table app_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade unique,
  data jsonb not null default '{}',
  updated_at timestamp default now()
);

alter table users disable row level security;
alter table app_data disable row level security;
```

Data is stored as a single JSON blob per user — deeply nested state (strains → cops → sessions → experiences → mixes → notes) is simpler as one document than across relational tables for a single-user app.

---

## environment variables

Create `.env.local` in the project root (never commit this):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## development

```bash
npm run dev       # local dev server
npm run build     # production build
npm run deploy    # build + push to gh-pages branch
```

---

## deployment

Hosted on GitHub Pages via the `gh-pages` branch. Deploy with:

```bash
npm run deploy
```

Then: GitHub repo → Settings → Pages → source: `gh-pages` branch.

Live at: `https://yourusername.github.io/the-cloud/`

---

## installing on device

**Android (Chrome)**
1. Open Chrome → navigate to the app URL
2. Tap ⋮ menu → Add to Home Screen → Add

**Chromebook (Chrome)**
1. Open Chrome → navigate to the app URL
2. Click the install icon in the address bar → Install

**iPhone/iPad (Safari only)**
1. Open Safari → navigate to the app URL
2. Tap Share → Add to Home Screen → Add

---

## data model

```
strain
  └── cops[]
        ├── session        (first smoke — rating, spectrums, tags, notes)
        ├── experiences[]  (notable follow-up smokes)
        ├── mixes[]        (blends with other strains — dual-stored via sharedId)
        └── notes[]        (quick thoughts — on-hand only)

legacyStrains[]            (pre-cLOUD history — name, cop-again, notes)
coppedEntries[]            (copped but not yet smoked)
onHand[]                   (smoked, still have some)
mixQueue[]                 (mixes queued for review)
reups[]                    (open hauls — max 2)
finishedReups[]            (closed hauls — max 5 shown on home)
```

---

## auth flow

1. First visit → create a 4-digit PIN
2. PIN is hashed with SHA-256 + a salt before storing in Supabase
3. Session stored in `sessionStorage` — closing the tab requires re-entry
4. Data auto-saves to Supabase 2 seconds after any change (debounced)

---

*built in one conversation. logged with love.*
