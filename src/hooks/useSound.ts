'use client';
import { useRef, useCallback } from 'react';

const SOUNDS: Record<string, string> = {
  woodSlide: '/sounds/wood-slide.mp3',
  brassClick: '/sounds/brass-click.mp3',
  chime: '/sounds/chime.mp3',
  pageRustle: '/sounds/page-rustle.mp3',
  lidOpen: '/sounds/lid-open.mp3',
};

export function useSound() {
  const cache = useRef<Record<string, HTMLAudioElement>>({});

  const play = useCallback((name: keyof typeof SOUNDS) => {
    try {
      const src = SOUNDS[name];
      if (!src) return;
      if (!cache.current[name]) {
        cache.current[name] = new Audio(src);
        cache.current[name].volume = 0.4;
      }
      cache.current[name].currentTime = 0;
      cache.current[name].play().catch(() => {});
    } catch {}
  }, []);

  return { play };
}
