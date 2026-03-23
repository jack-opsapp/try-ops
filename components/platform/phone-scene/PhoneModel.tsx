'use client';

/**
 * PhoneModel — iPhone 16 Pro (Black Titanium), accurate construction.
 *
 * Real dimensions: 71.5mm × 149.6mm × 8.25mm
 * Base unit: PHONE_WIDTH = 2.0 = 71.5mm → Scale: 1mm = 0.02797 units
 *
 * Visual adjustments for 3D rendering:
 * - Depth reduced to 6.8mm (from 8.25mm) — thinner reads better in 3D
 * - Camera bump 2.2mm (from 3.9mm real)
 * - Corner radius 8.5mm with cubic bezier circular arcs
 * - Frame band beveled for edge detail (chamfered front/back edges)
 * - Camera lens rings are 3D barrels (cylinder + ring face), not flat
 */

import { useMemo } from 'react';
import {
  Shape,
  ShapeGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  CylinderGeometry,
  RingGeometry,
  CircleGeometry,
  Path,
  DoubleSide,
  type Mesh,
} from 'three';
import { RoundedBox, Text3D, Center } from '@react-three/drei';

// ============================================================
// DIMENSIONS
// ============================================================
const S = 2.0 / 71.5; // Scale: units per mm

const PHONE_WIDTH = 71.5 * S;   // 2.0
const PHONE_HEIGHT = 149.6 * S; // 4.184
const PHONE_DEPTH = 6.8 * S;    // Aggressively reduced for slim 3D profile

const CORNER_RADIUS = 8.5 * S;  // Real ~8.5mm
const BEZEL = 1.2 * S;
const FRAME_BAND = 2.5 * S;

// Frame bevel — creates chamfered edges where frame meets glass
const BEVEL_SIZE = 0.35 * S;       // Slightly larger chamfer
const BEVEL_THICKNESS = 0.3 * S;   // Slightly deeper chamfer
const FRAME_EXTRUDE_DEPTH = PHONE_DEPTH - 2 * BEVEL_THICKNESS; // Body depth (bevel adds the rest)

// Screen (inset by bezel)
const SCREEN_WIDTH = PHONE_WIDTH - BEZEL * 2;
const SCREEN_HEIGHT = PHONE_HEIGHT - BEZEL * 2;
const SCREEN_CR = CORNER_RADIUS - BEZEL;

// Camera — proportions matched to real iPhone 16 Pro
// Real module: ~36×36mm, lens outer ring ~10mm dia, lens spacing ~12.5mm
const CAM_BUMP_DEPTH = 2.2 * S;
const CAM_BUMP_SIZE = 30.0 * S;   // Larger housing (was 26) to fit spaced lenses
const CAM_BUMP_CR = 6.5 * S;      // Proportional corner radius
const CAM_LENS_R = 4.5 * S;       // Smaller lens glass (was 5.2) — correct proportion
const CAM_RING_IN = 4.2 * S;      // Ring inner (was 4.8)
const CAM_RING_OUT = 5.2 * S;     // Ring outer (was 6.2) — no overlap at 11.5 spacing
const CAM_SPACING = 11.5 * S;     // Wider spacing (was 10.5) — prevents ring overlap
const RING_PROTRUDE = 1.5 * S;    // 3D barrel protrusion

// Camera position — upper-left when viewing the back
// Adjusted inward to fit 30mm module: center at 19.75mm from center, edge at 34.75mm (1mm inside frame)
const CAM_X = (71.5 / 2 - 16.0) * S;
const CAM_Y = (149.6 / 2 - 17.0) * S;

// Buttons
const BTN_PROTRUDE = 0.6 * S;
const BTN_DEPTH_Z = 2.8 * S;

export { SCREEN_WIDTH, SCREEN_HEIGHT };

// --- Colors: Black Titanium ---
const TITANIUM = '#1C1C1E';
const BACK_GLASS = '#121214';
const FRONT_GLASS = '#0A0A0A';
const CAM_HOUSING = '#0D0D0F';
const LENS_DARK = '#050508';
const RING_POLISH = '#2E2E30';
const LENS_COATING = '#15102A';

