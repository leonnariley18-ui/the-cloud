# cLOUD

**your terpene journal**

A personal strain tracking app built for one — logging cops, sessions, mixes, experiences, and insights from every blunt. Built with React + Vite, hosted on GitHub Pages, persisted with Supabase.

---

## what it does

cLOUD is a private journal for tracking every strain you smoke. Log what you copped, rate your first session, track mixes, capture experiences, and build up a personal library of insights over time — terpene affinities, type breakdowns, bedtime patterns, brand preferences, and more.

### core features

- **re-ups** — group strains by haul (max 2 open at a time). auto-closes when every strain in the batch is finished.
- **cop flow** — log strain name, type, lean, source, terpenes, parent strains, and grow type. supports TL, dispensary (bag or jar, indoor / greenhouse / outdoor grown), and street sources.
- **intent** — set once per strain, locks like starring. ☀️ awake / 🌙 asleep / 🏕️ adventure. shows as a badge on on-hand and ready-to-try cards. powers the intent insight tab and enriches bedtime + outdoor reports.
- **amount copped** — set once per cop, locks. 8th / quarter / half / oz. pure data for now, patterns emerge over time.
- **first session** — rate 1–5 leaves, set body + mind spectrums (7-notch couch-locked↔active, dreamy↔analytical), smooth↔harsh pull, setting, bedtime toggle, vibe + taste tags in one categorized picker, session notes, cop-again.
- **on hand** — strains move here after first session. add notes, log experiences, mix with other on-hand strains.
- **experiences** — capture notable smokes with setting (indoor/outdoor), bedtime toggle, vibe tags, and notes. dual-stored on both strains when mixed.
- **mixes** — intentional 50/50 blends with another on-hand strain. full rating + spectrums. dual-stored on both strains via sharedId. rate now or queue for later. bedtime toggle available. a logged mix is a deliberate creative decision — not a salad situation.
- **notes** — quick thoughts while a strain is on hand. editable and deletable. locks when finished. the primary capture tool for short cops.
- **starring** — star strains you can't stop thinking about. powers the suggestions tab.
- **unknown lineage** — mark a strain's lineage as genuinely unknown. excludes from suggestions.
- **finishing** — mark a cop done. cop-again answer can be updated one final time. everything locks after. finishedDate recorded.

### vibe + taste tags

one categorized picker — six emoji categories:
- 🏃 body / activity: bed mode, couch-locked, clean mode, get things done, restless, IDGAF mode
- 🧠 mental: deep thinking, creative flow, music dive, zoned out, laser focused
- 💬 social: conversational, giggly, hang out, quiet mode
- ✨ sensory: munchies, music hits different, body high, pain relief, full-body euphoria, horny, connected to nature, dream-inducing, funny inner-dialogue
- 📊 mood: uplifted, cozy, sleepy, energized, anxious, paranoid, IDGAF mode
- 👅 taste: earthy, citrus, pine, sweet, gassy, skunky, floral, peppery, berry, diesel, tropical, minty, woody, spicy

taste tags save to `tasteTags` (terracotta pills). vibe tags save to `vibeTags` (neutral pills). same picker, visually distinct output.

### library

- **⭐ starred** — your favorites at a glance
- **✨ suggestions** — strains recommended based on parent genetics of starred + 5-leaf strains. excludes unknown lineage.
- **search** — full-text across names, parents, terpenes, taste, vibes, notes, experiences, and mix notes
- **filters** — cop-again (yes/maybe), min rating (3+/4+/5+), month (dynamic)
- **mixes** — all reviewed mixes sorted by rating
- **legacy** — 31 strains smoked before cLOUD. strains + notes (detailed cards) and also loved (name grid). never-again as red pills.
- **insights** — terpenes, types, brands, 🌿 outdoor, 🌙 bedtime, 🎯 intent

### insights

- **terpenes** — avg rating + cop-again % per terpene, toggleable between pure sessions and mixes
- **types** — indica / sativa / hybrid breakdown with ratings
- **brands** — avg rating, cop-again breakdown, TL vs dispensary, 🌱 grow type preference (indoor vs greenhouse vs outdoor)
- **🌿 outdoor** — outdoor sessions AND adventure-intent cops combined. your full outdoor picture.
- **🌙 bedtime** — best bedtime strains (with 🎯 intent confirmed badge where asleep intent + bedtime toggle both set), terpene affinity, 😬 wrong call list
- **🎯 intent** — per-intent breakdown: cop count, avg rating, yes/maybe/no, top terpenes. only renders cards with data. gets richer as intent is backfilled and new cops are tagged.

---

## why the codebase is small

1,500 lines in a single file for everything this app does. for context, a typical production app with this many features would be 5,000–15,000+ lines across 20–40 files. cLOUD stays lean because:

- everything inline — no CSS files, no style imports, styles written directly on elements
- no component library — every component (Leaf, Pill, SpectrumSlider, TagSelector etc.) is custom-built and does exactly what's needed
- Supabase replaces an entire backend — no server code, no API routes, no schema migrations
- single file architecture — works perfectly for a solo personal app
- JSON blob data model — no relational query logic, no ORM
- built for exactly one person — no permissions, no multi-tenancy, no internationalisation

