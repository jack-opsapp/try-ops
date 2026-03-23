'use client';

/**
 * PhoneSceneWrapper — Client component bridge between the server-rendered
 * PlatformHero and the dynamically-imported 3D PhoneScene.
 *
 * Responsibilities:
 * 1. Dynamic import of PhoneScene (no SSR — Three.js needs browser APIs)
 * 2. IntersectionObserver to pause rendering when off-screen (battery saver)
 * 3. Shows PhoneSceneFallback while the 3D bundle loads
 */

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PhoneSceneFallback from './PhoneSceneFallback';

const PhoneScene = dynamic(() => import('./PhoneScene'), {
  ssr: false,
  loading: () => <PhoneSceneFallback />,
});

export default function PhoneSceneWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Default to true — hero is above the fold, visible on initial load.
  // IntersectionObserver will set to false when scrolled away.
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <PhoneScene isVisible={isVisible} />
    </div>
  );
}