// --- Cubic bezier rounded rect ---
function rr(w: number, h: number, r: number): Shape {
  const hw = w / 2, hh = h / 2, cr = Math.min(r, hw, hh);
  // Apple squircle approximation — higher k = tighter corner that hugs the vertex
  // Standard circle: k = 0.5523 | Squircle (G2-ish): k = 0.6 gives smoother curvature onset
  const k = 0.6;
  const kc = cr * k;
  const shape = new Shape();
  shape.moveTo(-hw + cr, -hh);
  shape.lineTo(hw - cr, -hh);
  shape.bezierCurveTo(hw - cr + kc, -hh, hw, -hh + cr - kc, hw, -hh + cr);
  shape.lineTo(hw, hh - cr);
  shape.bezierCurveTo(hw, hh - cr + kc, hw - cr + kc, hh, hw - cr, hh);
  shape.lineTo(-hw + cr, hh);
  shape.bezierCurveTo(-hw + cr - kc, hh, -hw, hh - cr + kc, -hw, hh - cr);
  shape.lineTo(-hw, -hh + cr);
  shape.bezierCurveTo(-hw, -hh + cr - kc, -hw + cr - kc, -hh, -hw + cr, -hh);
  return shape;
}

// --- Apple logo from real SVG path data ---
// Parses the official Apple Inc. logo SVG path into Three.js Shapes.
// The SVG has two subpaths: body (with bite) and leaf.
const APPLE_SVG_D = "M979.042 925.187c-17.954 41.478-39.206 79.657-63.828 114.76-33.563 47.852-61.044 80.975-82.222 99.37-32.83 30.191-68.006 45.654-105.672 46.533-27.041 0-59.652-7.695-97.611-23.304-38.085-15.535-73.084-23.23-105.086-23.23-33.563 0-69.56 7.695-108.061 23.23-38.561 15.61-69.625 23.744-93.376 24.55-36.12 1.539-72.123-14.364-108.06-47.78-22.938-20.006-51.627-54.302-85.997-102.887-36.875-51.884-67.191-112.048-90.942-180.64C12.751 781.703 0 709.96 0 640.504c0-79.562 17.192-148.183 51.627-205.687 27.063-46.189 63.066-82.625 108.127-109.372 45.06-26.748 93.749-40.379 146.182-41.25 28.69 0 66.312 8.874 113.066 26.315 46.622 17.5 76.557 26.374 89.682 26.374 9.812 0 43.068-10.377 99.443-31.064 53.313-19.185 98.307-27.13 135.168-24 99.883 8.061 174.923 47.435 224.828 118.372-89.33 54.126-133.52 129.935-132.64 227.187.806 75.751 28.287 138.788 82.295 188.84 24.476 23.23 51.81 41.184 82.222 53.935-6.595 19.126-13.557 37.447-20.958 55.034zM749.964 23.751c0 59.373-21.692 114.81-64.928 166.122-52.176 61-115.286 96.248-183.724 90.686-0.89-7.5-1.378-15.0-1.378-22.498 0-56.998 24.813-117.998 68.878-167.873 21.999-25.253 49.978-46.25 83.907-63 33.856-16.5 65.88-25.625 95.999-27.188.88 7.937 1.246 15.875 1.246 23.75z";

