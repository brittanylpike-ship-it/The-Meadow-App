'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MeadowNav from '@/components/MeadowNav';
import { useSound } from '@/hooks/useSound';

type Postcard = {
  id: string;
  title: string;
  memory: string;
  who: string;
  what: string;
  drawer: 'beloved' | 'adventures' | 'journeys';
  date: string;
  photo?: string;
};

const STEPS = [
  { num: 1, title: 'Open the Drawer', body: 'Drawer glides open slowly. Postcards appear in their places. Space is ready for your memories.', note: '♪ Soft wood-on-wood slide / Subtle brass rattle' },
  { num: 2, title: 'Add Your Postcard', body: 'Choose a photo or memory. Add your own postcard. Write a title or caption.', note: 'Your story. Your way.' },
  { num: 3, title: 'Write the Memory', body: 'Write your memory on the back. Capture what it meant to you. Every detail becomes part of the story.', note: '♥ Your words preserve what your heart remembers.' },
  { num: 4, title: 'Place It in the Drawer', body: 'Place your postcard in a space. Beside others you\'ve added. Your memories, beautifully kept.', note: '♪ A gentle placement / Memories at home.' },
  { num: 5, title: 'View Your Collection', body: 'Browse your postcards anytime. Remember the places and moments. Each one holds a piece of you.', note: '♪ A quiet moment of reflection' },
  { num: 6, title: 'Add Context & Notes', body: 'Go deeper with your memories. Add notes, feelings, and details. Connect to your journal for a fuller story.', note: 'Details deepen the memory.' },
  { num: 7, title: 'Return to the Drawer', body: 'Return your postcard to its place. Safe, cherished, and preserved. Your memory remains with you.', note: '♪ Soft brass click / Drawer closes quietly' },
  { num: 8, title: 'Watch Your Collection Grow', body: 'Add as many postcards as you like. Your collection grows naturally. More memories, more stories. All uniquely yours.', note: '♥ Every memory adds beauty to your collection.' },
];

const DRAWERS = [
  { id: 'beloved', label: 'Drawer One', sub: 'Beloved Places', items: ['Hometown', 'Favorite Spots', 'Quiet Corners'] },
  { id: 'adventures', label: 'Drawer Two', sub: 'Adventures', items: ['Travels', 'Vacations', 'New Horizons'] },
  { id: 'journeys', label: 'Drawer Three', sub: 'Special Journeys', items: ['Milestones', 'Pilgrimages', 'Once-in-a-Lifetime'] },
];

