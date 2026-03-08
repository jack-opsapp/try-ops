'use client';

import StarburstCanvas from '@/components/animations/StarburstCanvas';

interface StarburstProps {
  leftText?: string;
  rightText?: string;
}

export function Starburst({ leftText = 'COMMAND', rightText = 'CHAOS' }: StarburstProps) {
  return (
    <section className="relative h-[100svh] md:h-[80vh] w-full overflow-hidden bg-ops-background snap-start snap-always">
      <StarburstCanvas className="absolute inset-0 w-full h-full" />
      <div className="pointer-events-none absolute inset-0">
        <h2
          className="absolute font-heading font-bold uppercase text-white/10 text-[clamp(3rem,10vw,9rem)] leading-none tracking-widest select-none"
          style={{ top: '32%', left: '6%' }}
        >
          {leftText}
        </h2>
        <h2
          className="absolute font-heading font-bold uppercase text-white/10 text-[clamp(3rem,10vw,9rem)] leading-none tracking-widest select-none"
          style={{ bottom: '32%', right: '6%' }}
        >
          {rightText}
        </h2>
      </div>
    </section>
  );
}
