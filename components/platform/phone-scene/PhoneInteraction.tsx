'use client';

/**
 * PhoneInteraction — Wires the 2D screen renderer to the 3D phone scene.
 *
 * Creates a CanvasTexture from the ScreenRenderer's canvas, applies it to
 * the phone screen mesh, handles raycasting for tab detection, and manages
 * cursor changes on hover.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  CanvasTexture,
  Raycaster,
  Vector2,
  SRGBColorSpace,
  LinearFilter,
  LinearMipmapLinearFilter,
  type Mesh,
  type MeshPhysicalMaterial,
} from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ScreenRenderer } from './ScreenRenderer';
import { CANVAS_HEIGHT, LAYOUT, TABS, type TabId } from './constants';

/**
 * UV y threshold for tab bar detection.
 * With flipY=true (default), canvas bottom maps to UV y=0.
 * Tab bar occupies the bottom LAYOUT.tabBarHeight pixels of the canvas,
 * so it sits at UV y < tabBarHeight/canvasHeight ≈ 0.078.
 */
const TAB_BAR_UV_THRESHOLD = LAYOUT.tabBarHeight / CANVAS_HEIGHT;

/** Max pointer movement (px) between down/up to count as a tap, not a drag */
const TAP_THRESHOLD_PX = 4;

interface PhoneInteractionProps {
  screenMesh: Mesh;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  invalidate: () => void;
  prefersReducedMotion?: boolean;
  isVisible?: boolean;
  onTabChange?: (tab: TabId) => void;
  onHoverChange?: (hovering: boolean) => void;
  onCursorOffset?: (offset: { x: number; y: number } | null) => void;
}

