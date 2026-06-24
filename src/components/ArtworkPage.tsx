import Link from 'next/link';
import MeadowNav from './MeadowNav';

export type Hotspot = {
  label: string;
  href: string;
  style: { left: string; top: string; width: string; height: string };
};

type Props = {
  src: string;
  alt: string;
  aspectRatio: string;
  maxWidth?: number;
  hotspots: Hotspot[];
  showNav?: boolean;
  cropHeightPct?: number;
};

export default function ArtworkPage({ src, alt, aspectRatio, maxWidth = 680, hotspots, showNav = false, cropHeightPct }: Props) {
  const [aw, ah] = aspectRatio.split('/').map(s => Number(s.trim()));
  const displayRatio = cropHeightPct ? `${aw} / ${ah * cropHeightPct / 100}` : aspectRatio;

  return (
    <div className="flex flex-col min-h-full bg-[#F3F0EA]">
      <main
        className="flex-1 mx-auto w-full"
        style={{ maxWidth, paddingBottom: showNav ? 130 : 0 }}
      >
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: displayRatio }}>
          <img
            src={src}
            alt={alt}
            className="w-full block"
            style={cropHeightPct ? {} : { height: '100%', objectFit: 'fill' }}
          />
          {hotspots.map((h) => (
            <Link
              key={h.label}
              href={h.href}
              aria-label={h.label}
              style={{ position: 'absolute', ...h.style }}
            />
          ))}
        </div>
      </main>

      {showNav && <MeadowNav />}
    </div>
  );
}
