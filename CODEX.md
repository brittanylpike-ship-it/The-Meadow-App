# The Meadow — Codex Brief

Read AGENTS.md before touching any file. The design law is not optional.

---

## Stack

- Next.js 16 App Router (`src/app/`)
- Tailwind CSS v4 (CSS-based `@theme inline` config in `globals.css`)
- TypeScript
- Framer Motion (animations)
- Howler.js (audio)
- React Dropzone (file upload)

---

## Fix These First (Broken Right Now)

### 1. Delete Expo artifacts — they break Next.js entirely
- Delete `babel.config.js` (uses `babel-preset-expo` — kills the build)
- Delete `app.json` (Expo artifact, not needed)

### 2. Hearth page — wrong image, wrong routes, wrong nav
File: `src/app/hearth/page.tsx`

Problems:
- Uses `/screens/hearth-home-page.png` — file does not exist at that path
- Sub-room hrefs point to `/art/hearth-*` — those routes don't exist
- Aspect ratio `1024/1536` is wrong — all screens are `853/1844`
- Nav hotspots use old 5-tab layout, missing Memory Garden

Fix: replace entirely with:
```tsx
import ArtworkPage from '@/components/ArtworkPage';

export default function HearthPage() {
  return (
    <ArtworkPage
      src="/gpt/hearth/panels.png"
      alt="The Hearth"
      aspectRatio="853 / 1844"
      maxWidth={680}
      showNav={true}
      hotspots={[
        { label: 'Tea Rooms',    href: '/hearth/tea-rooms',   style: { left: '5%',   top: '24%', width: '43%', height: '30%' } },
        { label: 'Greenhouse',   href: '/hearth/greenhouse',  style: { left: '52%',  top: '24%', width: '43%', height: '30%' } },
        { label: 'Post Office',  href: '/hearth/post-office', style: { left: '5%',   top: '55%', width: '43%', height: '30%' } },
        { label: 'Courtyard',    href: '/hearth/courtyard',   style: { left: '52%',  top: '55%', width: '43%', height: '30%' } },
      ]}
    />
  );
}
```

### 3. Memory Garden page — hotspot hrefs are wrong
File: `src/app/memory-garden/page.tsx`

Problems:
- `/reflection-pool` should be `/memory-garden/reflection-pool`
- `/keepsake-box` should be `/memory-garden/keepsake-box`
- Uses old 5-tab nav hotspots, missing Memory Garden tab
- Should use `showNav={true}` instead of nav hotspots

Fix: replace entirely with:
```tsx
import ArtworkPage from '@/components/ArtworkPage';

export default function MemoryGardenPage() {
  return (
    <ArtworkPage
      src="/gpt/memory-garden-ui.png"
      alt="Memory Garden"
      aspectRatio="853 / 1844"
      maxWidth={680}
      showNav={true}
      hotspots={[
        { label: 'The Reflection Pool', href: '/memory-garden/reflection-pool', style: { left: '4%', top: '38%', width: '90%', height: '25%' } },
        { label: 'The Keepsake Box',    href: '/memory-garden/keepsake-box',    style: { left: '4%', top: '63%', width: '90%', height: '25%' } },
      ]}
    />
  );
}
```

### 4. Home page — nav hotspots use old 5-tab layout
File: `src/app/page.tsx`

Problem: nav hotspots at the bottom are an old 5-tab layout embedded in the PNG. The app now uses `MeadowNav` component (6 tabs including Memory Garden). The home page should use `showNav={true}` and remove the nav hotspots.

Fix: replace entirely with:
```tsx
import ArtworkPage from '@/components/ArtworkPage';

export default function HomePage() {
  return (
    <ArtworkPage
      src="/gpt/home-screen-ui.png"
      alt="Home – The Meadow"
      aspectRatio="853 / 1844"
      maxWidth={680}
      showNav={true}
      hotspots={[
        { label: 'Journal',       href: '/journal',       style: { left: '4%',  top: '55%', width: '44%', height: '20%' } },
        { label: 'Chapters',      href: '/chapters',      style: { left: '52%', top: '55%', width: '44%', height: '20%' } },
        { label: 'Memory Garden', href: '/memory-garden', style: { left: '2%',  top: '76%', width: '30%', height: '16%' } },
        { label: 'Hearth',        href: '/hearth',        style: { left: '34%', top: '76%', width: '30%', height: '16%' } },
        { label: 'Profile',       href: '/profile',       style: { left: '67%', top: '76%', width: '30%', height: '16%' } },
      ]}
    />
  );
}
```

### 5. Profile page — wrong image filename, wrong nav
File: `src/app/profile/page.tsx`

Problems:
- Uses `/gpt/profile.png` — actual file is `/gpt/Profile.png` (capital P). On iOS this will 404.
- Uses old 5-tab nav hotspots, missing Memory Garden

