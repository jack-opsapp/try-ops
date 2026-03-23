'use client';

/**
 * PhoneEnvironment — Product photography lighting rig.
 *
 * Two lighting systems work together:
 *   1. Lightformers (env map) — control what shows up in reflections on
 *      glass/metal. Zero runtime cost. These are the primary "look" drivers.
 *   2. Direct lights — provide surface illumination, reveal anisotropy
 *      on titanium, and create soft diffuse shading across the body.
 *
 * Philosophy: warm/cool split. Key light is warm (late afternoon sun feel),
 * fill and environment lean cool (steel blue). This color temperature contrast
 * creates visual depth and makes the Black Titanium feel premium.
 */

import { ContactShadows, Environment, Lightformer } from '@react-three/drei';

export default function PhoneEnvironment() {
  return (
    <>
      {/* ================================================================
          ENVIRONMENT MAP — Lightformers for reflections
          Warm key from upper-left, cool fill from lower-right.
          Asymmetric placement creates diagonal gradient sweep on glass.
          ================================================================ */}
      <Environment resolution={512} background={false}>
        {/* Full-sphere ambient wrap — TWO hemispheres so the env map has
            light in ALL directions. Metals only show env reflections, so any
            dark region in the env map = dark region on the surface.
            Upper hemisphere: warm. Lower hemisphere: slightly cooler. */}
        <Lightformer form="circle" intensity={0.25} color="#d8d4cc"
          scale={60} position={[0, 20, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="circle" intensity={0.2} color="#c8c4be"
          scale={60} position={[0, -20, 0]} rotation={[-Math.PI / 2, 0, 0]} />

        {/* Key reflection — warm, positioned upper-left.
            Off-center so glass shows an asymmetric gradient sweep. Boosted
            now that it's the main light driver instead of directionals. */}
        <Lightformer form="circle" intensity={0.5} color="#f0e8d8"
          scale={35} position={[8, 14, 6]} rotation={[-Math.PI / 3, 0.2, 0]} />

        {/* Counter key — cool, opposite corner. Slightly boosted for wrap. */}
        <Lightformer form="circle" intensity={0.12} color="#b0c4d8"
          scale={30} position={[-10, 4, 8]} rotation={[-Math.PI / 5, -0.2, 0]} />

        {/* Rim strip — from behind and slightly right.
            Catches titanium frame edges and camera ring bevels. */}
        <Lightformer form="rect" intensity={0.35} color="#e8e0d4"
          scale={[4, 22]} position={[2, 3, -12]} />

        {/* Brand accent — OPS blue wash from the right. */}
        <Lightformer form="circle" intensity={0.15} color="#597794"
          scale={20} position={[14, 0, -2]} rotation={[0, -Math.PI / 2, 0]} />

        {/* Front fill — large panel directly in front of the phone (positive Z),
            at the phone's level. This is where the viewer is, so it lights
            every surface facing the camera, including the bottom edge. */}
        <Lightformer form="rect" intensity={0.3} color="#e0dcd4"
          scale={[40, 20]} position={[0, 0, 14]} />

        {/* Front fill (lower) — slightly below center, in front.
            Targets the bottom half of the phone. */}
        <Lightformer form="circle" intensity={0.2} color="#d8d0c8"
          scale={25} position={[0, 4, 12]} rotation={[-Math.PI / 8, 0, 0]} />

        {/* Rear wash — luminance behind scene so reflections
            aren't a pure black void. */}
        <Lightformer form="rect" intensity={0.08} color="#1e1e22"
          scale={[100, 50]} position={[0, 0, 18]} />
      </Environment>

      {/* ================================================================
          DIRECT LIGHTS — Minimal. Diffuse-first approach.
          The Lightformers above do 90% of the work through env reflections.
          One soft ambient + one gentle directional just for subtle shading
          gradient so surfaces aren't completely flat.
          ================================================================ */}

      {/* Ambient — primary surface illumination. Higher than before because
          we're not relying on directional lights anymore. */}
      <ambientLight intensity={0.3} color="#f0ece6" />

      {/* Soft directional from above — creates subtle shading gradient
          across the phone body so it reads as 3D. */}
      <directionalLight
        position={[-3, 5, 4]}
        intensity={0.15}
        color="#f8f0e4"
      />

      {/* Soft directional from front-below — comes from the viewer's
          direction but angled up to catch the bottom of the phone. */}
      <directionalLight
        position={[0, 2, 6]}
        intensity={0.12}
        color="#e8e0d4"
      />

      {/* Ground shadow — subtle, diffused */}
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.25}
        scale={10}
        blur={3}
        far={5}
        color="#000000"
      />
    </>
  );
}
