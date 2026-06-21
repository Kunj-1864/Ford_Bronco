import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Ground plane with subtle reflection
export default function GroundPlane({ scrollProgress }) {
  const meshRef = useRef()

  useFrame(() => {
    if (!meshRef.current) return
    const sp = scrollProgress.current
    // Fade ground in after hero phase
    const opacity = sp < 0.05 ? sp / 0.05 * 0.15 : 0.15
    meshRef.current.material.opacity = opacity
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.98, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        color="#0d0a07"
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.15}
      />
    </mesh>
  )
}