export default function PostcardsPage() {
  const [step, setStep] = useState<number | null>(null);
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [form, setForm] = useState({ title: '', memory: '', who: '', what: '', drawer: 'beloved' as Postcard['drawer'] });
  const [saved, setSaved] = useState(false);
  const { play } = useSound();

  function startFlow() { play('woodSlide'); setStep(0); setSaved(false); }

  function handleNext() {
    play('brassClick');
    if (step !== null && step < STEPS.length - 1) setStep(s => (s ?? 0) + 1);
    else {
      if (form.title.trim()) {
        setPostcards(prev => [...prev, { ...form, id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }]);
      }
      play('chime');
      setSaved(true);
      setStep(null);
      setForm({ title: '', memory: '', who: '', what: '', drawer: 'beloved' });
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F3F0EA]">
      <main className="flex-1 max-w-[680px] mx-auto w-full pb-[130px]">

        <div className="px-4 pt-4 pb-1">
          <Link href="/memory-garden/keepsake-box" className="text-xs text-[#71806A] flex items-center gap-1">← Back</Link>
        </div>

        <div className="px-6 pt-2 pb-4">
          <h1 className="font-display text-3xl text-[#56624F]">Faded Postcards<br/><span className="text-xl font-normal">Drawer</span></h1>
          <p className="text-[10px] tracking-widest text-[#B2A394] uppercase mt-1">Your Memories. Captured Forever.</p>
          <div className="h-px bg-[#D3CCC1] mt-3 mb-3" />
          <p className="font-serif italic text-[#71806A] text-sm">Some places stay with us long after we leave.</p>
          <p className="text-[#C7A85A] mt-1">♥</p>
        </div>

        <div className="mx-4 mb-4">
          <div className="rounded-2xl overflow-hidden" style={{ background: '#EDE7D9', border: '2px solid #C8B898' }}>
            <img src="/gpt/keepsake-box/faded-postcards.png" alt="Postcards" className="w-full block" style={{ maxHeight: 240, objectFit: 'contain' }} />
          </div>
        </div>

        {step === null && !saved && (
          <div className="mx-4 mb-4">
            <button onClick={startFlow} className="w-full py-4 rounded-2xl font-display text-[#56624F] text-base" style={{ background: '#EDE7D9', border: '2px solid #C8B898' }}>
              Open the Drawer ✦
            </button>
          </div>
        )}

        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mb-4 p-4 rounded-2xl text-center" style={{ background: '#e8f0e4', border: '1px solid #8ab07a' }}>
              <p className="font-display text-[#56624F]">Placed in the drawer ✦</p>
              <p className="font-serif italic text-[#8A9280] text-sm mt-1">Your postcard is beautifully kept.</p>
              <button onClick={() => setSaved(false)} className="mt-3 text-xs text-[#71806A] underline">Add another</button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step !== null && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mb-4">
              <div className="flex gap-1 mb-4 justify-center">
                {STEPS.map((_, i) => (
                  <motion.div key={i} className="rounded-full h-1.5"
                    animate={{ width: i === step ? 20 : 6, background: i === step ? '#71806A' : i < step ? '#C7A85A' : '#D3CCC1' }}
                    transition={{ duration: 0.2 }} />
                ))}
              </div>

              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl p-5 mb-3" style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
                <p className="text-[10px] tracking-widest text-[#B2A394] uppercase mb-1">{STEPS[step].num} / {STEPS.length}</p>
                <h2 className="font-display text-xl text-[#56624F] mb-2">{STEPS[step].title}</h2>
                <p className="font-serif text-[#71806A] text-sm leading-relaxed mb-3">{STEPS[step].body}</p>

                {step === 1 && (
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Name this place or memory..."
                    className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60"
                    style={{ border: '1px solid #D3CCC1' }} />
                )}
                {step === 2 && (
                  <textarea value={form.memory} onChange={e => setForm(f => ({ ...f, memory: e.target.value }))}
                    placeholder="Write your memory here..."
                    className="w-full rounded-xl p-3 font-serif text-sm text-[#56624F] outline-none resize-none bg-white/60"
                    style={{ border: '1px solid #D3CCC1', minHeight: 100 }} />
                )}
                {step === 5 && (
                  <div className="space-y-2">
                    <input value={form.who} onChange={e => setForm(f => ({ ...f, who: e.target.value }))}
                      placeholder="Who was there..."
                      className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60"
                      style={{ border: '1px solid #D3CCC1' }} />
                    <input value={form.what} onChange={e => setForm(f => ({ ...f, what: e.target.value }))}
                      placeholder="What happened..."
                      className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60"
                      style={{ border: '1px solid #D3CCC1' }} />
                    <select value={form.drawer} onChange={e => setForm(f => ({ ...f, drawer: e.target.value as Postcard['drawer'] }))}
                      className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60"
                      style={{ border: '1px solid #D3CCC1' }}>
                      <option value="beloved">Drawer One — Beloved Places</option>
                      <option value="adventures">Drawer Two — Adventures</option>
                      <option value="journeys">Drawer Three — Special Journeys</option>
                    </select>
                  </div>
                )}

                <p className="font-serif italic text-[#C7A85A] text-xs mt-3">{STEPS[step].note}</p>
              </motion.div>

              <div className="flex gap-2">
                {step > 0 && (
                  <button onClick={() => { play('brassClick'); setStep(s => (s ?? 1) - 1); }}
                    className="flex-1 py-3 rounded-2xl font-serif text-sm text-[#71806A]"
                    style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>← Back</button>
                )}
                <button onClick={handleNext}
                  className="flex-1 py-3 rounded-2xl font-serif text-sm text-white"
                  style={{ background: step === STEPS.length - 1 ? '#C7A85A' : '#71806A' }}>
                  {step === STEPS.length - 1 ? 'Place in drawer ✦' : 'Continue →'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {postcards.length > 0 && (
          <div className="mx-4 mb-4">
            <p className="font-display text-[#56624F] text-sm mb-3">Your Postcards</p>
            <div className="grid grid-cols-2 gap-3">
              {postcards.map(pc => (
                <div key={pc.id} className="rounded-2xl p-3" style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
                  <div className="rounded-lg mb-2 flex items-center justify-center" style={{ height: 70, background: '#e0ece8' }}>
                    <span className="text-2xl">✉</span>
                  </div>
                  <p className="font-display text-[#56624F] text-xs">{pc.title}</p>
                  <p className="font-serif italic text-[#8A9280] text-[10px] line-clamp-2 mt-0.5">{pc.memory}</p>
                  <p className="text-[9px] text-[#B2A394] mt-1">{pc.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mx-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-[#D3CCC1]" />
            <p className="text-[10px] tracking-widest text-[#B2A394] uppercase">Collection Growth</p>
            <div className="h-px flex-1 bg-[#D3CCC1]" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {DRAWERS.map(d => (
              <div key={d.id} className="rounded-2xl p-3 text-center" style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
                <img src="/gpt/keepsake-box/faded-postcards.png" alt={d.label} className="w-full mb-2" style={{ height: 50, objectFit: 'contain' }} />
                <p className="font-display text-[#56624F] text-[9px] font-semibold">{d.label}</p>
                <p className="font-serif italic text-[#8A9280] text-[8px] mb-1">{d.sub}</p>
                {d.items.map(item => <p key={item} className="text-[8px] text-[#B2A394]">• {item}</p>)}
              </div>
            ))}
          </div>
          <p className="font-serif italic text-[#8A9280] text-xs text-center pb-2">No counters. No achievements. No progress bars.</p>
          <p className="font-serif italic text-[#8A9280] text-xs text-center pb-4">Only a life beautifully remembered.</p>
        </div>

      </main>
      <MeadowNav />
    </div>
  );
}
