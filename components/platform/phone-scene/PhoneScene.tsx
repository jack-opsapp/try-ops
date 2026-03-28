'use client';

/**
 * PhoneScene — R3F Canvas wrapper for the 3D wireframe iPhone.
 *
 * This is the dynamic import target. It sets up the Three.js canvas,
 * camera, and renders the phone model + environment + interaction layer.
 *
 * frameloop switches between "demand" (visible) and "never" (off-screen)
 * via IntersectionObserver in PhoneSceneWrapper. Zero GPU work when static
 * or when scrolled out of view.
 */

import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PhoneModel from './PhoneModel';
import PhoneEnvironment from './PhoneEnvironment';
import PhoneInteraction from './PhoneInteraction';
import { useAutoRotation } from './useAutoRotation';
import { useReducedMotion } from './useReducedMotion';
import { TOUCH } from 'three';
import type { Mesh, Group } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface PhoneSceneContentProps {
  isVisible: boolean;
}

/** Inner scene content — useThree must be called inside Canvas */
function PhoneSceneContent({ isVisible }: PhoneSceneContentProps) {
  const [screenMesh, setScreenMesh] = useState<Mesh | null>(null);

  // Callback ref — fires when PhoneModel's screen mesh mounts/unmounts.
  const screenCallbackRef = useCallback((mesh: Mesh | null) => {
    setScreenMesh(mesh);
  }, []);

  // MutableRefObject so auto-rotation can write .current
  const controlsRef = useRef<OrbitControlsImpl | null>(
    null,
  ) as React.MutableRefObject<OrbitControlsImpl | null>;

  // State signal that flips when OrbitControls mounts, so useAutoRotation's
  // drag-tracking effect re-runs with a non-null controlsRef.current.
  const [controlsReady, setControlsReady] = useState(false);

  // Callback ref for OrbitControls — populates controlsRef AND signals readiness
  const controlsCallbackRef = useCallback((instance: OrbitControlsImpl | null) => {
    controlsRef.current = instance;
    setControlsReady(!!instance);
  }, []);

  const { invalidate } = useThree();

  const [isMobile, setIsMobile] = useState(false);
  const [isHoveringPhone, setIsHoveringPhone] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // --- Intro animation: ease from start angle to resting angle ---
  const introStart = useRef({ az: 1.554, pol: 1.969 });
  const introEnd = useRef({ az: 0.753, pol: 1.750 });
  const introDuration = 2.5; // seconds
  const introElapsed = useRef(0);
  const introStarted = useRef(false);
  const [introComplete, setIntroComplete] = useState(false);

  // Ease-in-out cubic
  const easeInOut = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  useFrame((_, delta) => {
    if (introComplete || !controlsRef.current) return;

    // Make phone visible on first animation frame (prevents flash of unstyled phone)
    if (!introStarted.current && phoneGroupRef.current) {
      phoneGroupRef.current.visible = true;
      introStarted.current = true;
    }

    introElapsed.current += delta;
    const rawT = Math.min(1, introElapsed.current / introDuration);
    const t = easeInOut(rawT);

    const az = introStart.current.az + (introEnd.current.az - introStart.current.az) * t;
    const pol = introStart.current.pol + (introEnd.current.pol - introStart.current.pol) * t;

    controlsRef.current.setAzimuthalAngle(az);
    controlsRef.current.setPolarAngle(pol);
    controlsRef.current.update();
    invalidate();

    if (rawT >= 1) {
      setIntroComplete(true);
    }
  });

  // Auto-rotation: starts after intro completes, continues same direction
  useAutoRotation({
    controlsRef,
    controlsReady,
    isMobile,
    enabled: isVisible && !prefersReducedMotion && introComplete,
    isHoveringPhone,
  });

  // --- Cursor recoil: phone tilts slightly away from cursor position ---
  const phoneGroupRef = useRef<Group>(null);
  const cursorOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const currentRecoil = useRef({ x: 0, y: 0 });

  const BASE_ROTATION: [number, number, number] = [-0.48, 0.18, 0];
  const RECOIL_STRENGTH = 0.035; // Max radians of tilt (~2°)
  const RECOIL_LERP = 0.08;     // Smooth spring-like interpolation

  const handleCursorOffset = useCallback((offset: { x: number; y: number } | null) => {
    cursorOffsetRef.current = offset;
  }, []);

  useFrame(() => {
    if (!phoneGroupRef.current) return;

    // Target recoil: opposite direction of cursor position
    const target = cursorOffsetRef.current
      ? { x: -cursorOffsetRef.current.y * RECOIL_STRENGTH, y: cursorOffsetRef.current.x * RECOIL_STRENGTH }
      : { x: 0, y: 0 };

    // Smooth lerp toward target
    currentRecoil.current.x += (target.x - currentRecoil.current.x) * RECOIL_LERP;
    currentRecoil.current.y += (target.y - currentRecoil.current.y) * RECOIL_LERP;

    // Apply base rotation + recoil offset
    phoneGroupRef.current.rotation.x = BASE_ROTATION[0] + currentRecoil.current.x;
    phoneGroupRef.current.rotation.y = BASE_ROTATION[1] + currentRecoil.current.y;

    // Only invalidate if recoil is meaningful (avoid unnecessary renders)
    if (Math.abs(currentRecoil.current.x) > 0.0005 || Math.abs(currentRecoil.current.y) > 0.0005) {
      invalidate();
    }
  });

  return (
    <>
      <group ref={phoneGroupRef} rotation={BASE_ROTATION} visible={false}>
      <PhoneModel screenRef={screenCallbackRef} />
      <PhoneEnvironment />

      {screenMesh && (
        <PhoneInteraction
          screenMesh={screenMesh}
          controlsRef={controlsRef}
          invalidate={invalidate}
          prefersReducedMotion={prefersReducedMotion}
          isVisible={isVisible}
          onHoverChange={setIsHoveringPhone}
          onCursorOffset={handleCursorOffset}
        />
      )}
      </group>

      <OrbitControls
        ref={controlsCallbackRef}
        enableZoom={false}
        enablePan={false}
        dampingFactor={0.08}
        enableDamping
        target={[0, 0, 0]}
        onChange={() => invalidate()}
        // Mobile: two-finger drag to orbit, one finger passes through to page scroll
        touches={{ ONE: undefined as unknown as number, TWO: TOUCH.ROTATE }}
      />
    </>
  );
}

interface PhoneSceneProps {
  isVisible?: boolean;
}

export default function PhoneScene({ isVisible = true }: PhoneSceneProps) {
  return (
    <>
    <Canvas
      frameloop={isVisible ? 'demand' : 'never'}
      camera={{
        // Start angle: azimuth 1.554, polar 1.969 (r=7.76)
        position: [7.15, -3.01, 0.12],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <PhoneSceneContent isVisible={isVisible} />
      </Suspense>
    </Canvas>
    </>
  );
}
