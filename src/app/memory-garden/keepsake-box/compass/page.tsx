'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MeadowNav from '@/components/MeadowNav';
import { useSound } from '@/hooks/useSound';

const STEPS = [
  { num: 1, title: 'Open the Compass', body: 'The compass is open and ready to guide you.', note: '♪ Soft brass chime / Watch opens gently', action: null },
  { num: 2, title: 'Set Your Intention', body: 'Pause and reflect. Write or think about what you seek guidance in.', note: '"Clarity begins with intention."', action: 'write', placeholder: 'What matters most to me right now...' },
  { num: 3, title: 'Follow the Needle', body: 'Hold the compass. The needle will settle toward your true north.', note: '♪ Gentle tick / Needle settles', action: null },
  { num: 4, title: 'Reveal Your Guidance', body: 'Open the lid to reveal your message. Let the words speak to your heart.', note: '"Guidance appears just for you."', action: 'reveal' },
  { num: 5, title: 'Add Notes & Wisdom', body: 'Add your own notes or reflections. Capture the wisdom you receive.', note: '"Write it down. Let it stay with you."', action: 'notes' },
  { num: 6, title: 'Check In Often', body: 'Return when you need clarity or reassurance. Your compass is always here.', note: '"Guidance is not once. It\'s a relationship."', action: null },
  { num: 7, title: 'Honor the Message', body: 'Take inspired action. Let the message guide your choices and steps.', note: '"Small steps. Meaningful change."', action: null },
  { num: 8, title: 'Close & Carry With You', body: 'Close your compass. Carry it with you always. Let it remind you of what matters most.', note: '♪ Soft chime / Compass closes', action: null },
];

const COLLECTIONS = [
  { id: 'inner', label: 'Compass One', sub: 'Inner Guidance', items: ['Values', 'Purpose', 'Dreams'] },
  { id: 'journeys', label: 'Compass Two', sub: "Life's Journeys", items: ['Decisions', 'Transitions', 'New Paths'] },
  { id: 'relationships', label: 'Compass Three', sub: 'Relationships', items: ['Love', 'Family', 'Friends'] },
];

const GUIDANCE = [
  'Where your heart leads, you\'ll never be lost.',
  'Trust yourself. You are on the right path.',
  'The answer lives within you already.',
  'Small steps still move you forward.',
  'You know more than you think you do.',
];

