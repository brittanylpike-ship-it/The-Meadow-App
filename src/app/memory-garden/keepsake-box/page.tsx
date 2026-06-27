'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MeadowNav from '@/components/MeadowNav';
import { useSound } from '@/hooks/useSound';

const COMPARTMENTS = [
  {
    id: 'music-box',
    label: 'Music Box',
    sub: 'Voicemail Preservation',
    icon: '/gpt/keepsake-box/music-box.png',
    href: '/memory-garden/keepsake-box/music-box',
    color: '#f0e8f4',
  },
  {
    id: 'slide-viewer',
    label: 'Slide Viewer',
    sub: 'Photo Archive',
    icon: '/gpt/keepsake-box/brassview-slider.png',
    href: '/memory-garden/keepsake-box/slide-viewer',
    color: '#e8ede0',
  },
  {
    id: 'telegrams',
    label: 'Telegrams',
    sub: 'Text Message Archives',
    icon: '/gpt/keepsake-box/telegrams.png',
    href: '/memory-garden/keepsake-box/telegrams',
    color: '#f4ede0',
  },
  {
    id: 'found-objects',
    label: 'Found Objects',
    sub: 'Treasured Little Things',
    icon: '/gpt/keepsake-box/found-objects.png',
    href: '/memory-garden/keepsake-box/found-objects',
    color: '#e8e4d8',
  },
  {
    id: 'postcards',
    label: 'Postcards',
    sub: 'Geographical Memories',
    icon: '/gpt/keepsake-box/faded-postcards.png',
    href: '/memory-garden/keepsake-box/postcards',
    color: '#e0ece8',
  },
  {
    id: 'video-reels',
    label: 'Video Reels',
    sub: 'Motion Picture Archive',
    icon: '/gpt/keepsake-box/video-archive.png',
    href: '/memory-garden/keepsake-box/video-reels',
    color: '#e4e0ec',
  },
  {
    id: 'compass',
    label: 'Compass',
    sub: 'Time-Capsule Navigation',
    icon: '/gpt/keepsake-box/pocketwatch-compass.png',
    href: '/memory-garden/keepsake-box/compass',
    color: '#f0ece0',
  },
];

