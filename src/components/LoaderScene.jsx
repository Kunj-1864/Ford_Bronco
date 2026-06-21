import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'

/**
 * Middle O (mesh_2) world center @ scale 0.15, group at origin
 *   Node TX: -11.265 | Local centre: (5.405, 4.965, 2.25)
 *   World: (-0.879, 0.745, 0.338)
 */
const O_X = -0.879
const O_Y =  0.745
const O_Z =  0.338

const CAM = { x: 0, y: 0.8, z: 7, tx: 0, ty: 0.5, tz: 0, fov: 44 }

// ─── BRONCO text ─────────────────────────────────────────────────
function BroncoText({ phase }) {
  const { scene }   = useGLTF('/BRONCO.glb')
  const groupRef    = useRef()
  const clock       = useRef(0)
  const frozen      = useRef(false)

  // Apply material once
  useEffect(() => {
    const mat = new THREE.MeshStandardMaterial({
      color:           '#c8c8c8',
      metalness:       0.9,
      roughness:       0.12,
      envMapIntensity: 1.5,
    })
    scene.traverse(obj => {
      if (obj.isMesh) { obj.material = mat; obj.castShadow = true }
    })
  }, [scene])

  // When fly phase starts — snap text to neutral so O aligns correctly
  useEffect(() => {
    if (phase !== 'fly' || !groupRef.current) return
    frozen.current = true
    gsap.to(groupRef.current.rotation, { y: 0, x: 0, duration: 0.5, ease: 'power3.out' })
    gsap.to(groupRef.current.position, { y: 0, z: 0, duration: 0.5, ease: 'power3.out' })
  }, [phase])

  useFrame((_, delta) => {
    if (!groupRef.current || frozen.current) return
    clock.current += delta
    const T = clock.current

    // Dramatic showroom motion:
    // — wide Y rock  ±32°
    // — vertical float
    // — slight Z depth pulse (breathes toward / away from camera)
    groupRef.current.rotation.y = Math.sin(T * 0.38) * 0.56
    groupRef.current.rotation.x = Math.sin(T * 0.22) * 0.06
    groupRef.current.position.y = Math.sin(T * 0.52) * 0.15
    groupRef.current.position.z = Math.sin(T * 0.28) * 0.4
  })

  return (
    <group ref={groupRef} scale={0.15}>
      <primitive object={scene} />
    </group>
  )
}

// ─── Balanced studio lighting ─────────────────────────────────────
// Environment handles reflections for the metal.
// Manual lights add drama and brand colour without bleaching.
function LoaderLights() {
  return (
    <>
      {/* Low ambient — just enough so deep shadows aren't pure black */}
      <ambientLight color="#ffffff" intensity={0.35} />

      {/* Key — slightly warm white, upper-front-right */}
      <directionalLight color="#fff4e6" intensity={3.5} position={[3, 4, 5]} />

      {/* Soft fill — cool left side */}
      <directionalLight color="#c0d4ff" intensity={1.5} position={[-5, 2, 3]} />

      {/* Rim — blue-white from back, separates chrome from bg */}
      <directionalLight color="#80a8ff" intensity={2.5} position={[-2, 1, -5]} />

      {/* Orange ground bounce — Ford brand warmth */}
      <pointLight color="#C8510A" intensity={3} position={[0, -2.5, 2.5]} distance={12} />
    </>
  )
}

// ─── Phase-aware camera ───────────────────────────────────────────
function LoaderCamera({ phase, onFlyDone }) {
  const { camera } = useThree()
  const idling     = useRef(true)
  const clock      = useRef(0)

  useEffect(() => {
    Object.assign(CAM, { x: 0, y: 0.8, z: 7, tx: 0, ty: 0.5, tz: 0, fov: 44 })
    camera.fov = 44
    camera.updateProjectionMatrix()
  }, []) // eslint-disable-line

  useEffect(() => {
    if (phase !== 'fly') return
    idling.current = false

    // Snapshot camera into proxy
    CAM.x = camera.position.x
    CAM.y = camera.position.y
    CAM.z = camera.position.z
    CAM.tx = 0; CAM.ty = 0.5; CAM.tz = 0
    CAM.fov = camera.fov

    const tl = gsap.timeline({ onComplete: onFlyDone })

    // ── Wind-up → O entry — one continuous flowing path ──────────

    // 1. Pull back — wide heroic reveal of the full text
    tl.to(CAM, {
      x: 0, y: 1.5, z: 11,
      tx: 0, ty: 0.5, tz: 0,
      fov: 58,
      duration: 0.9,
      ease: 'power2.out',
    })

    // 2. Arc right — dramatic orbit, camera swings to positive X
    tl.to(CAM, {
      x: 2.8, y: 0.5, z: 9,
      tx: 0, ty: 0.5, tz: 0,
      fov: 52,
      duration: 0.9,
      ease: 'power1.inOut',
    })

    // 3. Glide to O — one smooth sweep that ends already on the O axis.
    //    Camera arrives at the O's X/Y with distance still ahead.
    //    No separate "align" beat needed — it's already aimed.
    tl.to(CAM, {
      x: O_X, y: O_Y, z: 5.0,
      tx: O_X, ty: O_Y, tz: O_Z,
      fov: 30,
      duration: 1.4,
      ease: 'power2.inOut',
    })

    // 4. Rocket straight through — pure Z, zero lateral movement
    tl.to(CAM, {
      z: -8,
      tz: -9,
      fov: 10,
      duration: 1.0,
      ease: 'power3.in',
    })
  }, [phase]) // eslint-disable-line

  useFrame((_, delta) => {
    if (idling.current) {
      clock.current += delta
      const T = clock.current

      // Slow cinematic orbit — camera arcs around the text
      // giving a sense of the text floating in space
      const angle = T * 0.22
      camera.position.x = Math.sin(angle) * 2.2
      camera.position.y = 0.75 + Math.sin(T * 0.14) * 0.45
      camera.position.z = 7.2 + Math.cos(angle * 0.6) * 1.2
      camera.lookAt(0, 0.5, 0)
      if (camera.fov !== 44) { camera.fov = 44; camera.updateProjectionMatrix() }
      return
    }

    camera.position.set(CAM.x, CAM.y, CAM.z)
    camera.lookAt(CAM.tx, CAM.ty, CAM.tz)
    if (Math.abs(camera.fov - CAM.fov) > 0.01) {
      camera.fov = CAM.fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}

// ─── Exported canvas ──────────────────────────────────────────────
export default function LoaderScene({ phase, onFlyDone }) {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 7], fov: 44, near: 0.01, far: 200 }}
      gl={{
        antialias:           true,
        toneMapping:         THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace:    THREE.SRGBColorSpace,
      }}
      shadows={{ type: THREE.PCFShadowMap }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <LoaderLights />
      <Suspense fallback={null}>
        {/* Studio environment for chrome reflections — essential for metallic material */}
        <Environment preset="studio" />
        <BroncoText phase={phase} />
      </Suspense>
      <LoaderCamera phase={phase} onFlyDone={onFlyDone} />
    </Canvas>
  )
}

useGLTF.preload('/BRONCO.glb')