Fix: replace entirely with:
```tsx
import ArtworkPage from '@/components/ArtworkPage';

export default function ProfilePage() {
  return (
    <ArtworkPage
      src="/gpt/Profile.png"
      alt="Profile"
      aspectRatio="853 / 1844"
      maxWidth={680}
      showNav={true}
      hotspots={[]}
    />
  );
}
```

### 6. Chapters page — nav hotspots embedded in PNG, not using MeadowNav
File: `src/app/chapters/page.tsx`

The bottom nav hotspots are baked into the PNG. Switch to `showNav={true}` and remove nav hotspots:
```tsx
import ArtworkPage from '@/components/ArtworkPage';

export default function ChaptersPage() {
  return (
    <ArtworkPage
      src="/gpt/chapters-storybook.png"
      alt="Chapters – The Meadow"
      aspectRatio="853 / 1844"
      maxWidth={680}
      showNav={true}
      hotspots={[
        { label: 'Frozen Ground', href: '/chapters/frozen-ground', style: { left: '0%',  top: '20%', width: '20%', height: '55%' } },
        { label: 'Storm Garden',  href: '/chapters/storm-garden',  style: { left: '20%', top: '20%', width: '20%', height: '55%' } },
        { label: 'Crossroads',    href: '/chapters/crossroads',    style: { left: '40%', top: '20%', width: '20%', height: '55%' } },
        { label: 'The Moors',     href: '/chapters/moors',         style: { left: '60%', top: '20%', width: '20%', height: '55%' } },
        { label: 'First Bloom',   href: '/chapters/first-bloom',   style: { left: '80%', top: '20%', width: '20%', height: '55%' } },
      ]}
    />
  );
}
```

---

## What Still Needs to Be Built

### Hearth sub-rooms (4 pages)
Assets in `/public/gpt/hearth/`
- `src/app/hearth/tea-rooms/page.tsx` → image: `/gpt/hearth/tea-rooms.png`
- `src/app/hearth/greenhouse/page.tsx` → image: `/gpt/hearth/greenhouse.png`
- `src/app/hearth/post-office/page.tsx` → image: `/gpt/hearth/post-office.png`
- `src/app/hearth/courtyard/page.tsx` → image: `/gpt/hearth/courtyard.png`

Each uses ArtworkPage, aspectRatio `853/1844`, showNav={true}.

### Chapter detail pages (5 chapters × panels + scenes)
Assets in `/public/gpt/[chapter-name]/`
- `src/app/chapters/frozen-ground/page.tsx` → `/gpt/frozen-ground/panels.png`
- `src/app/chapters/storm-garden/page.tsx` → `/gpt/storm-garden/panels.png`
- `src/app/chapters/crossroads/page.tsx` → `/gpt/crossroads/panels.png`
- `src/app/chapters/moors/page.tsx` → `/gpt/moors/panels.png`
- `src/app/chapters/first-bloom/page.tsx` → `/gpt/first-bloom/panels.png`

### Reflection Pool (`/memory-garden/reflection-pool/`)
Assets in `/public/gpt/reflection-pool/`
Landing: `panels.png` with hotspots to each scene.
Scenes: beneath-surface, disturb-surface, feeding-minnows, firefly-dance, leaf-boats, lillypad, rain-sound, skipping-stones

### Keepsake Box — Slide Viewer (missing sub-screen)
- `src/app/memory-garden/keepsake-box/slide-viewer/page.tsx`
- 8-step flow matching found-objects pattern
- Photo upload via react-dropzone
- Photo grid collection at bottom
- Image: `/gpt/keepsake-box/brassview-slider.png`

### Offline persistence
- Add `zustand` + `idb-keyval`
- Create `src/context/keepsake-state.tsx`
- Persist all keepsake memories across sessions

### Sound files
Create `/public/sounds/` with:
- `wood-slide.mp3`
- `brass-click.mp3`
- `chime.mp3`
- `lid-open.mp3`
- `page-rustle.mp3`

---

## Rules for Every Screen

- Background: `#F3F0EA`
- Max width: 680px centered
- Bottom padding: 130px (MeadowNav is fixed position)
- All screens use `showNav={true}` on ArtworkPage OR include `<MeadowNav />` manually
- No nav hotspots baked into page files — MeadowNav handles navigation
- Images use `mix-blend-mode: multiply` where PNG has white background
- Aspect ratio for all full screens: `853 / 1844`

## Color Palette
```
#F3F0EA — parchment (background)
#EFEAE2 — card
#D3CCC1 — border
#B2A394 — ember / muted text
#C7A85A — gold / accent
#71806A — sage
#64735E — moss
#56624F — text
```

## Fonts
- `font-display` → Playfair Display (headings)
- `font-serif` → Cormorant Garamond (body, italic prompts)
- `font-script` → Dancing Script (decorative)
