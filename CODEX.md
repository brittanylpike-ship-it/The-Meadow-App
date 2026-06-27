# The Meadow — Codex Brief

Read AGENTS.md before touching any file.

---

## Stack

- Next.js 16 App Router (`src/app/`)
- Tailwind CSS v4 (CSS-based config in `globals.css`)
- TypeScript
- Framer Motion (animations)
- Howler.js (audio)
- React Dropzone (file upload)

## Design Law (from AGENTS.md)

Every screen is a place, not a component.
If it looks like an app, it fails.
If it feels like a place, it passes.

No borders. No cards. No default inputs. No dashboards.
Buttons feel like plaques. Inputs feel like journal pages.

---

## Repo Structure

```
src/
  app/
    page.tsx                        — Home
    journal/page.tsx                — Journal with quill animation
    chapters/page.tsx               — Chapters storybook
    memory-garden/
      page.tsx                      — PLACEHOLDER — needs building
      keepsake-box/
        page.tsx                    — Landing (built)
        compass/page.tsx            — Built
        found-objects/page.tsx      — Built
        postcards/page.tsx          — Built
        video-reels/page.tsx        — Built
        telegrams/page.tsx          — Built
        music-box/page.tsx          — Built
        slide-viewer/               — MISSING — needs building
    hearth/page.tsx                 — PLACEHOLDER
    profile/page.tsx                — PLACEHOLDER
  components/
    MeadowNav.tsx                   — Fixed bottom nav (6 icons)
    ArtworkPage.tsx                 — Full-screen PNG + hotspot overlays
  context/
    meadow-state.tsx                — Global state (journal entries)
  hooks/
    useSound.ts                     — Audio hook (wood-slide, brass-click, chime)

public/
  gpt/                              — All illustrated PNG artwork
    journal-page.png
    chapters-storybook.png
    home-screen-ui.png
    memory-garden-ui.png
    nav/                            — Individual nav icons
    keepsake-box/                   — Keepsake Box artwork
    hearth/                         — Hearth room artwork
    reflection-pool/                — Reflection Pool artwork
    frozen-ground/                  — Chapter artwork
    storm-garden/
    crossroads/
    moors/
    first-bloom/
  sounds/                           — MISSING — needs audio files
```

---

## What Needs to Be Built

### 1. Fix broken dev environment
- Delete `babel.config.js` (uses babel-preset-expo — breaks Next.js)
- Delete `app.json` (Expo artifact)
- Confirm `npm run dev` serves pages correctly

### 2. Slide Viewer (`/memory-garden/keepsake-box/slide-viewer/`)
- 8-step flow matching the found-objects pattern
- Photo upload via react-dropzone (step 2)
- Photo grid collection view at bottom
- 3 categories: Personal, Family, Places
- Use `/gpt/keepsake-box/brassview-slider.png` as hero image

### 3. Memory Garden landing (`/memory-garden/page.tsx`)
- Use `/gpt/memory-garden-ui.png` as full-screen background
- ArtworkPage component with two hotspots:
  - Keepsake Box → `/memory-garden/keepsake-box`
  - Reflection Pool → `/memory-garden/reflection-pool`

### 4. Reflection Pool (`/memory-garden/reflection-pool/`)
- Assets in `/gpt/reflection-pool/`
- Scenes: beneath-surface, disturb-surface, feeding-minnows, firefly-dance, leaf-boats, lillypad, rain-sound, skipping-stones
- Use ArtworkPage for landing (`panels.png`), individual pages per scene

### 5. Hearth sub-rooms (`/hearth/`)
- Assets in `/gpt/hearth/`
- Landing: `panels.png` with hotspots to 4 rooms
- Rooms: tea-rooms, greenhouse, post-office, courtyard
- Each room uses ArtworkPage component

### 6. Chapter detail pages (`/chapters/[slug]/`)
- 5 chapters, each with panel landing + individual scene pages
- frozen-ground, storm-garden, crossroads, moors, first-bloom
- Assets already in `/gpt/[chapter-name]/`

### 7. Offline persistence
- Add `zustand` + `idb-keyval`
- Store all keepsake memories (voicemails, reels, postcards, objects, telegrams) in IndexedDB
- Create `src/context/keepsake-state.tsx`

### 8. Sound files (`/public/sounds/`)
- `wood-slide.mp3` — drawer opening (soft, 0.3s)
- `brass-click.mp3` — button tap (crisp, 0.1s)
- `chime.mp3` — save confirmation (warm bell, 0.5s)
- `lid-open.mp3` — box lid creak (0.8s)
- `page-rustle.mp3` — postcard placement (0.2s)

### 9. Journal AI Prompt button
- `src/app/api/prompt/route.ts`
- Accepts: mood id, journal body text
- Returns: one gentle therapeutic writing prompt
- Display above textarea in journal page

---

## Color Palette

```
--color-parchment:  #F3F0EA  (background)
--color-card:       #EFEAE2
--color-border:     #D3CCC1
--color-ember:      #B2A394
--color-gold:       #C7A85A
--color-sage:       #71806A
--color-moss:       #64735E
--color-text:       #56624F
```

## Fonts

- `font-display` → Playfair Display
- `font-serif` → Cormorant Garamond
- `font-script` → Dancing Script

---

## Rules for Every Screen

1. Background is always `#F3F0EA` (parchment)
2. Max width 680px, centered
3. Bottom padding 130px (MeadowNav is fixed)
4. No harsh borders — use `#D3CCC1` at 1px max
5. All buttons: rounded-2xl, font-serif italic
6. All inputs: rounded-xl, font-serif, bg-white/60
7. Illustrations always use `mix-blend-mode: multiply`
8. MeadowNav appears on every screen
