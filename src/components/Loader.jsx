import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'

export default function Loader({ onComplete }) {
  const { progress, active } = useProgress()
  const rootRef = useRef()
  const barRef  = useRef()
  const done    = useRef(false)

  useEffect(() => {
    if (barRef.current) barRef.current.style.width = `${progress}%`
  }, [progress])

  useEffect(() => {
    if (!active && progress >= 100 && !done.current) {
      done.current = true
      setTimeout(() => {
        gsap.to(rootRef.current, {
          opacity: 0, duration: 1, ease: 'power2.inOut',
          onComplete: () => {
            rootRef.current?.classList.add('out')
            onComplete?.()
          }
        })
      }, 500)
    }
  }, [active, progress, onComplete])

  return (
    <div className="loader" ref={rootRef}>
      <div className="loader-logo">BRONCO</div>
      <div className="loader-bar-wrap">
        <div className="loader-bar" ref={barRef} />
      </div>
      <div className="loader-pct">{Math.round(progress)}%</div>
    </div>
  )
}
