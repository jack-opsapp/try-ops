'use client';

/**
 * PhoneEnvironment — Product photography lighting rig.
 *
 * Uses a real HDRI preset ("studio") for smooth, natural reflections —
 * no visible Lightformer shapes, no discrete colored rectangles.
 * The preset intensity is dialed low to avoid overpowering the scene.
 *
 * Easter egg: Top Gun Maverick image composited into the environment map,
 * only visible as a faint ghost in reflections at the right orbit angle.
 */

import { ContactShadows, Environment } from '@react-three/drei';

export default function PhoneEnvironment() {

  return (
    <>
      {/* Real HDRI preset — smooth, photographically natural reflections.
          environmentIntensity controls how bright the env appears in
          material reflections. Low value prevents overpowering. */}
      {/* The Top Gun Maverick image IS the environment map.
          The sunset sky, runway, motorcycle — all become the reflection
          source. environmentIntensity controls how visible it is. */}
      <Environment
        files="/images/env-easter-egg.jpg"
        environmentIntensity={0.6}
        environmentRotation={[0, 3 * Math.PI / 2, 0]}
        background={false}
      />

      {/* Direct lights — subtle surface shading */}
      <ambientLight intensity={0.3} color="#f0ece6" />

      <directionalLight
        position={[-3, 5, 4]}
        intensity={0.15}
        color="#f8f0e4"
      />

      <directionalLight
        position={[0, 2, 6]}
        intensity={0.12}
        color="#e8e0d4"
      />

      {/* Ground shadow */}
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
