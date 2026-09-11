'use client';

/**
 * PhoneSceneWrapper — Client component bridge between the server-rendered
 * PlatformHero and the dynamically-imported 3D PhoneScene.
 *
 * Responsibilities:
 * 1. Dynamic import of PhoneScene (no SSR — Three.js needs browser APIs)
 * 2. IntersectionObserver to pause rendering when off-screen (battery saver)
 * 3. Shows PhoneSceneFallback while the 3D bundle loads
 * 4. Never mounts the scene on a browser with no WebGL, and catches the throw
 *    if one happens anyway — a failed hero must not take the page with it
 */

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PhoneSceneFallback from './PhoneSceneFallback';
import PhoneSceneBoundary, { supportsWebGL } from './PhoneSceneBoundary';

const PhoneScene = dynamic(() => import('./PhoneScene'), {
  ssr: false,
  loading: () => <PhoneSceneFallback />,
});

export default function PhoneSceneWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Default to true — hero is above the fold, visible on initial load.
  // IntersectionObserver will set to false when scrolled away.
  const [isVisible, setIsVisible] = useState(true);
  // Null until the check runs on the client, so the server and the first
  // client render agree and hydration stays quiet.
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => setWebgl(supportsWebGL()), []);

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
      {webgl === false ? (
        <PhoneSceneFallback />
      ) : webgl === null ? (
        <PhoneSceneFallback />
      ) : (
        <PhoneSceneBoundary>
          <PhoneScene isVisible={isVisible} />
        </PhoneSceneBoundary>
      )}
    </div>
  );
}