export default function PhoneInteraction({
  screenMesh,
  controlsRef,
  invalidate,
  prefersReducedMotion = false,
  isVisible = true,
  onTabChange,
  onHoverChange,
  onCursorOffset,
}: PhoneInteractionProps) {
  const rendererRef = useRef<ScreenRenderer | null>(null);
  const textureRef = useRef<CanvasTexture | null>(null);
  const { gl, camera } = useThree();
  const raycaster = useRef(new Raycaster());
  const pointer = useRef(new Vector2());
  const needsUpdate = useRef(false);

  // Track pointer-down position for click/drag disambiguation
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  // Initialize ScreenRenderer and CanvasTexture
  useEffect(() => {
    const renderer = new ScreenRenderer();
    rendererRef.current = renderer;

    const texture = new CanvasTexture(renderer.getCanvas());
    texture.colorSpace = SRGBColorSpace;
    // Sharp at oblique angles — max anisotropy prevents blur when phone is tilted
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    // Mipmaps for quality at distance + smooth minification
    texture.generateMipmaps = true;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    textureRef.current = texture;

    // Apply texture to screen mesh material
    // Emissive screen: texture drives self-illumination (like a real OLED display),
    // while the material's clearcoat provides glass reflections on top.
    const material = screenMesh.material as MeshPhysicalMaterial;
    material.emissive.set('#FFFFFF');
    material.emissiveMap = texture;
    material.emissiveIntensity = 0.8;
    material.needsUpdate = true;

    // Register onFrame BEFORE triggering first draw — so the texture
    // dirty flag + invalidate() fire on that first render. Without this
    // ordering the constructor's draw (now removed) or startInitialDraw()
    // would paint to a canvas that Three.js never picks up.
    renderer.onFrame(() => {
      needsUpdate.current = true;
      invalidate();
    });

    // Now trigger the first render with callback already registered.
    if (prefersReducedMotion) {
      renderer.drawStatic();
    } else {
      renderer.startInitialDraw();
    }

    return () => {
      renderer.destroy();
      texture.dispose();
    };
  }, [screenMesh, invalidate, prefersReducedMotion]);

  // Pause/resume ScreenRenderer RAF loop when off-screen to save battery
  useEffect(() => {
    rendererRef.current?.setPaused(!isVisible);
  }, [isVisible]);

  // Propagate texture updates into the Three.js render cycle.
  // invalidate() is called from onFrame above to wake the loop;
  // this hook sets the actual texture flag so Three.js re-uploads.
  useFrame(() => {
    if (needsUpdate.current && textureRef.current) {
      textureRef.current.needsUpdate = true;
      needsUpdate.current = false;
    }
  });

  // --- Pointer down: record start position for drag disambiguation ---
  const handlePointerDown = useCallback((event: PointerEvent) => {
    pointerDownPos.current = { x: event.clientX, y: event.clientY };
  }, []);

  // --- Pointer up: only fire tab logic if movement < TAP_THRESHOLD_PX ---
  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (!rendererRef.current || !pointerDownPos.current) return;

      // Measure drag distance — if too large this was an orbit, not a tap
      const dx = event.clientX - pointerDownPos.current.x;
      const dy = event.clientY - pointerDownPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      pointerDownPos.current = null;

      if (dist >= TAP_THRESHOLD_PX) return;

      // Calculate pointer position in NDC (-1 to +1)
      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast against screen mesh
      raycaster.current.setFromCamera(pointer.current, camera);
      const intersects = raycaster.current.intersectObject(screenMesh);

      if (intersects.length > 0) {
        const uv = intersects[0].uv;
        if (!uv) return;

        // UV y < threshold → bottom of screen → tab bar zone
        if (uv.y < TAB_BAR_UV_THRESHOLD) {
          const tabIndex = Math.floor(uv.x * 4);
          const clampedIndex = Math.max(0, Math.min(3, tabIndex));
          const tab = TABS[clampedIndex];

          if (tab && tab.id !== rendererRef.current.getActiveTab()) {
            if (prefersReducedMotion) {
              rendererRef.current.switchTabInstant(tab.id);
            } else {
              rendererRef.current.switchTab(tab.id);
            }
            onTabChange?.(tab.id);
          }
        }
      }
    },
    [screenMesh, camera, gl.domElement, onTabChange, prefersReducedMotion],
  );

  // --- Hover: raycast against screen to detect actual phone hover ---
  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(pointer.current, camera);
      const intersects = raycaster.current.intersectObject(screenMesh);

      const hitPhone = intersects.length > 0 && intersects[0].uv != null;

      // Notify hover state for auto-rotation slowdown
      if (onHoverChange) {
        onHoverChange(hitPhone);
      }

      if (hitPhone) {
        const uv = intersects[0].uv!;

        // Cursor offset from phone center: -1 to +1
        // Used for physical recoil effect
        onCursorOffset?.({ x: (uv.x - 0.5) * 2, y: (uv.y - 0.5) * 2 });

        if (uv.y < TAB_BAR_UV_THRESHOLD) {
          gl.domElement.style.cursor = 'pointer';
          const tabIndex = Math.max(0, Math.min(3, Math.floor(uv.x * 4)));
          rendererRef.current?.setHoveredTab(tabIndex);
        } else {
          gl.domElement.style.cursor = 'grab';
          rendererRef.current?.setHoveredTab(-1);
        }
      } else {
        gl.domElement.style.cursor = 'default';
        rendererRef.current?.setHoveredTab(-1);
        onCursorOffset?.(null);
      }
    },
    [screenMesh, camera, gl.domElement],
  );

  // --- Leave: reset cursor, hover state, and cursor offset ---
  const handlePointerLeave = useCallback(() => {
    gl.domElement.style.cursor = 'default';
    onHoverChange?.(false);
    onCursorOffset?.(null);
  }, [gl.domElement, onHoverChange, onCursorOffset]);

  // Attach / detach event listeners on the canvas element
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [gl.domElement, handlePointerDown, handlePointerUp, handlePointerMove, handlePointerLeave]);

  // Behaviour-only component — no visual output
  return null;
}
