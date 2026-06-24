'use client';

import BottomNav from './BottomNav';

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full bg-[#F3F0EA]">
      <main className="flex-1 overflow-y-auto pb-20 max-w-lg mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
