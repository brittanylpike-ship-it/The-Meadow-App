'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MeadowNav from '@/components/MeadowNav';
import { useSound } from '@/hooks/useSound';

type ObjectEntry = {
  id: string;
  name: string;
  memory: string;
  context: string;
  whyItMatters: string;
  drawer: 'everyday' | 'special' | 'heirloom';
  date: string;
};

const STEPS = [
  { num: 1, title: 'Open the Drawer', body: 'Compartments appear. Objects rest in their places.', note: '♪ Soft wood-on-wood slide / Delicate brass rattle' },
  { num: 2, title: 'Choose an Object', body: 'Select an object. It rises slightly. Details come into focus.', note: 'The chosen object becomes the focus.' },
  { num: 3, title: 'Explore Its Story', body: 'Inspect the details. Notice textures and meaning. Let memories arise.', note: '♪ A quiet moment of reflection' },
  { num: 4, title: 'Add Meaning', body: 'Add a memory or note. Record why it matters. Capture the feeling.', note: 'Meaning is what makes it treasured.' },
  { num: 5, title: 'Preserve the Story', body: 'Write the story behind the object. Add reflections. Let the memory deepen.', note: '"Stories keep the little things alive."' },
  { num: 6, title: 'Return the Object', body: 'Place the object back. It returns to its resting place. Safe, cherished, and remembered.', note: '♪ Soft brass click / Drawer closes quietly' },
  { num: 7, title: 'Close the Drawer', body: 'Drawer slides closed. Everything is just as it should be. The memory stays with you.', note: '♪ A quiet click / Peace returns to the room' },
];

const DRAWERS = [
  { id: 'everyday', label: 'Drawer One', sub: 'Everyday Treasures', items: ['Small Moments', 'Simple Joys', 'Everyday Things'] },
  { id: 'special', label: 'Drawer Two', sub: 'Special Occasions', items: ['Celebrations', 'Milestones', 'Meaningful Days'] },
  { id: 'heirloom', label: 'Drawer Three', sub: 'Heirloom Pieces', items: ['Passed Down', 'Cherished Keepsakes', 'Deeply Loved'] },
];