function parseAppleLogoShapes(targetHeight: number): Shape[] {
  // SVG approximate bounds: x=[0, 1000], y=[0, 1190]
  const svgH = 1190, svgCX = 500, svgCY = 595;
  const sc = targetHeight / svgH;
  // Transform: center, scale, flip Y (SVG Y-down → Three.js Y-up)
  const tx = (x: number) => (x - svgCX) * sc;
  const ty = (y: number) => -(y - svgCY) * sc;

  const tks = APPLE_SVG_D.match(/[MCcAaZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [];
  const shapes: Shape[] = [];
  let s: Shape | null = null;
  let cx = 0, cy = 0, i = 0;
  const n = () => parseFloat(tks[i++]);
  const isN = () => i < tks.length && /^[-+.\d]/.test(tks[i]);

  while (i < tks.length) {
    const cmd = tks[i++];
    switch (cmd) {
      case 'M':
        s = new Shape(); shapes.push(s);
        cx = n(); cy = n();
        s.moveTo(tx(cx), ty(cy));
        while (isN()) { cx = n(); cy = n(); s.lineTo(tx(cx), ty(cy)); }
        break;
      case 'c':
        while (isN()) {
          const d1x = n(), d1y = n(), d2x = n(), d2y = n(), dx = n(), dy = n();
          s?.bezierCurveTo(tx(cx+d1x), ty(cy+d1y), tx(cx+d2x), ty(cy+d2y), tx(cx+dx), ty(cy+dy));
          cx += dx; cy += dy;
        }
        break;
      case 'C':
        while (isN()) {
          const x1 = n(), y1 = n(), x2 = n(), y2 = n(), x = n(), y = n();
          s?.bezierCurveTo(tx(x1), ty(y1), tx(x2), ty(y2), tx(x), ty(y));
          cx = x; cy = y;
        }
        break;
      case 'z': case 'Z': break;
    }
  }
  return shapes;
}

interface PhoneModelProps {
  screenRef?: React.Ref<Mesh>;
}

export default function PhoneModel({ screenRef }: PhoneModelProps) {
  // --- Geometries ---
  const screenGeo = useMemo(() => {
    const shape = rr(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_CR);
    const geo = new ShapeGeometry(shape);
    const hw = SCREEN_WIDTH / 2, hh = SCREEN_HEIGHT / 2;
    const uvAttr = geo.attributes.uv;
    const a = new Float32Array(uvAttr.count * 2);
    for (let i = 0; i < uvAttr.count; i++) {
      a[i * 2] = (uvAttr.getX(i) + hw) / (hw * 2);
      a[i * 2 + 1] = (uvAttr.getY(i) + hh) / (hh * 2);
    }
    geo.setAttribute('uv', new Float32BufferAttribute(a, 2));
    return geo;
  }, []);

  // Frame band with beveled edges — creates visible chamfer that catches light
  const frameBandGeo = useMemo(() => {
    const outer = rr(PHONE_WIDTH, PHONE_HEIGHT, CORNER_RADIUS);
    const inner = rr(
      PHONE_WIDTH - FRAME_BAND * 2,
      PHONE_HEIGHT - FRAME_BAND * 2,
      Math.max(CORNER_RADIUS - FRAME_BAND, 0),
    );
    outer.holes.push(inner);
    return new ExtrudeGeometry(outer, {
      depth: FRAME_EXTRUDE_DEPTH,
      bevelEnabled: true,
      bevelSize: BEVEL_SIZE,
      bevelThickness: BEVEL_THICKNESS,
      bevelSegments: 3,
    });
  }, []);

  const glassW = PHONE_WIDTH - FRAME_BAND * 2;
  const glassH = PHONE_HEIGHT - FRAME_BAND * 2;
  const glassCR = Math.max(CORNER_RADIUS - FRAME_BAND, 0);
  const frontGlassGeo = useMemo(() => new ShapeGeometry(rr(glassW, glassH, glassCR)), []);
  const backGlassGeo = useMemo(() => new ShapeGeometry(rr(glassW, glassH, glassCR)), []);

  // Camera geometries
  const ringFaceGeo = useMemo(() => new RingGeometry(CAM_RING_IN, CAM_RING_OUT, 48), []);
  const ringBarrelGeo = useMemo(
    () => new CylinderGeometry(CAM_RING_OUT, CAM_RING_OUT, RING_PROTRUDE, 48, 1, true), [],
  );
  const lensGeo = useMemo(() => new CircleGeometry(CAM_LENS_R, 48), []);
  const coatingRingGeo = useMemo(() => new RingGeometry(CAM_LENS_R * 0.5, CAM_LENS_R * 0.8, 32), []);
  const innerElementGeo = useMemo(() => new RingGeometry(CAM_LENS_R * 0.25, CAM_LENS_R * 0.4, 24), []);
  const bumpGeo = useMemo(() => {
    const shape = rr(CAM_BUMP_SIZE, CAM_BUMP_SIZE, CAM_BUMP_CR);
    return new ExtrudeGeometry(shape, {
      depth: CAM_BUMP_DEPTH,
      bevelEnabled: true,
      bevelSize: 1.0 * S,
      bevelThickness: 0.8 * S,
      bevelSegments: 5,
    });
  }, []);

  // Apple logo — parsed from real SVG path data (body + leaf as two subpaths)
  const [logoGeo, leafGeo] = useMemo(() => {
    const shapes = parseAppleLogoShapes(11.0 * S);
    return [
      new ShapeGeometry(shapes[0]),
      shapes[1] ? new ShapeGeometry(shapes[1]) : new ShapeGeometry(shapes[0]),
    ];
  }, []);

  // Bottom details
  const speakerDotGeo = useMemo(() => new CylinderGeometry(0.5 * S, 0.5 * S, 0.3 * S, 8), []);
  const portGeo = useMemo(() => new ShapeGeometry(rr(6.5 * S, 2.0 * S, 1.0 * S)), []);

  // Earpiece
  const earpieceGeo = useMemo(() => new ShapeGeometry(rr(9.0 * S, 1.0 * S, 0.5 * S)), []);

  // --- Materials ---
  // Black Titanium: fully metallic with directional brushing (anisotropy).
  // PVD coating = faint clearcoat. Metals need high envMapIntensity to have color.
  const tiProps = {
    color: '#2A2A2C',
    metalness: 1,
    roughness: 0.28,              // tightened from 0.35 — sharper highlights that respond visibly to the same lights the screen catches
    anisotropy: 0.7,
    anisotropyRotation: Math.PI / 2,
    clearcoat: 0.25,              // boosted from 0.1 — the PVD coating creates a visible gloss layer
    clearcoatRoughness: 0.3,      // tightened from 0.4 — crisper clearcoat highlights
    envMapIntensity: 1.5,         // boosted from 1.2 — brighter reflections so light changes are visible
  } as const;

  // Apple logo: polished metal inlay under glass clearcoat
  const logoMat = {
    color: '#222224', metalness: 0.85, roughness: 0.08,
    clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 1.2,
  } as const;

  // Camera lens rings: mirror-polished metal. Full metalness, near-zero roughness.
  // Clearcoat unnecessary on polished metal — reflections come from metalness + envMap.
  const ringMat = {
    color: '#4A4A4C',
    metalness: 1,
    roughness: 0.05,
    envMapIntensity: 2.2,
  } as const;

  // Frame position offset — accounts for bevel extending beyond body
  // Total span: from -PHONE_DEPTH/2 to +PHONE_DEPTH/2
  const frameZ = -PHONE_DEPTH / 2 + BEVEL_THICKNESS;

  return (
    <group>
      {/* ====== TITANIUM FRAME BAND (beveled edges) ====== */}
      <mesh geometry={frameBandGeo} position={[0, 0, frameZ]}>
        <meshPhysicalMaterial {...tiProps} />
      </mesh>

      {/* Antenna band lines — dark hairline slots on the frame surface.
          Two planes per line (left-facing and right-facing) sitting flush on the frame edge. */}
      {[
        { x: -PHONE_WIDTH / 2 - 0.003, y: PHONE_HEIGHT / 2 - 22 * S },
        { x: PHONE_WIDTH / 2 + 0.003, y: PHONE_HEIGHT / 2 - 22 * S },
        { x: -PHONE_WIDTH / 2 - 0.003, y: -PHONE_HEIGHT / 2 + 18 * S },
        { x: PHONE_WIDTH / 2 + 0.003, y: -PHONE_HEIGHT / 2 + 18 * S },
      ].map(({ x, y }, i) => (
        <mesh key={`ant${i}`} position={[x, y, 0]}
          rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[PHONE_DEPTH * 0.55, 0.3 * S]} />
          <meshBasicMaterial color="#0A0A0C" side={DoubleSide} depthWrite={false} />
        </mesh>
      ))}

      {/* ====== FRONT GLASS PANEL ====== */}
      <mesh geometry={frontGlassGeo} position={[0, 0, PHONE_DEPTH / 2 - 0.002]}>
        <meshPhysicalMaterial
          color={FRONT_GLASS} metalness={0} roughness={0.05}
          clearcoat={1} clearcoatRoughness={0.03}
          ior={1.52} reflectivity={0.5} envMapIntensity={0.8}
        />
      </mesh>

      {/* ====== BACK GLASS PANEL ====== */}
      <mesh geometry={backGlassGeo} position={[0, 0, -PHONE_DEPTH / 2 + 0.002]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial
          color="#141416"
          metalness={0}
          roughness={0.4}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          ior={1.52}
          envMapIntensity={0.7}
        />
      </mesh>

      {/* ====== APPLE LOGO + LEAF ====== */}
      <mesh geometry={logoGeo} position={[0, -5 * S, -PHONE_DEPTH / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial {...logoMat} />
      </mesh>
      <mesh geometry={leafGeo} position={[0, -5 * S, -PHONE_DEPTH / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial {...logoMat} />
      </mesh>

      {/* ====== SCREEN — Self-lit OLED display with Gorilla Glass clearcoat ======
           Emissive: screen content via CanvasTexture (applied by PhoneInteraction)
           Clearcoat: full glass layer (IOR 1.52 = Gorilla Glass) for environment reflections
           The emissiveMap carries the UI content; clearcoat adds glass reflections on top */}
      <mesh ref={screenRef} position={[0, 0, PHONE_DEPTH / 2 + 0.001]}>
        <primitive object={screenGeo} attach="geometry" />
        <meshPhysicalMaterial
          color="#000000"
          metalness={0}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.12}
          ior={1.52}
          reflectivity={0.4}
          envMapIntensity={0.6}
          toneMapped={false}
        />
      </mesh>

      {/* ====== DYNAMIC ISLAND — Pill-shaped cutout flush with the screen ======
          Flat ShapeGeometry sitting just above the screen surface (z + 0.002).
          Pure black meshBasicMaterial — appears as a void in the display. */}
      <mesh position={[0, SCREEN_HEIGHT / 2 - 6 * S, PHONE_DEPTH / 2 + 0.002]}>
        <shapeGeometry args={[rr(15 * S, 4 * S, 2 * S)]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* ====== EARPIECE ====== */}
      <mesh geometry={earpieceGeo}
        position={[0, PHONE_HEIGHT / 2 - 1.5 * S, PHONE_DEPTH / 2 + 0.002]}>
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* ====== FRONT SENSORS ====== */}
      {[-1, 1].map((side) => (
        <mesh key={`sens${side}`}
          position={[side * 9 * S, SCREEN_HEIGHT / 2 - 6 * S, PHONE_DEPTH / 2 + 0.004]}>
          <circleGeometry args={[0.4 * S, 8]} />
          <meshBasicMaterial color="#060608" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* ====== CAMERA ARRAY ====== */}
      <group position={[CAM_X, CAM_Y, -PHONE_DEPTH / 2]}>
        {/* Camera bump housing */}
        <mesh geometry={bumpGeo} rotation={[Math.PI, 0, 0]}>
          <meshPhysicalMaterial
            color="#0E0E10"
            metalness={0}
            roughness={0.35}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
            ior={1.52}
            envMapIntensity={0.7}
          />
        </mesh>

        {/* 3D lens assemblies — from back view: two on LEFT column, one on RIGHT center
            In world coords (front view), +X = left from back, so lenses on +X side */}
        {renderLens(CAM_SPACING / 2, CAM_SPACING / 2, ringBarrelGeo, ringFaceGeo, lensGeo, coatingRingGeo, innerElementGeo, ringMat)}
        {renderLens(CAM_SPACING / 2, -CAM_SPACING / 2, ringBarrelGeo, ringFaceGeo, lensGeo, coatingRingGeo, innerElementGeo, ringMat)}
        {renderLens(-CAM_SPACING / 2, 0, ringBarrelGeo, ringFaceGeo, lensGeo, coatingRingGeo, innerElementGeo, ringMat)}

        {/* LiDAR — lower-right from back view = -X, -Y in world */}
        <mesh position={[-CAM_SPACING / 2, -CAM_SPACING / 2, -CAM_BUMP_DEPTH - 0.002]}
          rotation={[Math.PI, 0, 0]}>
          <circleGeometry args={[1.5 * S, 16]} />
          <meshPhysicalMaterial
            color="#0a0a14" metalness={0} roughness={0.2}
            clearcoat={0.6} clearcoatRoughness={0.15}
            ior={1.52} envMapIntensity={0.6}
          />
        </mesh>

        {/* Flash — upper-right from back view = -X, +Y in world */}
        <mesh position={[-CAM_SPACING / 2, CAM_SPACING / 2, -CAM_BUMP_DEPTH - 0.001]}
          rotation={[Math.PI, 0, 0]}>
          <circleGeometry args={[1.3 * S, 16]} />
          <meshPhysicalMaterial
            color="#F0EBD8" metalness={0.0} roughness={0.3}
            transparent opacity={0.85}
          />
        </mesh>

        {/* Microphone pinhole */}
        <mesh position={[0, CAM_BUMP_SIZE / 2 - 1.5 * S, -CAM_BUMP_DEPTH - 0.001]}
          rotation={[Math.PI, 0, 0]}>
          <circleGeometry args={[0.3 * S, 8]} />
          <meshBasicMaterial color="#050505" />
        </mesh>
      </group>

      {/* ====== SIDE BUTTONS ====== */}
      <group position={[-PHONE_WIDTH / 2 - BTN_PROTRUDE / 2, 0, 0]}>
        <RoundedBox args={[BTN_PROTRUDE, 5.5 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 34 * S, 0]}>
          <meshPhysicalMaterial {...tiProps} />
        </RoundedBox>
        <RoundedBox args={[BTN_PROTRUDE, 10 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 46 * S, 0]}>
          <meshPhysicalMaterial {...tiProps} />
        </RoundedBox>
        <RoundedBox args={[BTN_PROTRUDE, 10 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 60 * S, 0]}>
          <meshPhysicalMaterial {...tiProps} />
        </RoundedBox>
      </group>

      <group position={[PHONE_WIDTH / 2 + BTN_PROTRUDE / 2, 0, 0]}>
        <RoundedBox args={[BTN_PROTRUDE, 13 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 42 * S, 0]}>
          <meshPhysicalMaterial {...tiProps} />
        </RoundedBox>
        <RoundedBox args={[BTN_PROTRUDE, 7 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 85 * S, 0]}>
          {/* Camera Control button — sapphire crystal cover (IOR 1.77) */}
          <meshPhysicalMaterial
            color="#18181A" metalness={0} roughness={0.08}
            clearcoat={1} clearcoatRoughness={0.05}
            ior={1.77} reflectivity={0.6} envMapIntensity={0.9}
          />
        </RoundedBox>
      </group>

      {/* ====== BOTTOM EDGE ====== */}
      <group position={[0, -PHONE_HEIGHT / 2, 0]}>
        {/* ====== EASTER EGG — Engraved text cut into the bottom edge ======
            Text3D creates real extruded geometry with depth (0.4mm).
            Positioned so it protrudes outward from the frame surface —
            the extruded faces catch light like real machined grooves.
            Dark color simulates the shadow inside the engraving. */}
        <Center precise position={[0, -0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <Text3D
            font="https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/helvetiker_regular.typeface.json"
            size={1.4 * S}
            height={0.4 * S}
            letterSpacing={0.01}
            bevelEnabled
            bevelSize={0.05 * S}
            bevelThickness={0.02 * S}
            bevelSegments={2}
          >
            FOR THOSE WHO [DIGDEEPER], 10% OFF
            <meshPhysicalMaterial
              color="#1A1A1C"
              metalness={1}
              roughness={0.55}
              envMapIntensity={0.8}
              side={DoubleSide}
            />
          </Text3D>
        </Center>
      </group>

      {/* ====== TOP EDGE ====== */}
      <mesh position={[0, PHONE_HEIGHT / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4 * S, 0.4 * S, 0.2 * S, 8]} />
        <meshBasicMaterial color="#060606" />
      </mesh>
    </group>
  );
}

/**
 * 3D camera lens assembly:
 * 1. Polished barrel wall (CylinderGeometry, open-ended) — protrudes from housing
 * 2. Polished ring face (RingGeometry) — catches light at the top
 * 3. Dark lens glass (CircleGeometry) — recessed at barrel base
 * 4. Blue-purple coating ring — on glass surface
 * 5. Inner lens element ring — deeper recess for multi-element look
 */
function renderLens(
  x: number, y: number,
  barrelGeo: CylinderGeometry,
  ringFaceGeo: RingGeometry,
  lensGeo: CircleGeometry,
  coatingGeo: RingGeometry,
  innerGeo: RingGeometry,
  ringMat: Record<string, unknown>,
) {
  // Z positions relative to camera group origin (z=0 = back glass surface)
  const housingFace = -CAM_BUMP_DEPTH - 0.005; // Outer face of camera housing
  const ringFace = housingFace - RING_PROTRUDE;  // Protruding ring face (closest to viewer)
  const barrelCenter = (housingFace + ringFace) / 2;
  const lensGlass = housingFace + 0.005;         // Lens glass slightly inside housing
  const coatingZ = lensGlass - 0.003;            // Coating on glass surface
  const innerElementZ = lensGlass - 0.008;       // Inner lens element, deeper

  return (
    <group key={`lens${x}${y}`} position={[x, y, 0]}>
      {/* Polished barrel wall — outer cylinder, open-ended */}
      <mesh geometry={barrelGeo} position={[0, 0, barrelCenter]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial {...ringMat} />
      </mesh>

      {/* Polished ring face — flat annular cap at protruding end */}
      <mesh geometry={ringFaceGeo} position={[0, 0, ringFace]} rotation={[Math.PI, 0, 0]}>
        <meshPhysicalMaterial {...ringMat} />
      </mesh>

      {/* Camera lens glass — dielectric (not metal!), high-IOR optical glass (1.8).
          Iridescence simulates multi-layer anti-reflective coating (blue/purple shimmer). */}
      <mesh geometry={lensGeo} position={[0, 0, lensGlass]} rotation={[Math.PI, 0, 0]}>
        <meshPhysicalMaterial
          color="#0a0a18"
          metalness={0}
          roughness={0}
          ior={1.8}
          clearcoat={1}
          clearcoatRoughness={0}
          iridescence={0.3}
          iridescenceIOR={2.2}
          iridescenceThicknessRange={[100, 400]}
          reflectivity={0.8}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Lens coating — thin-film interference (iridescence) for anti-reflective shimmer */}
      <mesh geometry={coatingGeo} position={[0, 0, coatingZ]} rotation={[Math.PI, 0, 0]}>
        <meshPhysicalMaterial
          color="#15102A"
          metalness={0}
          roughness={0.05}
          iridescence={0.6}
          iridescenceIOR={2.2}
          iridescenceThicknessRange={[150, 500]}
          transparent opacity={0.45}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* Inner lens element — concentric ring for multi-element depth */}
      <mesh geometry={innerGeo} position={[0, 0, innerElementZ]} rotation={[Math.PI, 0, 0]}>
        <meshPhysicalMaterial
          color="#0A0A10" metalness={0} roughness={0.3}
          ior={1.5} side={DoubleSide}
        />
      </mesh>
    </group>
  );
}
