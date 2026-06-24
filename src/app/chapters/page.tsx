import ArtworkPage from '@/components/ArtworkPage';

export default function ChaptersPage() {
  return (
    <ArtworkPage
      src="/gpt/chapters-storybook.png"
      alt="Chapters – The Meadow"
      aspectRatio="853 / 1844"
      maxWidth={680}
      hotspots={[
        { label: 'Frozen Ground', href: '/chapters/frozen-ground', style: { left: '0%',  top: '20%', width: '20%', height: '55%' } },
        { label: 'Storm Garden',  href: '/chapters/storm-garden',  style: { left: '20%', top: '20%', width: '20%', height: '55%' } },
        { label: 'Crossroads',    href: '/chapters/crossroads',    style: { left: '40%', top: '20%', width: '20%', height: '55%' } },
        { label: 'The Moors',     href: '/chapters/moors',         style: { left: '60%', top: '20%', width: '20%', height: '55%' } },
        { label: 'First Bloom',   href: '/chapters/first-bloom',   style: { left: '80%', top: '20%', width: '20%', height: '55%' } },
        { label: 'Home',          href: '/',              style: { left: '2%',  top: '94%', width: '13%', height: '5%' } },
        { label: 'Journal',       href: '/journal',       style: { left: '17%', top: '94%', width: '14%', height: '5%' } },
        { label: 'Chapters',      href: '/chapters',      style: { left: '33%', top: '94%', width: '14%', height: '5%' } },
        { label: 'Memory Garden', href: '/memory-garden', style: { left: '49%', top: '94%', width: '15%', height: '5%' } },
        { label: 'Hearth',        href: '/hearth',        style: { left: '66%', top: '94%', width: '14%', height: '5%' } },
        { label: 'Profile',       href: '/profile',       style: { left: '82%', top: '94%', width: '16%', height: '5%' } },
      ]}
    />
  );
}
