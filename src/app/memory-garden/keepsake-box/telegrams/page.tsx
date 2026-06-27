'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MeadowNav from '@/components/MeadowNav';
import { useSound } from '@/hooks/useSound';

type Telegram = { id: string; sender: string; message: string; date: string; feeling: string; };

export default function TelegramsPage() {
  const [telegrams, setTelegrams] = useState<Telegram[]>([]);
  const [form, setForm] = useState({ sender: '', message: '', feeling: '' });
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);
  const { play } = useSound();

  function handleSave() {
    if (!form.message.trim()) return;
    setTelegrams(prev => [...prev, { ...form, id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }]);
    play('chime');
    setSaved(true);
    setAdding(false);
    setForm({ sender: '', message: '', feeling: '' });
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F3F0EA]">
      <main className="flex-1 max-w-[680px] mx-auto w-full pb-[130px]">
        <div className="px-4 pt-4 pb-1">
          <Link href="/memory-garden/keepsake-box" className="text-xs text-[#71806A] flex items-center gap-1">← Back</Link>
        </div>

        <div className="px-6 pt-2 pb-4">
          <h1 className="font-display text-3xl text-[#56624F]">Telegrams</h1>
          <p className="text-[10px] tracking-widest text-[#B2A394] uppercase mt-1">Text Message Archives</p>
          <div className="h-px bg-[#D3CCC1] mt-3 mb-3" />
          <p className="font-serif italic text-[#71806A] text-sm">Some words deserve to be kept forever.</p>
          <p className="text-[#C7A85A] mt-1">♥</p>
        </div>

        <div className="mx-4 mb-4">
          <div className="rounded-2xl overflow-hidden" style={{ background: '#EDE7D9', border: '2px solid #C8B898' }}>
            <img src="/gpt/keepsake-box/telegrams.png" alt="Telegrams" className="w-full block" style={{ maxHeight: 220, objectFit: 'contain' }} />
          </div>
        </div>

        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-4 mb-4 p-3 rounded-2xl text-center" style={{ background: '#e8f0e4', border: '1px solid #8ab07a' }}>
              <p className="font-serif italic text-[#56624F] text-sm">Telegram preserved ✦</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-4 mb-4">
          {!adding ? (
            <button onClick={() => { play('woodSlide'); setAdding(true); }}
              className="w-full py-4 rounded-2xl font-display text-[#56624F] text-base"
              style={{ background: '#EDE7D9', border: '2px solid #C8B898' }}>
              Preserve a Message ✦
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 space-y-3" style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
              <h2 className="font-display text-xl text-[#56624F]">Preserve a Message</h2>
              <input value={form.sender} onChange={e => setForm(f => ({ ...f, sender: e.target.value }))}
                placeholder="Who sent it..."
                className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60"
                style={{ border: '1px solid #D3CCC1' }} />
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Paste or write the message..."
                className="w-full rounded-xl p-3 font-serif text-sm text-[#56624F] outline-none resize-none bg-white/60"
                style={{ border: '1px solid #D3CCC1', minHeight: 100 }} />
              <input value={form.feeling} onChange={e => setForm(f => ({ ...f, feeling: e.target.value }))}
                placeholder="Why does this matter to you..."
                className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60"
                style={{ border: '1px solid #D3CCC1' }} />
              <div className="flex gap-2">
                <button onClick={() => setAdding(false)} className="flex-1 py-3 rounded-2xl font-serif text-sm text-[#71806A]" style={{ background: '#F3F0EA', border: '1px solid #D3CCC1' }}>Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 rounded-2xl font-serif text-sm text-white" style={{ background: '#71806A' }}>Seal it ✦</button>
              </div>
            </motion.div>
          )}
        </div>

        {telegrams.length > 0 && (
          <div className="mx-4">
            <p className="font-display text-[#56624F] text-sm mb-3">Your Archive</p>
            <div className="space-y-3">
              {telegrams.map(t => (
                <div key={t.id} className="rounded-2xl p-4" style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-display text-[#56624F] text-sm">{t.sender || 'Unknown sender'}</p>
                    <p className="text-[9px] text-[#B2A394]">{t.date}</p>
                  </div>
                  <p className="font-serif italic text-[#71806A] text-sm leading-relaxed border-l-2 border-[#C8B898] pl-3">"{t.message}"</p>
                  {t.feeling && <p className="text-[10px] text-[#B2A394] mt-2 italic">{t.feeling}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <MeadowNav />
    </div>
  );
}
