'use client';

/**
 * useAutoRotation — Continuous Y-axis orbit with hover-based speed interpolation.
 *
 * Speeds (radians per second):
 *   Desktop default: 0.21 rad/s (~12 deg/s)
 *   Desktop hover:   0.035 rad/s (~2 deg/s)
 *   Mobile default:  0.14 rad/s (~8 deg/s)
 *
 * The current speed lerps toward the target speed each frame for smooth transitions.
 */

import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const SPEED_DEFAULT = -0.21;     // ~12 deg/s — negative = continues intro direction (decreasing azimuth)
const SPEED_HOVER = -0.035;      // ~2 deg/s — slow on hover, same direction
const SPEED_MOBILE = -0.14;      // ~8 deg/s — mobile, same direction
const SPEED_ZERO = 0;
const LERP_FACTOR = 0.04;        // Smooth interpolation per frame (~1s to full speed)
const RESUME_DELAY_MS = 3000;    // Delay before resuming after drag release
const MOBILE_PAUSE_MS = 1500;    // Pause duration on mobile tap

interface UseAutoRotationParams {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  controlsReady: boolean; // State signal — flips true when OrbitControls mounts
  isMobile: boolean;
  enabled: boolean;
  isHoveringPhone?: boolean; // Raycast-based hover from PhoneInteraction
}

export function useAutoRotation({ controlsRef, controlsReady, isMobile, enabled, isHoveringPhone = false }: UseAutoRotationParams) {
  const currentSpeed = useRef(0);
  const targetSpeed = useRef(isMobile ? SPEED_MOBILE : SPEED_DEFAULT);
  const isDragging = useRef(false);
  const isHovering = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { invalidate } = useThree();

  // Determine target speed based on current state
  const updateTargetSpeed = useCallback(() => {
    if (!enabled || isDragging.current) {
      targetSpeed.current = SPEED_ZERO;
    } else if (isMobile) {
      targetSpeed.current = SPEED_MOBILE;
    } else if (isHovering.current) {
      targetSpeed.current = SPEED_HOVER;
    } else {
      targetSpeed.current = SPEED_DEFAULT;
    }
  }, [enabled, isMobile]);

  // Auto-rotation frame loop
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || !enabled) return;

    // Lerp current speed toward target
    currentSpeed.current += (targetSpeed.current - currentSpeed.current) * LERP_FACTOR;

    // Apply rotation if speed is meaningful (avoid jitter near zero)
    if (Math.abs(currentSpeed.current) > 0.001) {
      const angle = controls.getAzimuthalAngle() + currentSpeed.current * delta;
      controls.setAzimuthalAngle(angle);
      controls.update();
      invalidate(); // Request re-render in demand mode
    }
  });

  // Hover detection — driven by raycast-based signal from PhoneInteraction
  useEffect(() => {
    if (isMobile) return;
    isHovering.current = isHoveringPhone;
    updateTargetSpeed();
  }, [isHoveringPhone, isMobile, updateTargetSpeed]);

  // Drag state tracking via OrbitControls events.
  // controlsReady is a state signal that re-triggers this effect when
  // OrbitControls mounts — without it, controlsRef.current is null on
  // first run and the event listeners never attach.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onStart = () => {
      isDragging.current = true;
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      updateTargetSpeed();
    };

    const onEnd = () => {
      isDragging.current = false;
      // Delay before resuming auto-rotation
      resumeTimer.current = setTimeout(() => {
        updateTargetSpeed();
      }, isMobile ? MOBILE_PAUSE_MS : RESUME_DELAY_MS);
    };

    controls.addEventListener('start', onStart);
    controls.addEventListener('end', onEnd);
    return () => {
      controls.removeEventListener('start', onStart);
      controls.removeEventListener('end', onEnd);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [controlsRef, controlsReady, isMobile, updateTargetSpeed]);

  return { isDragging };
}
