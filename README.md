# cLOUD

**your terpene journal**

A personal strain tracking app built for one — logging cops, sessions, mixes, experiences, and insights from every blunt. Built with React + Vite, hosted on GitHub Pages, persisted with Supabase.

---

## what it does

cLOUD is a private journal for tracking every strain you smoke. Log what you copped, rate your first session, track mixes, capture experiences, and build up a personal library of insights over time — terpene affinities, type breakdowns, bedtime patterns, brand preferences, and more.

### core features

- **re-ups** — group strains by haul (max 2 open at a time). auto-closes when every strain in the batch is finished.
- **cop flow** — log strain name, type, lean, source, terpenes, parent strains, and grow type. supports TL, dispensary (bag or jar, indoor / greenhouse / outdoor grown), and street sources. first impressions live in notes — no dedicated field.
- **first session** — rate 1–5 leaves, set body + mind spectrums (7-notch couch-locked↔active, dreamy↔analytical), smooth↔harsh pull, setting, bedtime toggle, vibe + taste tags in one categorized picker, session notes, cop-again.
- **on hand** — strains move here after first session. add notes, log experiences, mix with other on-hand strains.
- **experiences** — capture notable smokes with setting (indoor/outdoor), bedtime toggle, vibe tags, and notes. dual-stored on both strains when mixed.
- **mixes** — intentional 50/50 blends with another on-hand strain. full rating + spectrums. dual-stored on both strains via sharedId. rate now or queue for later. bedtime toggle available. a logged mix is a deliberate creative decision — not a salad situation.
- **notes** — quick thoughts while a strain is on hand. editable and deletable. locks when finished. the primary capture tool for short cops.
- **starring** — star strains you can't stop thinking about. powers the suggestions tab.
- **unknown lineage** — mark a strain's lineage as genuinely unknown (not just unfilled). excludes from suggestions.
- **finishing** — mark a cop done. cop-again answer can be updated one final time. everything locks after. finishedDate recorded.

### vibe + taste tags

one categorized picker — six emoji categories:
- 🏃 body / activity: bed mode, couch-locked, clean mode, get things done, restless, IDGAF mode
- 🧠 mental: deep thinking, creative flow, music dive, zoned out, laser focused
- 💬 social: conversational, giggly, hang out, quiet mode
- ✨ sensory: munchies, music hits different, body high, pain relief, full-body euphoria, horny, connected to nature, dream-inducing, funny inner-dialogue
- 📊 mood: uplifted, cozy, sleepy, energized, anxious, paranoid, IDGAF mode
- 👅 taste: earthy, citrus, pine, sweet, gassy, skunky, floral, peppery, berry, diesel, tropical, minty, woody, spicy

taste tags save separately to `tasteTags` and display as terracotta pills. vibe tags save to `vibeTags` and display as neutral pills. same picker, visually distinct output.

### library

- **⭐ starred** — your favorites at a glance
- **✨ suggestions** — strains recommended based on parent genetics of starred + 5-leaf strains. excludes unknown lineage strains.
- **search** — full-text across names, parents, terpenes, taste, vibes, notes, experiences, and mix notes
- **filters** — cop-again (yes/maybe), min rating (3+/4+/5+), month (dynamic — only shows months you have data for)
- **mixes** — all reviewed mixes sorted by rating
- **legacy** — 31 strains smoked before cLOUD existed. organized into strains + notes (detailed cards) and also loved (name grid). never-again strains shown as red pills.
- **insights** — terpenes, types, brands, 🌿 outdoor report, 🌙 bedtime report

### insights

- **terpenes** — avg rating + cop-again % per terpene, toggleable between pure sessions and mixes
- **types** — indica / sativa / hybrid breakdown with ratings
- **brands** — avg rating, cop-again breakdown, TL vs dispensary comparison, and 🌱 grow type preference (indoor vs greenhouse vs outdoor — only shows types with data)
- **🌿 outdoor** — dedicated outdoor session report
- **🌙 bedtime** — best bedtime strains, terpene affinity, and a 😬 wrong call list (marked bedtime but spectrums or vibes contradict it)

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
        ├── session        (first smoke — rating, spectrums, tags, notes, bedtime)
        ├── experiences[]  (notable follow-up smokes — dual-stored when mixed)
        ├── mixes[]        (intentional 50/50 blends — dual-stored via sharedId)
        └── notes[]        (quick thoughts — on-hand only, locks after finished)

legacyStrains[]            (pre-cLOUD history — name, cop-again, source, notes)
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

## next update — planned features

everything below is designed, mockuped, and ready to build. scheduled after current on-hand strains are finished.

**cop form — two new fields at the very top**

intent (☀️ awake / 🌙 asleep / 🏕️ adventure) and amount copped (8th / quarter / half / oz). both optional and skippable. intent reflects what you're copping the strain *for* — productive daytime use, winding down, or outdoor adventure. adventure is seasonal in NYC but lives in the form year-round. amount is pure data for now with no behavior changes — it'll reveal patterns over time (do 8ths skew toward "maybe"? do larger cops rate higher?).

**active page — intent badge on on-hand cards**

☀️ / 🌙 / 🏕️ shows at a glance next to the strain name. tonight's decision answered before you even open the strain detail.

**library — new "compare" tab**

side-by-side comparison of any two logged strains (not legacy). shows intent badges, ratings + context, body + mind spectrums on a shared visual axis, terpenes in three columns (A only / shared / B only), vibe tags split by overlap, your actual session notes side by side, a re-up pairing verdict (complementary or redundant), and a plain-english "the read" synthesis at the bottom.

**insights — terpene cop recommender**

filtered by intent (awake / asleep / adventure / overall). surfaces your top terpenes and winning terpene combos for each use case, with a plain-english shopping tip: "when you cop for [intent], look for [terpene combo]." gets smarter every cop. this is the app working as a self-knowledge engine — your data telling you what to look for at the point of purchase.

**what the first month of data revealed**

the session form is never the problem — every first session is rich and deliberate regardless of cop size. notes are the real short-cop logging gesture, used naturally without prompting. mixes are intentional 50/50 decisions, not leftovers — the mix library grows slowly and that's correct. 8ths rarely produce experiences or mixes, quarters and up generate the longitudinal data the app is designed around. intent + amount are the two missing dimensions — every other field already exists. once logged, they unlock the recommender and give the comparison view its pairing verdict.

---

*built in one conversation. one month of real data. logged with love.*
