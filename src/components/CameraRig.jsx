import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

/**
 * Real coordinates from GLB inspection (scale factor 0.862):
 *
 * FL Wheel center:   ( 0.669,  0.455,  1.073)
 * FR Wheel center:   (-0.669,  0.455,  1.073)
 * Grille center:     ( 0.000,  0.963,  1.659)
 * Headlight (R):     (~0.500,  0.950,  1.720)  approximate
 * Taillights:        ( 0.000,  1.012, -1.687)
 * Roof peak:         ( 0.000,  1.596,  0.000)
 * Car width:         1.910 (full), half = 0.955
 * Car length:        3.800 (full)
 */

// GSAP proxy
const C = { px: 0, py: 1.5, pz: 8, tx: 0, ty: 0.8, tz: 0, fov: 38 }

const _pos = new THREE.Vector3()
const _tgt = new THREE.Vector3()

export default function CameraRig() {
  const { camera } = useThree()

  useEffect(() => {
    Object.assign(C, { px: 0, py: 1.5, pz: 8, tx: 0, ty: 0.8, tz: 0, fov: 38 })

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })

    // Beat 1→2: Darkness → Reveal
    // Camera sweeps to right-rear quarter, elevated. See the whole car hit by one spotlight.
    tl.to(C, { duration: 1,
      px: 4.5,  py: 1.8,  pz: 4.0,
      tx: 0,    ty: 0.8,  tz: -0.3,
      fov: 46
    })

    // Beat 2→3: Reveal → Grille crash
    // Push dead-on into real grille center (0, 0.963, 1.659). Camera at z=3.5 looking at z=1.66.
    tl.to(C, { duration: 1,
      px: 0,    py: 0.963, pz: 3.5,
      tx: 0,    ty: 0.963, tz: 1.659,
      fov: 26
    })

    // Beat 3→4: Grille → FL Wheel ground crawl
    // Real FL wheel at (0.669, 0.455, 1.073). Camera from below-right.
    tl.to(C, { duration: 1,
      px: 1.8,  py: 0.05, pz: 2.2,
      tx: 0.669,ty: 0.455,tz: 1.073,
      fov: 20
    })

    // Beat 4→5: Wheel → Headlight stare
    // Real headlight at (~0.5, 0.95, 1.72). Camera directly in front.
    tl.to(C, { duration: 1,
      px: 0.5,  py: 0.95, pz: 3.0,
      tx: 0.5,  ty: 0.95, tz: 1.72,
      fov: 16
    })

    // Beat 5→6: Headlight → Wide drama (blast back, left-rear elevated)
    // Pull back to see full car from cinematic 3/4 rear angle.
    tl.to(C, { duration: 1,
      px: -5.5, py: 2.8,  pz: -3.5,
      tx: 0,    ty: 0.8,  tz: -0.2,
      fov: 54
    })

    // Beat 6→7: Wide → Hero shot (front-right quarter, elevated)
    tl.to(C, { duration: 1,
      px: 3.2,  py: 1.8,  pz: 5.5,
      tx: 0,    ty: 0.7,  tz: 0,
      fov: 44
    })

    ScrollTrigger.create({
      trigger: '.scroll-spacer',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      animation: tl,
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  useFrame(() => {
    _pos.set(C.px, C.py, C.pz)
    _tgt.set(C.tx, C.ty, C.tz)
    camera.position.copy(_pos)
    camera.lookAt(_tgt)
    if (Math.abs(camera.fov - C.fov) > 0.01) {
      camera.fov = C.fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}
