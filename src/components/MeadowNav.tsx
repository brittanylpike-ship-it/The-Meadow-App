import Link from 'next/link';

const TABS = [
  { href: '/',              label: 'HOME',          icon: '/gpt/nav/home-icon.png'           },
  { href: '/journal',       label: 'JOURNAL',       icon: '/gpt/nav/journal-icon.png'        },
  { href: '/chapters',      label: 'CHAPTERS',      icon: '/gpt/nav/chapters-icon.png'       },
  { href: '/memory-garden', label: 'MEMORY GARDEN', icon: '/gpt/nav/memory-garden-icon.png' },
  { href: '/hearth',        label: 'HEARTH',        icon: '/gpt/nav/hearth-icon.png'         },
  { href: '/profile',       label: 'PROFILE',       icon: '/gpt/nav/profile-icon.png'        },
];

export default function MeadowNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-[#F3F0EA]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="w-full flex justify-around items-end" style={{ maxWidth: 680, paddingTop: 6, paddingBottom: 8 }}>
        {TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className="flex flex-col items-center gap-0.5 flex-1"
            aria-label={t.label}
          >
            <img
              src={t.icon}
              alt={t.label}
              style={{ width: 72, height: 'auto', display: 'block', mixBlendMode: 'multiply' }}
            />
            <span style={{ fontSize: 7, letterSpacing: '0.05em', color: '#71806A', fontFamily: 'var(--font-display)', textAlign: 'center', lineHeight: 1.2 }}>
              {t.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
