import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'
import LoaderScene    from './LoaderScene'
import LoadingScreen  from './LoadingScreen'

export default function Loader({ onComplete }) {
  const { progress, active } = useProgress()
  // 'loading' → pure HTML screen while models fetch
  // 'intro'   → BRONCO text orbiting; user sees the starting sequence
  const [phase, setPhase] = useState('loading')
  const wrapRef           = useRef()
  const sceneWrapRef      = useRef()
  const triggered         = useRef(false)

  // When all models are loaded, transition loading → intro
  // The CinematicCamera timeline inside LoaderScene owns the full sequence
  // and calls onFlyDone when it completes — no extra phase needed.
  useEffect(() => {
    if (!active && progress >= 100 && !triggered.current) {
      triggered.current = true

      // Brief pause so the progress bar visually hits 100
      setTimeout(() => {
        setPhase('intro')
        if (sceneWrapRef.current) {
          gsap.to(sceneWrapRef.current, { opacity: 1, duration: 0.9, ease: 'power2.out' })
        }
      }, 450)
    }
  }, [active, progress])

  function handleFlyDone() {
    gsap.to(wrapRef.current, {
      opacity: 0,
      duration: 0.35,
      ease: 'power1.in',
      onComplete: () => {
        wrapRef.current?.classList.add('out')
        onComplete?.()
      },
    })
  }

  return (
    <div className="loader-wrap" ref={wrapRef}>

      {/* ── 3D intro scene ───────────────────────────────────────────
          Always mounted so useGLTF.preload is tracked by useProgress,
          but invisible (opacity:0) until the intro phase begins.      */}
      <div ref={sceneWrapRef} className="loader-scene-wrap">
        <LoaderScene phase={phase} onFlyDone={handleFlyDone} />
      </div>

      {/* ── HTML loading screen ──────────────────────────────────────
          Overlays the hidden 3D scene until all models are ready.     */}
      <LoadingScreen progress={progress} visible={phase === 'loading'} />

    </div>
  )
}
