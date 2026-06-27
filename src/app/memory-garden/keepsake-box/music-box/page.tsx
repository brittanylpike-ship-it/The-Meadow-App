'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MeadowNav from '@/components/MeadowNav';
import { useSound } from '@/hooks/useSound';

type Voicemail = { id: string; title: string; from: string; notes: string; audioUrl?: string; date: string; };

export default function MusicBoxPage() {
  const [voicemails, setVoicemails] = useState<Voicemail[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', from: '', notes: '', audioUrl: '' });
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { play } = useSound();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setForm(f => ({ ...f, audioUrl: URL.createObjectURL(file), title: f.title || file.name.replace(/\.[^.]+$/, '') }));
  }

  function handleSave() {
    if (!form.title.trim()) return;
    setVoicemails(prev => [...prev, { ...form, id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }]);
    play('chime');
    setSaved(true);
    setAdding(false);
    setForm({ title: '', from: '', notes: '', audioUrl: '' });
    setTimeout(() => setSaved(false), 3000);
  }

  function togglePlay(vm: Voicemail) {
    if (playing === vm.id) {
      audioRef.current?.pause();
      setPlaying(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      if (vm.audioUrl) {
        audioRef.current = new Audio(vm.audioUrl);
        audioRef.current.play();
        audioRef.current.onended = () => setPlaying(null);
        setPlaying(vm.id);
      }
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F3F0EA]">
      <main className="flex-1 max-w-[680px] mx-auto w-full pb-[130px]">
        <div className="px-4 pt-4 pb-1">
          <Link href="/memory-garden/keepsake-box" className="text-xs text-[#71806A] flex items-center gap-1">← Back</Link>
        </div>

        <div className="px-6 pt-2 pb-4">
          <h1 className="font-display text-3xl text-[#56624F]">Music Box</h1>
          <p className="text-[10px] tracking-widest text-[#B2A394] uppercase mt-1">Voicemail Preservation</p>
          <div className="h-px bg-[#D3CCC1] mt-3 mb-3" />
          <p className="font-serif italic text-[#71806A] text-sm">Some voices deserve to be kept close forever.</p>
          <p className="text-[#C7A85A] mt-1">♥</p>
        </div>

        <div className="mx-4 mb-4">
          <div className="rounded-2xl overflow-hidden" style={{ background: '#EDE7D9', border: '2px solid #C8B898' }}>
            <img src="/gpt/keepsake-box/music-box.png" alt="Music Box" className="w-full block" style={{ maxHeight: 220, objectFit: 'contain' }} />
          </div>
        </div>

        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-4 mb-4 p-3 rounded-2xl text-center" style={{ background: '#e8f0e4', border: '1px solid #8ab07a' }}>
              <p className="font-serif italic text-[#56624F] text-sm">Voice preserved in the music box ✦</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-4 mb-4">
          {!adding ? (
            <button onClick={() => { play('chime'); setAdding(true); }}
              className="w-full py-4 rounded-2xl font-display text-[#56624F] text-base"
              style={{ background: '#EDE7D9', border: '2px solid #C8B898' }}>
              Preserve a Voice ✦
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 space-y-3" style={{ background: '#EDE7D9', border: '1px solid #D3CCC1' }}>
              <h2 className="font-display text-xl text-[#56624F]">Preserve a Voice</h2>

              <input ref={fileRef} type="file" accept="audio/*,video/*" className="hidden" onChange={handleFileChange} />
              <button onClick={() => fileRef.current?.click()}
                className="w-full py-3 rounded-xl font-serif text-sm text-[#71806A]"
                style={{ border: '1.5px dashed #C8B898', background: 'rgba(255,255,255,0.4)' }}>
                {form.audioUrl ? '✦ Audio selected' : '⬆ Upload a voicemail or recording'}
              </button>
              {form.audioUrl && <audio src={form.audioUrl} controls className="w-full" />}

              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Give it a title..." className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60" style={{ border: '1px solid #D3CCC1' }} />
              <input value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                placeholder="Who is this from..." className="w-full rounded-xl px-3 py-2.5 font-serif text-sm text-[#56624F] outline-none bg-white/60" style={{ border: '1px solid #D3CCC1' }} />
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notes or memory about this recording..."
                className="w-full rounded-xl p-3 font-serif text-sm text-[#56624F] outline-none resize-none bg-white/60"
                style={{ border: '1px solid #D3CCC1', minHeight: 70 }} />
              <div className="flex gap-2">
                <button onClick={() => setAdding(false)} className="flex-1 py-3 rounded-2xl font-serif text-sm text-[#71806A]" style={{ background: '#F3F0EA', border: '1px solid #D3CCC1' }}>Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 rounded-2xl font-serif text-sm text-white" style={{ background: '#71806A' }}>Place in box ✦</button>
              </div>
            </motion.div>
          )}
        </div>

        {voicemails.length > 0 && (
          <div className="mx-4">
            <p className="font-display text-[#56624F] text-sm mb-3">Your Music Box</p>
            <div className="space-y-3">
              {voicemails.map(vm => (
                <motion.div key={vm.id} whileTap={{ scale: 0.98 }}
                  className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                  style={{ background: playing === vm.id ? '#f0e8f4' : '#EDE7D9', border: `1px solid ${playing === vm.id ? '#C8B8D8' : '#D3CCC1'}` }}
                  onClick={() => togglePlay(vm)}>
                  <motion.div
                    animate={{ scale: playing === vm.id ? [1, 1.15, 1] : 1 }}
                    transition={{ repeat: playing === vm.id ? Infinity : 0, duration: 1 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: playing === vm.id ? '#C8B8D8' : '#D3CCC1' }}>
                    <span className="text-xl">{playing === vm.id ? '⏸' : '▶'}</span>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[#56624F] text-sm">{vm.title}</p>
                    {vm.from && <p className="text-[10px] text-[#8A9280] font-serif italic">from {vm.from}</p>}
                    {vm.notes && <p className="text-[10px] text-[#B2A394] mt-0.5 truncate">{vm.notes}</p>}
                    <p className="text-[9px] text-[#B2A394] mt-1">{vm.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
      <MeadowNav />
    </div>
  );
}
