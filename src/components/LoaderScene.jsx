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

// GSAP camera proxy — written by the GSAP timeline, read every frame by useFrame
const CAM = { x: 0.5, y: 0.6, z: 4.2, tx: 0, ty: 0.7, tz: 0, fov: 62 }

// ─── BRONCO text ──────────────────────────────────────────────────────────
// Text is STATIC — the camera does all the drama.
// A barely-visible scale breathe (±0.6%) keeps it feeling alive without
// ever moving the O out of its known world position.
function BroncoText() {
  const { scene }  = useGLTF('/BRONCO.glb')
  const groupRef   = useRef()
  const clock      = useRef(0)

  // Apply chrome material once
  useEffect(() => {
    const mat = new THREE.MeshStandardMaterial({
      color:           '#c8c8c8',
      metalness:       0.92,
      roughness:       0.10,
      envMapIntensity: 1.8,
    })
    scene.traverse(obj => {
      if (obj.isMesh) { obj.material = mat; obj.castShadow = true }
    })
  }, [scene])

  // Subtle scale breathe — no rotation or translation so O stays put
  useFrame((_, delta) => {
    if (!groupRef.current) return
    clock.current += delta
    const s = 0.15 + Math.sin(clock.current * 0.45) * 0.0009
    groupRef.current.scale.setScalar(s)
  })

  return (
    <group ref={groupRef} scale={0.15}>
      <primitive object={scene} />
    </group>
  )
}

// ─── Studio lighting ──────────────────────────────────────────────────────
function LoaderLights() {
  return (
    <>
      {/* Low ambient — keeps shadows from going pure black */}
      <ambientLight color="#ffffff" intensity={0.30} />

      {/* Key — warm white, upper-front-right */}
      <directionalLight color="#fff4e6" intensity={3.8} position={[3, 4, 5]} />

      {/* Fill — cool, left side */}
      <directionalLight color="#c0d4ff" intensity={1.4} position={[-5, 2, 3]} />

      {/* Rim — blue-white from behind, lifts chrome off the dark bg */}
      <directionalLight color="#80a8ff" intensity={2.8} position={[-2, 1, -5]} />

      {/* Orange ground bounce — Ford brand warmth */}
      <pointLight color="#C8510A" intensity={3.2} position={[0, -2.5, 2.5]} distance={12} />
    </>
  )
}

// ─── Single cinematic camera sequence ────────────────────────────────────
//
// 4-beat GSAP timeline — no idle phase, no hard transition, one take:
//
//  Beat 0  (start)  : Tight frontal close-up — text fills the frame
//  Beat 1  (1.5 s)  : Dramatic pull-back + sweep left — full text reveal
//  Beat 2  (1.3 s)  : Arc to front-right — appreciation / beauty shot
//  Beat 3  (1.2 s)  : Lock straight onto the O letter — fly-in begins
//  Beat 4  (0.9 s)  : ROCKET through the O — screen snaps to black
//
//  Total ≈ 4.9 s
// ─────────────────────────────────────────────────────────────────────────
function CinematicCamera({ phase, onFlyDone }) {
  const { camera }   = useThree()
  const onDoneRef    = useRef(onFlyDone)
  const tlRef        = useRef(null)

  // Keep callback ref fresh without restarting the effect
  useEffect(() => { onDoneRef.current = onFlyDone }, [onFlyDone])

  // Initialise camera proxy + Three camera to the opening position on mount
  useEffect(() => {
    Object.assign(CAM, { x: 0.5, y: 0.6, z: 4.2, tx: 0, ty: 0.7, tz: 0, fov: 62 })
    camera.position.set(CAM.x, CAM.y, CAM.z)
    camera.fov = CAM.fov
    camera.updateProjectionMatrix()
  }, []) // eslint-disable-line

  // Fire the full cinematic sequence once the loading screen is gone
  useEffect(() => {
    if (phase !== 'intro') return

    // Kill any stale timeline
    tlRef.current?.kill()

    const tl = gsap.timeline({
      defaults:   { ease: 'power2.inOut' },
      onComplete: () => onDoneRef.current?.(),
    })

    // ── Beat 1: Dramatic pull-back + sweep left ───────────────────────────
    // Camera retreats and rises while swinging to the left — the chrome
    // BRONCO text is revealed in full against the black void.
    tl.to(CAM, {
      x: -3.8, y: 1.8, z: 9.5,
      tx: 0.4,  ty: 0.6, tz: 0,
      fov: 48,
      duration: 1.5,
    })

    // ── Beat 2: Arc to front-right — appreciation shot ───────────────────
    // Camera swings across to the right side, slightly lower.
    // The warm key light catches the chrome from this angle.
    tl.to(CAM, {
      x: 3.2, y: 0.8, z: 7.5,
      tx: -0.2, ty: 0.65, tz: 0,
      fov: 44,
      duration: 1.3,
    })

    // ── Beat 3: Lock onto the O ───────────────────────────────────────────
    // Camera glides smoothly to align dead-on with the O letter.
    // FOV narrows — the letterform fills the lens like a tunnel.
    tl.to(CAM, {
      x: O_X, y: O_Y, z: 4.8,
      tx: O_X, ty: O_Y, tz: O_Z,
      fov: 26,
      duration: 1.2,
    })

    // ── Beat 4: ROCKET through ────────────────────────────────────────────
    // Pure-Z acceleration — FOV compresses to a pinhole.
    // On completion, the loader fades out into the main site.
    tl.to(CAM, {
      z: -8, tz: -10,
      fov: 9,
      duration: 0.9,
      ease: 'power3.in',
    })

    tlRef.current = tl
    return () => tl.kill()
  }, [phase]) // eslint-disable-line

  // Read proxy every frame → drive Three.js camera
  useFrame(() => {
    camera.position.set(CAM.x, CAM.y, CAM.z)
    camera.lookAt(CAM.tx, CAM.ty, CAM.tz)
    if (Math.abs(camera.fov - CAM.fov) > 0.01) {
      camera.fov = CAM.fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}

// ─── Exported canvas ──────────────────────────────────────────────────────
export default function LoaderScene({ phase, onFlyDone }) {
  return (
    <Canvas
      camera={{ position: [0.5, 0.6, 4.2], fov: 62, near: 0.01, far: 200 }}
      gl={{
        antialias:           true,
        toneMapping:         THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        outputColorSpace:    THREE.SRGBColorSpace,
      }}
      shadows={{ type: THREE.PCFShadowMap }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <LoaderLights />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <BroncoText />
      </Suspense>
      <CinematicCamera phase={phase} onFlyDone={onFlyDone} />
    </Canvas>
  )
}

useGLTF.preload('/BRONCO.glb')