export default function KeepsakeBoxPage() {
  const [lidOpen, setLidOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { play } = useSound();

  function handleOpenBox() {
    if (!lidOpen) {
      play('lidOpen');
      setLidOpen(true);
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F3F0EA]">
      <main className="flex-1 max-w-[680px] mx-auto w-full pb-[130px]">

        {/* Back */}
        <div className="px-4 pt-4 pb-1">
          <Link href="/memory-garden" className="text-xs text-[#71806A] flex items-center gap-1">
            ← Back
          </Link>
        </div>

        {/* Header */}
        <div className="text-center px-6 pt-2 pb-4">
          <p className="text-[10px] tracking-[0.2em] text-[#B2A394] uppercase mb-1">Memory Garden</p>
          <h1 className="font-display text-3xl text-[#56624F] leading-tight">The<br/>Keepsake Box</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px flex-1 bg-[#D3CCC1]" />
            <span className="text-[#C7A85A] text-base">⚿</span>
            <div className="h-px flex-1 bg-[#D3CCC1]" />
          </div>
          <p className="font-serif italic text-[#8A9280] text-sm mt-2">Hold what cannot be held.</p>
        </div>

        {/* Box illustration + lid animation */}
        <div className="relative mx-4 mb-2 cursor-pointer" onClick={handleOpenBox}>
          <motion.div
            className="relative rounded-2xl overflow-hidden"
            style={{ background: '#EDE7D9', border: '2px solid #C8B898' }}
          >
            {/* Lid */}
            <motion.div
              className="w-full overflow-hidden"
              style={{ transformOrigin: 'top center' }}
              animate={{ scaleY: lidOpen ? 0 : 1, opacity: lidOpen ? 0 : 1 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="relative w-full" style={{ aspectRatio: '853 / 480' }}>
                <img src="/gpt/keepsake-box/panels.png" alt="Keepsake Box" className="w-full block" />
                {!lidOpen && (
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-center"
                    >
                      <p className="text-[#C7A85A] font-serif italic text-sm">Tap to open the box</p>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Box interior — shown after lid opens */}
            <AnimatePresence>
              {lidOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="p-4"
                >
                  {/* Privacy seal */}
                  <div className="text-center mb-4 p-3 rounded-xl" style={{ background: '#8B3A3A', border: '1px solid #6B2A2A' }}>
                    <p className="text-[#F0DCC8] font-display text-sm">Sealed with Wax — Privacy Lock</p>
                    <p className="text-[#D4A898] font-serif italic text-xs mt-1">Some memories are meant for you alone.</p>
                  </div>

                  {/* Compartment grid (3 top + 3 bottom) */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {COMPARTMENTS.slice(0, 6).map((c) => (
                      <CompartmentTile key={c.id} c={c} hovered={hoveredId === c.id} onHover={setHoveredId} onPlay={play} />
                    ))}
                  </div>
                  {/* Compass — centered below */}
                  <div className="flex justify-center">
                    <div className="w-1/3">
                      <CompartmentTile c={COMPARTMENTS[6]} hovered={hoveredId === 'compass'} onHover={setHoveredId} onPlay={play} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Instruction */}
        <AnimatePresence>
          {lidOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center px-6 py-3"
            >
              <p className="font-display text-[#56624F] text-base">Tap a compartment to open it.</p>
              <p className="font-serif italic text-[#8A9280] text-sm">Each one holds a different kind of memory.</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-px flex-1 bg-[#D3CCC1]" />
                <span className="text-[#C7A85A] text-sm">⚿</span>
                <div className="h-px flex-1 bg-[#D3CCC1]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Item cards grid — always visible below box */}
        <div className="px-4 mt-2 space-y-1">
          <div className="grid grid-cols-2 gap-3">
            {COMPARTMENTS.slice(0, 4).map((c) => (
              <ItemCard key={c.id} c={c} onPlay={play} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {COMPARTMENTS.slice(4).map((c) => (
              <ItemCard key={c.id} c={c} onPlay={play} />
            ))}
          </div>
        </div>

        {/* Close button */}
        <AnimatePresence>
          {lidOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-4 mt-6 mb-2"
            >
              <button
                onClick={() => { play('brassClick'); setLidOpen(false); }}
                className="w-full py-3.5 rounded-full font-serif italic text-[#71806A] text-sm"
                style={{ border: '1px solid #C8B898', background: '#EDE7D9' }}
              >
                Close the box gently ✦
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      <MeadowNav />
    </div>
  );
}

function CompartmentTile({
  c, hovered, onHover, onPlay,
}: {
  c: typeof COMPARTMENTS[0];
  hovered: boolean;
  onHover: (id: string | null) => void;
  onPlay: (s: any) => void;
}) {
  return (
    <Link href={c.href}>
      <motion.div
        onHoverStart={() => onHover(c.id)}
        onHoverEnd={() => onHover(null)}
        onTapStart={() => onPlay('brassClick')}
        whileTap={{ scale: 0.94 }}
        animate={{ scale: hovered ? 1.04 : 1, boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)' }}
        transition={{ duration: 0.18 }}
        className="rounded-xl p-2 flex flex-col items-center gap-1 cursor-pointer"
        style={{ background: c.color, border: '1px solid #D3CCC1' }}
      >
        <img src={c.icon} alt={c.label} className="w-full" style={{ height: 60, objectFit: 'contain' }} />
      </motion.div>
    </Link>
  );
}

function ItemCard({ c, onPlay }: { c: typeof COMPARTMENTS[0]; onPlay: (s: any) => void }) {
  return (
    <Link href={c.href}>
      <motion.div
        whileTap={{ scale: 0.96 }}
        onTapStart={() => onPlay('woodSlide')}
        className="rounded-2xl p-3 flex flex-col items-center gap-2 cursor-pointer"
        style={{ background: c.color, border: '1px solid #D3CCC1' }}
      >
        <img src={c.icon} alt={c.label} style={{ width: '100%', height: 80, objectFit: 'contain' }} />
        <div className="text-center">
          <p className="font-display text-[#56624F] text-xs font-semibold">{c.label}</p>
          <p className="font-serif italic text-[#8A9280] text-[10px]">{c.sub}</p>
        </div>
      </motion.div>
    </Link>
  );
}
