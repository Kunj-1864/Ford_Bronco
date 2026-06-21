import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// [scrollStart, scrollEnd, keyColor, keyIntensity, fillColor, fillIntensity, rimIntensity]
const BEATS = [
  [0.00, 0.14, '#0D0805', 0.3,  '#020204', 0.05, 2.0],  // darkness — near black
  [0.14, 0.28, '#E87D2B', 7.0,  '#1E3A5F', 1.8,  0.6],  // reveal — warm blast
  [0.28, 0.42, '#C89010', 5.5,  '#0A0A18', 0.8,  0.3],  // grille — golden steel
  [0.42, 0.56, '#C8510A', 8.0,  '#050505', 0.2,  0.5],  // wheel — low harsh
  [0.56, 0.72, '#F5A030', 10.0, '#C8510A', 3.0,  0.2],  // headlight — fire
  [0.72, 0.87, '#D8D0C0', 5.5,  '#3A5A7A', 3.0,  0.4],  // wide reveal — beauty
  [0.87, 1.00, '#E87D2B', 5.0,  '#1E3A5F', 2.0,  0.6],  // hero — showcase
]

function getBeat(sp) {
  for (const b of BEATS) if (sp >= b[0] && sp < b[1]) return b
  return BEATS[BEATS.length - 1]
}

export default function SceneLights({ scrollProgress }) {
  const keyRef   = useRef()
  const fillRef  = useRef()
  const rimRef   = useRef()
  const hlRef    = useRef()
  const topRef   = useRef()

  const kC = useRef(new THREE.Color())
  const fC = useRef(new THREE.Color())

  useFrame(() => {
    const sp = scrollProgress.current
    const [,, kc, ki, fc, fi, ri] = getBeat(sp)

    if (keyRef.current) {
      kC.current.set(kc)
      keyRef.current.color.lerp(kC.current, 0.05)
      keyRef.current.intensity = THREE.MathUtils.lerp(keyRef.current.intensity, ki, 0.05)
    }
    if (fillRef.current) {
      fC.current.set(fc)
      fillRef.current.color.lerp(fC.current, 0.05)
      fillRef.current.intensity = THREE.MathUtils.lerp(fillRef.current.intensity, fi, 0.05)
    }
    if (rimRef.current) {
      rimRef.current.intensity = THREE.MathUtils.lerp(rimRef.current.intensity, ri, 0.05)
    }

    // Headlight point — blazes during headlight beat
    if (hlRef.current) {
      const t = (sp > 0.52 && sp < 0.74) ? 12 : 0
      hlRef.current.intensity = THREE.MathUtils.lerp(hlRef.current.intensity, t, 0.06)
    }

    // Top fill in/out
    if (topRef.current) {
      const t = sp > 0.7 ? 1.5 : 0.1
      topRef.current.intensity = THREE.MathUtils.lerp(topRef.current.intensity, t, 0.04)
    }
  })

  return (
    <>
      <ambientLight intensity={0.03} color="#080604" />

      {/* Key — warm dramatic side */}
      <spotLight ref={keyRef}
        position={[6, 8, 4]} angle={0.25} penumbra={0.8}
        intensity={0.3} color="#0D0805"
        castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.001}
      />

      {/* Fill — opposite cool */}
      <spotLight ref={fillRef}
        position={[-6, 3, -5]} angle={0.4} penumbra={0.9}
        intensity={0.05} color="#020204"
        castShadow={false}
      />

      {/* Rim backlight — always on */}
      <pointLight ref={rimRef}
        position={[0, 2, -5]}
        intensity={2.0} color="#C8510A" distance={18}
      />

      {/* Ground bounce */}
      <pointLight position={[0, -0.5, 0]} intensity={0.4} color="#C84A0A" distance={8} />

      {/* Headlight simulation — real position from GLB: (0.5, 0.95, 1.72) */}
      <pointLight ref={hlRef}
        position={[0.5, 0.95, 1.9]}
        intensity={0} color="#F5A030" distance={6} decay={2}
      />

      {/* Top beauty fill for reveal beats */}
      <directionalLight ref={topRef}
        position={[0, 12, 3]} intensity={0.1} color="#E0D5C0"
      />
    </>
  )
}
