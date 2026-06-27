'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MeadowNav from '@/components/MeadowNav';
import { useSound } from '@/hooks/useSound';

type Reel = {
  id: string;
  title: string;
  description: string;
  people: string;
  place: string;
  reelDate: string;
  category: 'family' | 'celebrations' | 'everyday';
  videoUrl?: string;
  date: string;
};

const STEPS = [
  { num: 1, title: 'Open the Archive', body: 'Lift the lid to open the archive. Reels rest safely inside. Your memories are always here.', note: '♪ Soft wood-on-wood slide / Gentle brass click' },
  { num: 2, title: 'Add or Select a Reel', body: 'Add a new memory reel, or select an existing reel. Each reel holds your story.', note: 'The chosen reel becomes the focus.' },
  { num: 3, title: 'Add Your Video', body: 'Upload a video from your device. Capture a meaningful moment. This memory becomes part of your collection.', note: '"Your moment, preserved for years to come."' },
  { num: 4, title: 'Name & Describe', body: 'Give your reel a title. Write a short description. Add any details that capture the moment.', note: '"Names fade from memory, but stories remain."' },
  { num: 5, title: 'Categorize the Reel', body: 'Choose the category that fits: Family Memories, Celebrations, or Everyday Moments.', note: '♪ A place for every memory.' },
  { num: 6, title: 'Add Notes & Context', body: 'Add notes, people, place, or date. Capture the feeling behind the moment. Connect to a journal entry.', note: 'Details deepen the memory.' },
  { num: 7, title: 'Watch & Remember', body: 'Watch your video. Relive the moment. Feel it all over again.', note: '♥ "Memories replay. Feelings stay."' },
  { num: 8, title: 'Return the Reel', body: 'Place the reel back in the archive. It\'s safe, cherished, and preserved. Your memories remain with you.', note: '"Safe today. Treasured forever."' },
];

const CATEGORIES = [
  { id: 'family', label: 'Family Memories', items: ['Family Time', 'Everyday Life', 'Precious Moments'] },
  { id: 'celebrations', label: 'Celebrations', items: ['Birthdays', 'Holidays', 'Special Events'] },
  { id: 'everyday', label: 'Everyday Moments', items: ['Little Joys', 'Simple Days', "Life's Beauty"] },
];

