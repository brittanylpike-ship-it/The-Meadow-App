import ArtworkPage from '@/components/ArtworkPage';

const footerHotspots = [
  { label: 'Home',     href: '/',         style: { left: '5.4%',  top: '89.8%', width: '17%',   height: '9.6%' } },
  { label: 'Journal',  href: '/journal',  style: { left: '22.7%', top: '89.8%', width: '17.3%', height: '9.6%' } },
  { label: 'Chapters', href: '/chapters', style: { left: '40.8%', top: '89.8%', width: '18.4%', height: '9.6%' } },
  { label: 'Hearth',   href: '/hearth',   style: { left: '59.8%', top: '89.8%', width: '17.8%', height: '9.6%' } },
  { label: 'Profile',  href: '/profile',  style: { left: '78.4%', top: '89.8%', width: '17.4%', height: '9.6%' } },
];

export default function HearthPage() {
  return (
    <ArtworkPage
      src="/screens/hearth-home-page.png"
      alt="The Hearth"
      aspectRatio="1024 / 1536"
      maxWidth={760}
      hotspots={[
        { label: 'Open The Post Office', href: '/art/hearth-post-office', style: { left: '5%',    top: '23.5%', width: '43.5%', height: '31.2%' } },
        { label: 'Open Tea Rooms',       href: '/art/hearth-tea-rooms',   style: { left: '51.6%', top: '23.5%', width: '43.5%', height: '31.2%' } },
        { label: 'Open The Greenhouse',  href: '/art/hearth-greenhouse',  style: { left: '5%',    top: '55.4%', width: '43.5%', height: '31.2%' } },
        { label: 'Open The Courtyard',   href: '/art/hearth-courtyard',   style: { left: '51.6%', top: '55.4%', width: '43.5%', height: '31.2%' } },
        ...footerHotspots,
      ]}
    />
  );
}
