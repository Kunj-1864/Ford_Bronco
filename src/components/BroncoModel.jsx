import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL = '/2021_ford_bronco_2-door.glb'
useGLTF.preload(MODEL)

export default function BroncoModel({ scrollProgress }) {
  const groupRef = useRef()
  const { scene } = useGLTF(MODEL)

  useEffect(() => {
    if (!groupRef.current) return
    const clone = scene.clone(true)

    clone.traverse(child => {
      if (!child.isMesh || !child.material) return
      child.castShadow = true
      child.receiveShadow = true
      const m = child.material
      const n = (m.name || '')

      // Exact material names from GLB inspection
      if (n.startsWith('BRBumperFront') || n.startsWith('BRBumperRear')) {
        m.roughness = 0.5; m.metalness = 0.3
      } else if (n.startsWith('BRDoors') || n.startsWith('BRRoof') || n.startsWith('BRTrunk')) {
        // Body panels — paint
        m.roughness = 0.18; m.metalness = 0.08; m.envMapIntensity = 2.2
      } else if (n.startsWith('BRChassis')) {
        m.roughness = 0.6; m.metalness = 0.4
      } else if (n.startsWith('BRWindows') || n.includes('Glass') || n.includes('glass')) {
        m.transparent = true; m.opacity = 0.25; m.roughness = 0; m.metalness = 0.1
      } else if (n.startsWith('BRMirrors')) {
        m.roughness = 0.05; m.metalness = 0.95; m.envMapIntensity = 4
      } else if (n.startsWith('BRSuspension') || n.startsWith('BRBrakeFL')) {
        m.roughness = 0.7; m.metalness = 0.5
      } else if (n === 'BRHeadlights_XSG1' || n === 'BRHeadlights_XSG3') {
        // Real headlight lenses — make them glow
        m.emissive = new THREE.Color(1.0, 0.55, 0.1)
        m.emissiveIntensity = 0
        m.roughness = 0.0; m.metalness = 0.1
      } else if (n.startsWith('BRInterior')) {
        m.roughness = 0.8; m.metalness = 0
      }
      m.needsUpdate = true
    })

    // ── Scale to fit ──────────────────────────────────────────────
    const box0 = new THREE.Box3().setFromObject(clone)
    const size  = box0.getSize(new THREE.Vector3())
    const s     = 3.8 / Math.max(size.x, size.y, size.z)
    clone.scale.setScalar(s)

    // ── Center on XZ, align BOTTOM to y = 0 ──────────────────────
    const box1 = new THREE.Box3().setFromObject(clone) // recompute after scale
    const center = box1.getCenter(new THREE.Vector3())
    clone.position.x = -center.x
    clone.position.z = -center.z
    clone.position.y = -box1.min.y   // lift so wheels sit on y=0

    groupRef.current.add(clone)
    return () => groupRef.current?.remove(clone)
  }, [scene])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const sp = scrollProgress.current
    const t  = state.clock.elapsedTime

    // Idle sway in darkness
    if (sp < 0.13) {
      groupRef.current.rotation.y = Math.sin(t * 0.14) * 0.06
      groupRef.current.position.y = Math.sin(t * 0.55) * 0.025
    }
    // Lock rotation during close-ups
    else if (sp < 0.87) {
      groupRef.current.rotation.y = 0
      groupRef.current.position.y = 0
    }
    // Hero finale — slow spin
    else {
      groupRef.current.rotation.y += delta * 0.2
    }

    // Headlight emissive glow — real material names from GLB
    const inLightBeat = sp > 0.55 && sp < 0.74
    groupRef.current.traverse(child => {
      if (!child.isMesh || !child.material) return
      const n = child.material.name || ''
      if (n === 'BRHeadlights_XSG1' || n === 'BRHeadlights_XSG3') {
        const target = inLightBeat ? 5 : 0
        child.material.emissiveIntensity = THREE.MathUtils.lerp(
          child.material.emissiveIntensity, target, 0.06
        )
      }
    })
  })

  return <group ref={groupRef} />
}
