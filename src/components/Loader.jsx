import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'
import LoaderScene from './LoaderScene'

export default function Loader({ onComplete }) {
  const { progress, active } = useProgress()
  const [phase, setPhase]    = useState('loading')
  const wrapRef              = useRef()
  const hudRef               = useRef()
  const barRef               = useRef()
  const triggered            = useRef(false)

  // Drive progress bar
  useEffect(() => {
    if (barRef.current) barRef.current.style.width = `${progress}%`
  }, [progress])

  // When fully loaded, kick off fly-through
  useEffect(() => {
    if (!active && progress >= 100 && !triggered.current) {
      triggered.current = true
      setTimeout(() => {
        // Fade HUD out before blast
        if (hudRef.current) {
          gsap.to(hudRef.current, { opacity: 0, duration: 0.5, ease: 'power1.in' })
        }
        setPhase('fly')
      }, 700)
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
      {/* 3-D scene */}
      <LoaderScene phase={phase} onFlyDone={handleFlyDone} />

      {/* Progress HUD */}
      <div className="loader-hud" ref={hudRef}>
        <div className="loader-hud-eyebrow">FORD · 2021</div>
        <div className="loader-hud-bar-wrap">
          <div className="loader-hud-bar" ref={barRef} />
        </div>
        <div className="loader-hud-pct">{Math.round(progress)}%</div>
      </div>
    </div>
  )
}
