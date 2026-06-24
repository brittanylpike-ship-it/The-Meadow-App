import ArtworkPage from '@/components/ArtworkPage';

export default function ProfilePage() {
  return (
    <ArtworkPage
      src="/gpt/profile.png"
      alt="Profile"
      aspectRatio="853 / 1844"
      maxWidth={680}
      hotspots={[
        { label: 'Home',          href: '/',          style: { left: '2%',  top: '93.5%', width: '17%', height: '6%' } },
        { label: 'Journal nav',   href: '/journal',   style: { left: '21%', top: '93.5%', width: '17%', height: '6%' } },
        { label: 'Chapters nav',  href: '/chapters',  style: { left: '40%', top: '93.5%', width: '18%', height: '6%' } },
        { label: 'Hearth nav',    href: '/hearth',    style: { left: '60%', top: '93.5%', width: '17%', height: '6%' } },
        { label: 'Profile nav',   href: '/profile',   style: { left: '79%', top: '93.5%', width: '18%', height: '6%' } },
      ]}
    />
  );
}