export default function CompassPage() {
  const [step, setStep] = useState(0);
  const [intention, setIntention] = useState('');
  const [notes, setNotes] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [guidance] = useState(() => GUIDANCE[Math.floor(Math.random() * GUIDANCE.length)]);
  const [isOpen, setIsOpen] = useState(false);
  const { play } = useSound();

  const current = STEPS[step];

  function handleNext() {
    play('brassClick');
    if (step < STEPS.length - 1) setStep(s => s + 1);
  }

  function handleOpen() {
    play('chime');
    setIsOpen(true);
    setStep(0);
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F3F0EA]">
      <main className="flex-1 max-w-[680px] mx-auto w-full pb-[130px]">

        <div className="px-4 pt-4 pb-1">
          <Link href="/memory-garden/keepsake-box" className="text-xs text-[#71806A] flex items-center gap-1">← Back</Link>
        </div>

        {/* Header */}
        <div className="px-6 pt-2 pb-4">
          <p className="text-[10px] tracking-[0.2em] text-[#B2A394] uppercase">Pocket Watch</p>
          <h1 className="font-display text-4xl text-[#56624F] leading-tight">Compass</h1>
          <p className="font-serif italic text-[#8A9280] text-sm mt-1">Guidance for the Journey That Matters Most.</p>
          <div className="h-px bg-[#D3CCC1] mt-3" />
          <p className="font-serif italic text-[#71806A] text-sm mt-3">A gentle compass to help you stay true to what matters.</p>
          <p className="text-[#C7A85A] mt-1">♥</p>
        </div>

        {/* Compass illustration */}
        <div className="mx-4 mb-4">
          <motion.div
            className="relative rounded-2xl overflow-hidden cursor-pointer"
            style={{ background: '#EDE7D9', border: '2px solid #C8B898', minHeight: 200 }}
            onClick={!isOpen ? handleOpen : undefined}
          >
            <img src="/gpt/keepsake-box/pocketwatch-compass.png" alt="Compass" className="w-full block" style={{ maxHeight: 260, objectFit: 'contain' }} />

            {!isOpen && (
              <div className="absolute inset-0 flex items-end justify-center pb-4">
                <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="font-serif italic text-[#C7A85A] text-sm">Tap to open the compass</motion.p>
              </div>
            )}

            {isOpen && revealed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center p-6"
                style={{ background: 'rgba(237,231,217,0.92)' }}
              >
                <p className="font-display text-[#56624F] text-lg text-center italic">"{guidance}"</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Step-through flow */}
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mb-4">
              {/* Step indicator */}
              <div className="flex gap-1 mb-4 justify-center">
                {STEPS.map((s, i) => (
                  <motion.div key={i} className="rounded-full"
                    style={{ width: i === step ? 20 : 6, height: 6, background: i === step ? '#71806A' : i < step ? '#C7A85A' : '#D3CCC1' }}
                    animate={{ width: i === step ? 20 : 6 }} transition={{ duration: 0.2 }} />
                ))}
              </div>

              {/* Current step card */}
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl p-5 mb-3"
                style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}
              >
                <p className="text-[10px] tracking-widest text-[#B2A394] uppercase mb-1">{current.num} / {STEPS.length}</p>
                <h2 className="font-display text-xl text-[#56624F] mb-2">{current.title}</h2>
                <p className="font-serif text-[#71806A] text-sm leading-relaxed mb-3">{current.body}</p>

                {current.action === 'write' && (
                  <textarea
                    value={intention}
                    onChange={e => setIntention(e.target.value)}
                    placeholder={current.placeholder}
                    className="w-full rounded-xl p-3 font-serif text-sm text-[#56624F] outline-none resize-none bg-white/60"
                    style={{ border: '1px solid #D3CCC1', minHeight: 80 }}
                  />
                )}

                {current.action === 'reveal' && (
                  <button
                    onClick={() => { play('chime'); setRevealed(true); }}
                    className="w-full py-2.5 rounded-xl font-serif italic text-[#71806A] text-sm"
                    style={{ background: '#F3F0EA', border: '1px solid #C8B898' }}
                  >
                    ✦ Reveal your guidance
                  </button>
                )}

                {current.action === 'notes' && (
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add a note, a feeling, a wisdom..."
                    className="w-full rounded-xl p-3 font-serif text-sm text-[#56624F] outline-none resize-none bg-white/60"
                    style={{ border: '1px solid #D3CCC1', minHeight: 80 }}
                  />
                )}

                <p className="font-serif italic text-[#C7A85A] text-xs mt-3">{current.note}</p>
              </motion.div>

              {/* Navigation */}
              <div className="flex gap-2">
                {step > 0 && (
                  <button onClick={() => { play('brassClick'); setStep(s => s - 1); }}
                    className="flex-1 py-3 rounded-2xl font-serif text-sm text-[#71806A]"
                    style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
                    ← Back
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button onClick={handleNext}
                    className="flex-1 py-3 rounded-2xl font-serif text-sm text-white"
                    style={{ background: '#71806A' }}>
                    Continue →
                  </button>
                ) : (
                  <button onClick={() => { play('chime'); setIsOpen(false); setStep(0); setRevealed(false); }}
                    className="flex-1 py-3 rounded-2xl font-serif italic text-sm text-[#71806A]"
                    style={{ background: '#EDE7D9', border: '1px solid #C8B898' }}>
                    Close the compass ✦
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compass collection */}
        <div className="mx-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-[#D3CCC1]" />
            <p className="text-[10px] tracking-widest text-[#B2A394] uppercase">Your Compass Collection</p>
            <div className="h-px flex-1 bg-[#D3CCC1]" />
          </div>
          <p className="font-serif italic text-[#8A9280] text-xs text-center mb-4">As your journey unfolds, your compass holds each message and moment.</p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {COLLECTIONS.map(col => (
              <div key={col.id} className="rounded-2xl p-3 text-center" style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
                <img src="/gpt/keepsake-box/pocketwatch-compass.png" alt={col.label} className="w-full mb-2" style={{ height: 60, objectFit: 'contain' }} />
                <p className="font-display text-[#56624F] text-[10px] font-semibold">{col.label}</p>
                <p className="font-serif italic text-[#8A9280] text-[9px] mb-2">{col.sub}</p>
                <div className="space-y-0.5">
                  {col.items.map(item => (
                    <p key={item} className="text-[9px] text-[#B2A394]">• {item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center py-4">
            <p className="font-serif italic text-[#71806A] text-xs">No counters. No achievements.</p>
            <p className="font-serif italic text-[#71806A] text-xs">Just a life guided by what matters.</p>
            <p className="text-[#C7A85A] mt-2">♥</p>
          </div>

          <div className="h-px bg-[#D3CCC1] mb-3" />
          <p className="font-serif italic text-[#8A9280] text-xs text-center pb-4">You are never lost when you follow what matters most.</p>
        </div>

      </main>
      <MeadowNav />
    </div>
  );
}