export default function FoundObjectsPage() {
  const [step, setStep] = useState<number | null>(null);
  const [objects, setObjects] = useState<ObjectEntry[]>([]);
  const [form, setForm] = useState({ name: '', memory: '', context: '', whyItMatters: '', drawer: 'everyday' as ObjectEntry['drawer'] });
  const [saved, setSaved] = useState(false);
  const { play } = useSound();

  function startFlow() { play('woodSlide'); setStep(0); setSaved(false); }

  function handleNext() {
    play('brassClick');
    if (step !== null && step < STEPS.length - 1) setStep(s => (s ?? 0) + 1);
    else finishFlow();
  }

  function finishFlow() {
    if (form.name.trim()) {
      setObjects(prev => [...prev, { ...form, id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }]);
    }
    play('chime');
    setSaved(true);
    setStep(null);
    setForm({ name: '', memory: '', context: '', whyItMatters: '', drawer: 'everyday' });
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F3F0EA]">
      <main className="flex-1 max-w-[680px] mx-auto w-full pb-[130px]">

        <div className="px-4 pt-4 pb-1">
          <Link href="/memory-garden/keepsake-box" className="text-xs text-[#71806A] flex items-center gap-1">← Back</Link>
        </div>

        <div className="px-6 pt-2 pb-4">
          <h1 className="font-display text-3xl text-[#56624F]">Found Objects<br/><span className="text-xl font-normal">Drawer</span></h1>
          <p className="text-[10px] tracking-widest text-[#B2A394] uppercase mt-1">Treasured Little Things</p>
          <div className="h-px bg-[#D3CCC1] mt-3 mb-3" />
          <p className="font-serif italic text-[#71806A] text-sm">The small things that mean the most.</p>
          <p className="text-[#C7A85A] mt-1">♥</p>
        </div>

        {/* Illustration */}
        <div className="mx-4 mb-4">
          <div className="rounded-2xl overflow-hidden" style={{ background: '#EDE7D9', border: '2px solid #C8B898' }}>
            <img src="/gpt/keepsake-box/found-objects.png" alt="Found Objects" className="w-full block" style={{ maxHeight: 240, objectFit: 'contain' }} />
          </div>
        </div>

        {/* Add object button */}
        {step === null && !saved && (
          <div className="mx-4 mb-4">
            <button onClick={startFlow} className="w-full py-4 rounded-2xl font-display text-[#56624F] text-base" style={{ background: '#EDE7D9', border: '2px solid #C8B898' }}>
              Open the Drawer ✦
            </button>
          </div>
        )}

        {/* Saved confirmation */}
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mb-4 p-4 rounded-2xl text-center" style={{ background: '#e8f0e4', border: '1px solid #8ab07a' }}>
              <p className="font-display text-[#56624F]">Treasured and kept ✦</p>
              <p className="font-serif italic text-[#8A9280] text-sm mt-1">Your object rests safely in the drawer.</p>
              <button onClick={() => setSaved(false)} className="mt-3 text-xs text-[#71806A] underline">Add another</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step flow */}
        <AnimatePresence>
          {step !== null && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mb-4">
              {/* Progress */}
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
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Name your object..."
                    className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60"
                    style={{ border: '1px solid #D3CCC1' }} />
                )}
                {step === 3 && (
                  <textarea value={form.memory} onChange={e => setForm(f => ({ ...f, memory: e.target.value }))}
                    placeholder="Add a memory or note..."
                    className="w-full rounded-xl p-3 font-serif text-sm text-[#56624F] outline-none resize-none bg-white/60"
                    style={{ border: '1px solid #D3CCC1', minHeight: 80 }} />
                )}
                {step === 4 && (
                  <div className="space-y-2">
                    <textarea value={form.whyItMatters} onChange={e => setForm(f => ({ ...f, whyItMatters: e.target.value }))}
                      placeholder="Why it matters to you..."
                      className="w-full rounded-xl p-3 font-serif text-sm text-[#56624F] outline-none resize-none bg-white/60"
                      style={{ border: '1px solid #D3CCC1', minHeight: 60 }} />
                    <select value={form.drawer} onChange={e => setForm(f => ({ ...f, drawer: e.target.value as ObjectEntry['drawer'] }))}
                      className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60"
                      style={{ border: '1px solid #D3CCC1' }}>
                      <option value="everyday">Drawer One — Everyday Treasures</option>
                      <option value="special">Drawer Two — Special Occasions</option>
                      <option value="heirloom">Drawer Three — Heirloom Pieces</option>
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

        {/* Saved objects */}
        {objects.length > 0 && (
          <div className="mx-4 mb-4">
            <p className="font-display text-[#56624F] text-sm mb-3">Your Found Objects</p>
            <div className="space-y-2">
              {objects.map(obj => (
                <div key={obj.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
                  <div className="flex-1">
                    <p className="font-display text-[#56624F] text-sm">{obj.name}</p>
                    <p className="font-serif italic text-[#8A9280] text-xs mt-0.5 line-clamp-2">{obj.memory}</p>
                    <p className="text-[10px] text-[#B2A394] mt-1">{obj.date} · {obj.drawer}</p>
                  </div>
                  <span className="text-[#C7A85A] text-lg">⊙</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drawers */}
        <div className="mx-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-[#D3CCC1]" />
            <p className="text-[10px] tracking-widest text-[#B2A394] uppercase">Collection Growth</p>
            <div className="h-px flex-1 bg-[#D3CCC1]" />
          </div>
          <p className="font-serif italic text-[#8A9280] text-xs text-center mb-4">As more little things are treasured, your collection grows naturally.</p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {DRAWERS.map(d => (
              <div key={d.id} className="rounded-2xl p-3 text-center" style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
                <img src="/gpt/keepsake-box/found-objects.png" alt={d.label} className="w-full mb-2" style={{ height: 50, objectFit: 'contain' }} />
                <p className="font-display text-[#56624F] text-[9px] font-semibold">{d.label}</p>
                <p className="font-serif italic text-[#8A9280] text-[8px] mb-1">{d.sub}</p>
                {d.items.map(item => <p key={item} className="text-[8px] text-[#B2A394]">• {item}</p>)}
              </div>
            ))}
          </div>

          <div className="text-center py-3">
            <p className="font-serif italic text-[#71806A] text-xs">No counters. No achievements. No progress bars.</p>
            <p className="font-serif italic text-[#71806A] text-xs">Only a life filled with meaning.</p>
            <p className="text-[#C7A85A] mt-2">♥</p>
          </div>
        </div>

      </main>
      <MeadowNav />
    </div>
  );
}
