import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Animated dust particles floating around the scene
export default function ParticleField({ scrollProgress }) {
  const meshRef = useRef()
  const count = 300

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      velocities[i * 3]     = (Math.random() - 0.5) * 0.002
      velocities[i * 3 + 1] = Math.random() * 0.001
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002
    }
    return { positions, velocities }
  }, [])

  useFrame(() => {
    if (!meshRef.current) return
    const posAttr = meshRef.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3]     += velocities[i * 3]
      posAttr.array[i * 3 + 1] += velocities[i * 3 + 1]
      posAttr.array[i * 3 + 2] += velocities[i * 3 + 2]
      // Wrap around
      if (posAttr.array[i * 3 + 1] > 5) posAttr.array[i * 3 + 1] = -5
    }
    posAttr.needsUpdate = true

    // Fade particles based on scroll
    const sp = scrollProgress.current
    const opacity = sp > 0.9 ? THREE.MathUtils.lerp(1, 0.1, (sp - 0.9) / 0.1) : 1
    meshRef.current.material.opacity = opacity * 0.4
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#C8510A"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}