V2 will likely grow to 3,000–4,000 lines split across multiple files as the app gets separate pages. still lean by any standard.

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
│   ├── App.jsx           # main app — all components + logic (single file, ~1500 lines)
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

**will Supabase need updating for V2?** No schema changes needed. The JSON blob structure is flexible by nature — new fields (intent, amount, savedComparisons, savedTips) just get added to the blob without any SQL migrations. The only Supabase work for V2 is potentially adding a keep-alive GitHub Actions ping if the free tier starts pausing.

---

## environment variables

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## development + deployment

```bash
npm run dev       # local dev server (run in Codespaces)
npm run build     # production build
npm run deploy    # build + push to gh-pages branch
```

**codespace workflow for updates:**
1. open github.com → the-cloud repo → Code → Codespaces → reopen existing codespace
2. update `src/App.jsx` with new code
3. run `npm run deploy` in the terminal
4. wait 2-3 minutes, hard refresh the app on your device

**V2 codespace work:** when the app splits into multiple files (App.jsx, Home.jsx, Stash.jsx, Compare.jsx, Recommender.jsx etc.), the deployment process stays identical — `npm run deploy` handles everything. file structure change is internal only.

---

## installing on device

**Android (Chrome):** ⋮ menu → Add to Home Screen

**Chromebook (Chrome):** install icon in address bar → Install

**iPhone/iPad (Safari only):** Share → Add to Home Screen

---

## data model

```
strain
  ├── intent              (☀️ awake / 🌙 asleep / 🏕️ adventure — set once, locked)
  └── cops[]
        ├── amount        (8th / quarter / half / oz — set once, locked)
        ├── session        (first smoke — rating, spectrums, tags, notes, bedtime)
        ├── experiences[]  (notable follow-up smokes — dual-stored when mixed)
        ├── mixes[]        (intentional 50/50 blends — dual-stored via sharedId)
        └── notes[]        (quick thoughts — on-hand only, locks after finished)

legacyStrains[]            (31 pre-cLOUD strains — name, cop-again, source, notes)
coppedEntries[]            (copped but not yet smoked — intent + amount settable here too)
onHand[]                   (smoked, still have some)
mixQueue[]                 (mixes queued for review)
reups[]                    (open hauls — max 2)
finishedReups[]            (closed hauls — max 5 on home)
```

---

## auth flow

1. first visit → create a 4-digit PIN
2. PIN hashed with SHA-256 + salt before storing
3. session stored in `sessionStorage` — closing the tab requires re-entry
4. data auto-saves to Supabase 2 seconds after any change (debounced)

---

## V2 — full redesign + new features

V2 is a complete architectural redesign. the data model stays the same (Supabase needs no changes), but the app splits into dedicated pages with a proper nav bar.

### what changes

**navigation** — five-tab nav bar: 🏠 home / 🌿 stash / ✦ log (center, floating) / ⚖️ compare / ✦ recommender. logging only from home and stash.

**home page** — a living preview of everything. curated, not exhaustive. sections:
- your stash: intent-grouped (🌙 / ☀️ / 🏕️), strain name + status only (on hand / ready to try / mix needs logging). horizontal scroll within each group.
- finished re-ups: compact, always on home.
- last saved comparison: mini spectrum preview + the read quote. taps into compare page.
- last saved cop tip: one terpene tip. taps into recommender page.

**stash page** — all active cop management: open re-ups, mix queue, ready to try, on hand with full action buttons.

**compare page** — pick any two logged strains (not legacy). shows intent badges, ratings, spectrums on shared visual axis, terpenes in three columns (A / shared / B), vibe tag overlap, "what you said" notes side by side, re-up pairing verdict, the read. **save comparisons** — bookmark icon saves to home page preview. builds an archive of meaningful pairings over time.

**recommender page** — filtered by intent (☀️ / 🌙 / 🏕️ / overall). top terpenes ranked by avg rating per intent, winning terpene combos with proof strains, plain-english shopping tip. **save tips** — bookmark saves to home page preview. this is the app working as a self-knowledge engine — your data telling you what to look for at the point of purchase.

### what gets added to the cop form in V2

intent (☀️ / 🌙 / 🏕️) and amount (8th / quarter / half / oz) move to the top of the cop form as the first two fields. for now they're set via backfill on existing cops.

### what stays the same

- Supabase schema — no changes, JSON blob handles new fields automatically
- auth flow — identical
- deployment — identical (`npm run deploy`)
- all existing features — library, insights, compare, mixes, experiences, notes, everything

### saved for V2 — NOT building yet

- terpene filter by intent in the insights tab (foundation of recommender, save until recommender page exists)
- quantity-aware on-hand card behavior (8th vs quarter card differences)
- cop-again pulled forward on short cops
- familiarity axis for re-cops of known strains

---

## what the data reveals (two months in)

- caryophyllene is in every 5-leaf session logged — likely the key terpene
- session form is never the problem — every first session is rich regardless of cop size
- notes are the unsung hero — used naturally, the real short-cop logging gesture
- mixes are intentional 50/50 decisions — the mix library grows slowly and that's correct
- 8ths rarely produce experiences or mixes — quarters and up generate longitudinal data
- intent + amount are the two missing dimensions — everything else already existed
- outdoor sessions consistently produce the most vivid, distinct experiences

---

*built in one conversation. logged with love.*
