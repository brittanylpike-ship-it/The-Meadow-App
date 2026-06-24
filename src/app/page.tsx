import ArtworkPage from '@/components/ArtworkPage';

export default function HomePage() {
  return (
    <ArtworkPage
      src="/gpt/home-screen-ui.png"
      alt="Home – The Meadow"
      aspectRatio="853 / 1844"
      maxWidth={680}
      hotspots={[
        // Row 1 — large circles
        { label: 'Journal',       href: '/journal',       style: { left: '4%',  top: '55%',  width: '44%', height: '20%' } },
        { label: 'Chapters',      href: '/chapters',      style: { left: '52%', top: '55%',  width: '44%', height: '20%' } },
        // Row 2 — small circles
        { label: 'Memory Garden', href: '/memory-garden', style: { left: '2%',  top: '76%',  width: '30%', height: '16%' } },
        { label: 'Hearth',        href: '/hearth',        style: { left: '34%', top: '76%',  width: '30%', height: '16%' } },
        { label: 'Profile',       href: '/profile',       style: { left: '67%', top: '76%',  width: '30%', height: '16%' } },
        // Nav bar
        { label: 'Home',          href: '/',              style: { left: '2%',  top: '93.5%', width: '17%', height: '6%' } },
        { label: 'Journal nav',   href: '/journal',       style: { left: '21%', top: '93.5%', width: '17%', height: '6%' } },
        { label: 'Chapters nav',  href: '/chapters',      style: { left: '40%', top: '93.5%', width: '18%', height: '6%' } },
        { label: 'Hearth nav',    href: '/hearth',        style: { left: '60%', top: '93.5%', width: '17%', height: '6%' } },
        { label: 'Profile nav',   href: '/profile',       style: { left: '79%', top: '93.5%', width: '18%', height: '6%' } },
      ]}
    />
  );
}