export default function VideoReelsPage() {
  const [step, setStep] = useState<number | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [form, setForm] = useState({ title: '', description: '', people: '', place: '', reelDate: '', category: 'family' as Reel['category'], videoUrl: '' });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { play } = useSound();

  function startFlow() { play('woodSlide'); setStep(0); setSaved(false); }

  function handleNext() {
    play('brassClick');
    if (step !== null && step < STEPS.length - 1) setStep(s => (s ?? 0) + 1);
    else {
      if (form.title.trim()) {
        setReels(prev => [...prev, { ...form, id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }]);
      }
      play('chime');
      setSaved(true);
      setStep(null);
      setForm({ title: '', description: '', people: '', place: '', reelDate: '', category: 'family', videoUrl: '' });
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setForm(f => ({ ...f, videoUrl: URL.createObjectURL(file) }));
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F3F0EA]">
      <main className="flex-1 max-w-[680px] mx-auto w-full pb-[130px]">

        <div className="px-4 pt-4 pb-1">
          <Link href="/memory-garden/keepsake-box" className="text-xs text-[#71806A] flex items-center gap-1">← Back</Link>
        </div>

        <div className="px-6 pt-2 pb-1">
          <h1 className="font-display text-4xl text-[#56624F] leading-tight uppercase tracking-wide">Video Archive<br/>Reels</h1>
          <p className="font-serif italic text-[#8A9280] text-sm mt-1">Preserve the Moments That Matter</p>
          <div className="h-px bg-[#D3CCC1] mt-3 mb-3" />
          <p className="font-serif italic text-[#71806A] text-sm">Some moments deserve to be kept close.</p>
          <p className="text-[#C7A85A] mt-1">♥</p>
        </div>

        <div className="mx-4 mb-4 mt-2">
          <div className="rounded-2xl overflow-hidden" style={{ background: '#EDE7D9', border: '2px solid #C8B898' }}>
            <img src="/gpt/keepsake-box/video-archive.png" alt="Video Reels" className="w-full block" style={{ maxHeight: 240, objectFit: 'contain' }} />
          </div>
        </div>

        {step === null && !saved && (
          <div className="mx-4 mb-4">
            <button onClick={startFlow} className="w-full py-4 rounded-2xl font-display text-[#56624F] text-base" style={{ background: '#EDE7D9', border: '2px solid #C8B898' }}>
              Open the Archive ✦
            </button>
          </div>
        )}

        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mb-4 p-4 rounded-2xl text-center" style={{ background: '#e8f0e4', border: '1px solid #8ab07a' }}>
              <p className="font-display text-[#56624F]">Safe today. Treasured forever. ✦</p>
              <p className="font-serif italic text-[#8A9280] text-sm mt-1">Your reel rests in the archive.</p>
              <button onClick={() => setSaved(false)} className="mt-3 text-xs text-[#71806A] underline">Add another reel</button>
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

                {step === 2 && (
                  <div>
                    <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full py-3 rounded-xl font-serif text-sm text-[#71806A]"
                      style={{ background: 'white/60', border: '1.5px dashed #C8B898' }}>
                      {form.videoUrl ? '✦ Video selected' : '⬆ Upload a video'}
                    </button>
                    {form.videoUrl && (
                      <video src={form.videoUrl} controls className="w-full rounded-xl mt-2" style={{ maxHeight: 180 }} />
                    )}
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-2">
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Give your reel a title..."
                      className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60"
                      style={{ border: '1px solid #D3CCC1' }} />
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Write a short description..."
                      className="w-full rounded-xl p-3 font-serif text-sm text-[#56624F] outline-none resize-none bg-white/60"
                      style={{ border: '1px solid #D3CCC1', minHeight: 70 }} />
                  </div>
                )}
                {step === 4 && (
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Reel['category'] }))}
                    className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60"
                    style={{ border: '1px solid #D3CCC1' }}>
                    <option value="family">Family Memories</option>
                    <option value="celebrations">Celebrations</option>
                    <option value="everyday">Everyday Moments</option>
                  </select>
                )}
                {step === 5 && (
                  <div className="space-y-2">
                    <input value={form.people} onChange={e => setForm(f => ({ ...f, people: e.target.value }))}
                      placeholder="Add people..." className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60" style={{ border: '1px solid #D3CCC1' }} />
                    <input value={form.place} onChange={e => setForm(f => ({ ...f, place: e.target.value }))}
                      placeholder="Add place..." className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60" style={{ border: '1px solid #D3CCC1' }} />
                    <input value={form.reelDate} onChange={e => setForm(f => ({ ...f, reelDate: e.target.value }))}
                      type="date" className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60" style={{ border: '1px solid #D3CCC1' }} />
                  </div>
                )}
                {step === 6 && form.videoUrl && (
                  <video src={form.videoUrl} controls className="w-full rounded-xl" style={{ maxHeight: 180 }} />
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
                  {step === STEPS.length - 1 ? 'Return the reel ✦' : 'Continue →'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {reels.length > 0 && (
          <div className="mx-4 mb-4">
            <p className="font-display text-[#56624F] text-sm mb-3">Your Archive</p>
            <div className="space-y-2">
              {reels.map(r => (
                <div key={r.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#D3CCC1' }}>
                    <span className="text-2xl">🎞</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[#56624F] text-sm">{r.title}</p>
                    <p className="font-serif italic text-[#8A9280] text-xs mt-0.5 truncate">{r.description}</p>
                    <p className="text-[9px] text-[#B2A394] mt-1">{r.date} · {r.category}</p>
                  </div>
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
            {CATEGORIES.map(c => (
              <div key={c.id} className="rounded-2xl p-3 text-center" style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
                <p className="font-display text-[#56624F] text-[9px] font-semibold mb-1">{c.label}</p>
                {c.items.map(item => <p key={item} className="text-[8px] text-[#B2A394]">• {item}</p>)}
              </div>
            ))}
          </div>
          <p className="font-serif italic text-[#8A9280] text-xs text-center">Our moments. Our stories. Our legacy.</p>
        </div>

      </main>
      <MeadowNav />
    </div>
  );
}
