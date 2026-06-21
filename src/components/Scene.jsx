import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

import BroncoModel   from './BroncoModel'
import SceneLights   from './SceneLights'
import ParticleField from './ParticleField'
import CameraRig     from './CameraRig'

export default function Scene({ scrollProgress }) {
  return (
    <div className="canvas-wrap">
      <Canvas
        camera={{ position: [0, 1.2, 10], fov: 38, near: 0.05, far: 300 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        shadows
        dpr={[1, 1.5]}
        frameloop="always"
        style={{ background: 'transparent' }}
      >
        <AdaptiveDpr pixelated />
        <Suspense fallback={null}>
          <CameraRig />

          <SceneLights   scrollProgress={scrollProgress} />
          <BroncoModel   scrollProgress={scrollProgress} />
          <ParticleField scrollProgress={scrollProgress} />

          {/* Ground plane at y=0 — matching model bottom */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[80, 80]} />
            <meshStandardMaterial
              color="#050402"
              metalness={0.6}
              roughness={0.4}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Subtle ground fog disc */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <circleGeometry args={[6, 64]} />
            <meshBasicMaterial color="#C8510A" transparent opacity={0.03} />
          </mesh>

          <Environment preset="night" />
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.8}
            blendFunction={BlendFunction.ADD}
          />
          <Vignette eskil={false} offset={0.25} darkness={0.95} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
