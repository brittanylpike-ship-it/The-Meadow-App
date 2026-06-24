'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Screen = 'Home' | 'Journal' | 'Chapters' | 'Hearth' | 'Profile';

const artworkByScreen: Record<Screen, string> = {
  Home:     '/screens/meadow-footer-nav-index.png',
  Journal:  '/screens/meadow-footer-nav-journal.png',
  Chapters: '/screens/meadow-footer-nav-chapters.png',
  Hearth:   '/screens/meadow-footer-nav-hearth.png',
  Profile:  '/screens/meadow-footer-nav-profile.png',
};

const tabs: Array<{ href: string; screen: Screen; left: string; width: string }> = [
  { href: '/',         screen: 'Home',     left: '5.4%',  width: '17%'   },
  { href: '/journal',  screen: 'Journal',  left: '22.6%', width: '17.6%' },
  { href: '/chapters', screen: 'Chapters', left: '40.8%', width: '18.2%' },
  { href: '/hearth',   screen: 'Hearth',   left: '59.6%', width: '18%'   },
  { href: '/profile',  screen: 'Profile',  left: '78.2%', width: '17%'   },
];

function pathnameToScreen(pathname: string): Screen {
  if (pathname === '/')          return 'Home';
  if (pathname === '/journal')   return 'Journal';
  if (pathname === '/chapters')  return 'Chapters';
  if (pathname === '/hearth')    return 'Hearth';
  if (pathname === '/profile')   return 'Profile';
  return 'Home';
}

export default function BottomNav() {
  const pathname = usePathname();
  const active = pathnameToScreen(pathname);
  const artwork = artworkByScreen[active];

  /* aspect ratio of the nav strip: 1346 / 190 */
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-[#F3F0EA]">
      <div
        className="relative w-full"
        style={{ maxWidth: 680, aspectRatio: '1346 / 190' }}
      >
        <img
          src={artwork}
          alt="Navigation"
          className="w-full h-full object-fill"
        />
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.screen}
            aria-current={active === tab.screen ? 'page' : undefined}
            style={{
              position: 'absolute',
              top: '20%',
              bottom: '6%',
              left: tab.left,
              width: tab.width,
            }}
          />
        ))}
      </div>
    </nav>
  );
}
