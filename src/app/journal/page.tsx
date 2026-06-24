'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useMeadowState } from '@/context/meadow-state';
import MeadowNav from '@/components/MeadowNav';

// ─── Mood config ────────────────────────────────────────────────────────────
const MOODS = [
  { id: 'heavy',   label: 'HEAVY',   symbol: '☁',  prompt: 'What feels too heavy to hold alone today?',    bg: '#dce4ec', border: '#9fb0be' },
  { id: 'tender',  label: 'TENDER',  symbol: '❀',  prompt: 'What part of you needs gentleness right now?', bg: '#f7e6ec', border: '#d4a0b4' },
  { id: 'okay',    label: 'OKAY',    symbol: '❧',  prompt: 'What ordinary thing felt steady today?',        bg: '#e4f0de', border: '#8ab07a' },
  { id: 'quiet',   label: 'QUIET',   symbol: '☽',  prompt: 'You can write softly or say very little.',     bg: '#dce4f4', border: '#8090c0' },
  { id: 'hopeful', label: 'HOPEFUL', symbol: '✦',  prompt: 'Let the small light have a place.',             bg: '#f8f2d8', border: '#c8b860' },
  { id: 'numb',    label: 'NUMB',    symbol: '⊹',  prompt: 'You do not have to force feeling.',             bg: '#ebe8e0', border: '#b0a898' },
] as const;

type MoodId = typeof MOODS[number]['id'];

// ─── Quill dimensions (display size) ────────────────────────────────────────
const QUILL_W = 44;   // px wide
const QUILL_H = 130;  // px tall (approx)
const NIB_X   = 8;    // nib is ~8px from left edge of the image
const NIB_Y   = QUILL_H - 8; // nib is near the bottom

