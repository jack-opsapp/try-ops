'use client';

/**
 * PhoneSceneFallback — Static placeholder before 3D loads.
 * Matches the initial angle and size of the R3F phone scene.
 * CSS-only — no Three.js dependency.
 */

export default function PhoneSceneFallback() {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div
        className="relative w-[200px] h-[410px] rounded-[16px] border border-white/[0.12]"
        style={{
          background: '#0A0A0A',
          transform: 'perspective(800px) rotateY(-15deg) rotateX(5deg)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Dynamic Island suggestion */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[60px] h-[16px] rounded-full border border-white/[0.08]" />

        {/* Screen area — dark with subtle pulse */}
        <div className="absolute inset-[6px] rounded-[12px] bg-[#0A0A0A] animate-pulse opacity-30" />
      </div>
    </div>
  );
}