// ─── Get viewport-fixed pixel position of cursor inside textarea ─────────────
// Returns coords suitable for position:fixed so no parent clipping applies.
function getCaretViewportPos(el: HTMLTextAreaElement): { x: number; y: number } {
  const elRect = el.getBoundingClientRect();
  const cs     = getComputedStyle(el);

  const mirror = document.createElement('div');
  Object.assign(mirror.style, {
    position:      'fixed',
    top:           elRect.top  + 'px',
    left:          elRect.left + 'px',
    width:         elRect.width  + 'px',
    height:        elRect.height + 'px',
    visibility:    'hidden',
    pointerEvents: 'none',
    overflow:      'hidden',
    whiteSpace:    'pre-wrap',
    wordWrap:      'break-word',
    overflowWrap:  'break-word',
    boxSizing:     'border-box',
    padding:       `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
    fontSize:      cs.fontSize,
    fontFamily:    cs.fontFamily,
    fontWeight:    cs.fontWeight,
    lineHeight:    cs.lineHeight,
    letterSpacing: cs.letterSpacing,
  });

  const inner = document.createElement('div');
  inner.style.marginTop = `-${el.scrollTop}px`;

  const textNode = document.createTextNode(el.value.slice(0, el.selectionStart ?? 0));
  const caret    = document.createElement('span');
  caret.textContent = '​';

  inner.appendChild(textNode);
  inner.appendChild(caret);
  mirror.appendChild(inner);
  document.body.appendChild(mirror);

  const cr = caret.getBoundingClientRect();
  document.body.removeChild(mirror);

  // Return viewport coords — quill will use position:fixed
  return { x: cr.left, y: cr.top };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function JournalPage() {
  const { entries, saveEntry } = useMeadowState();
  const [mood,      setMood]      = useState<MoodId | null>(null);
  const [body,      setBody]      = useState('');
  const [quillPos,  setQuillPos]  = useState<{ x: number; y: number } | null>(null);
  const [isDipping, setIsDipping] = useState(false);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const writingRef   = useRef<HTMLDivElement>(null);
  const inkwellRef   = useRef<HTMLDivElement>(null);

  const activeMood = MOODS.find(m => m.id === mood);
  const prompt     = activeMood?.prompt ?? "What's on your heart right now?\nWrite freely. No pressure. No rules.";

  // Move quill to current cursor position
  const syncQuill = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta || document.activeElement !== ta) return;
    setQuillPos(getCaretViewportPos(ta));
  }, []);

  // Dip animation: quill flies to inkwell and back
  const dip = useCallback(async () => {
    const inkEl = inkwellRef.current;
    if (!inkEl) return;

    const inkRect = inkEl.getBoundingClientRect();
    // Use viewport coords to match position:fixed quill
    const inkX = inkRect.left + inkRect.width  / 2;
    const inkY = inkRect.top  + inkRect.height / 2;

    setIsDipping(true);
    setQuillPos({ x: inkX, y: inkY });
    await new Promise(r => setTimeout(r, 380));
    setIsDipping(false);
    requestAnimationFrame(syncQuill);
  }, [syncQuill]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    requestAnimationFrame(syncQuill);
  }, [syncQuill]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') dip();
  }, [dip]);

  function handleSave() {
    if (!body.trim()) return;
    saveEntry({
      body: body.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      mood: activeMood?.label ?? 'Quiet',
    });
    setBody('');
    setMood(null);
    setQuillPos(null);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-[#F3F0EA]">
      <main className="flex-1 max-w-[680px] mx-auto w-full pb-[130px]">

        {/* ── Header + mood icons (all inside journal-page.png) ── */}
        {/* Image is 853×1844. Mood row sits ~30–44% down. Crop to 46%. */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '853 / 755' }}>
          <img src="/gpt/journal-page.png" alt="My Journal" className="w-full block" />

          {/* Invisible mood hotspots over the illustrated icons in the image */}
          {MOODS.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setMood(mood === m.id ? null : m.id)}
              aria-label={m.label}
              style={{
                position: 'absolute',
                top:    '66%',
                height: '22%',
                left:   `${i * (100 / 6)}%`,
                width:  `${100 / 6}%`,
                background: mood === m.id ? 'rgba(113,128,106,0.15)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>

        <div className="px-4 pt-1">

          {/* ── Writing area ── */}
          <div
            ref={writingRef}
            className="relative rounded-2xl mb-4"
            style={{
              background:   activeMood?.bg     ?? '#F5F0E8',
              border:       `1.5px solid ${activeMood?.border ?? '#D3CCC1'}`,
              transition:   'background 0.45s ease, border-color 0.45s ease',
              minHeight:    260,
              overflow:     'hidden',
            }}
          >
            <div className="p-4 pb-2">
              <p className="text-sm text-[#8A9280] italic font-serif mb-3 leading-relaxed whitespace-pre-line">
                {prompt}
              </p>
              <textarea
                ref={textareaRef}
                value={body}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={syncQuill}
                onClick={syncQuill}
                onSelect={syncQuill}
                onBlur={() => setQuillPos(null)}
                className="w-full bg-transparent resize-none text-[#56624F] font-serif text-base outline-none leading-relaxed"
                style={{ minHeight: 140 }}
              />
            </div>

            {/* Inkwell — bottom-right anchor */}
            <div
              ref={inkwellRef}
              className="absolute"
              style={{ bottom: 40, right: 16, width: 52, height: 52 }}
            >
              <img src="/gpt/inkwell.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
            </div>

            {/* "Be honest. Be kind." */}
            <div className="px-4 pb-3 flex justify-end">
              <span className="text-[#C7A85A] italic font-serif text-sm">Be honest. Be kind.</span>
            </div>

            {/* Quill — position:fixed so overflow:hidden never clips it */}
            {quillPos && (
              <img
                src="/gpt/quill-pen.png"
                alt=""
                aria-hidden="true"
                style={{
                  position:      'fixed',
                  left:          quillPos.x - NIB_X,
                  top:           quillPos.y - NIB_Y,
                  width:         QUILL_W,
                  pointerEvents: 'none',
                  zIndex:        9999,
                  transition:    isDipping
                    ? 'left 0.28s cubic-bezier(.4,0,.2,1), top 0.28s cubic-bezier(.4,0,.2,1)'
                    : 'left 0.06s linear, top 0.06s linear',
                  mixBlendMode:  'multiply',
                }}
              />
            )}
          </div>

          {/* ── Action buttons ── */}
          <div className="flex gap-3 mb-5">
            <button className="flex-1 py-3.5 rounded-2xl text-center" style={{ background: '#64735E' }}>
              <span className="block text-sm font-medium tracking-wide text-white">✦ AI Prompt</span>
              <span className="block text-xs italic text-white/75">Guidance for your entry.</span>
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3.5 rounded-2xl text-center border transition-opacity active:opacity-70"
              style={{ borderColor: '#D3CCC1', background: '#EFEAE2' }}
            >
              <span className="block text-sm font-medium tracking-wide text-[#56624F]">♥ Save Entry</span>
              <span className="block text-xs italic text-[#B2A394]">Save to your journal.</span>
            </button>
          </div>

          {/* ── Past entries ── */}
          {entries.length > 0 && (
            <div className="space-y-2.5">
              {entries.slice(0, 5).map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: '#EFEAE2', border: '1px solid #D3CCC1' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#56624F]">{e.date}</p>
                    <p className="text-xs text-[#B2A394] font-serif truncate">{e.body.slice(0, 50)}…</p>
                  </div>
                  <span className="text-[#D3CCC1] text-xl ml-2">›</span>
                </div>
              ))}
              <button className="text-xs text-[#71806A] italic underline underline-offset-2 pl-1 mt-1">
                View all entries ›
              </button>
            </div>
          )}

        </div>
      </main>

      <MeadowNav />
    </div>
  );
}
