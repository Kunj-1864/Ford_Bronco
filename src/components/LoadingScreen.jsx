import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function LoadingScreen({ progress, visible }) {
  const wrapRef = useRef()
  const fillRef = useRef()
  const pctRef  = useRef()

  // Drive progress bar + counter
  useEffect(() => {
    if (fillRef.current) {
      gsap.to(fillRef.current, { width: `${progress}%`, duration: 0.12, ease: 'none' })
    }
    if (pctRef.current) {
      pctRef.current.textContent = String(Math.round(progress)).padStart(3, '0')
    }
  }, [progress])

  // Exit animation when loading finishes
  useEffect(() => {
    if (visible || !wrapRef.current) return
    gsap.to(wrapRef.current, {
      opacity: 0,
      duration: 0.55,
      ease: 'power2.in',
      onComplete: () => {
        if (wrapRef.current) wrapRef.current.style.display = 'none'
      },
    })
  }, [visible])

  return (
    <div className="ls-wrap" ref={wrapRef}>
      {/* Corner bracket decorations */}
      <div className="ls-corner ls-corner--tl" />
      <div className="ls-corner ls-corner--tr" />
      <div className="ls-corner ls-corner--bl" />
      <div className="ls-corner ls-corner--br" />

      {/* Scan line sweep */}
      <div className="ls-scanline" />

      {/* Center content */}
      <div className="ls-center">
        <p className="ls-eyebrow">FORD · MOTOR · COMPANY</p>
        <div className="ls-divider" />
        <h1 className="ls-title">BRONCO</h1>
        <p className="ls-subtitle">EST. 1966 · REBORN 2021</p>

        <div className="ls-progress">
          <div className="ls-bar-track">
            <div className="ls-bar-fill" ref={fillRef} />
          </div>
          <div className="ls-pct-row">
            <span className="ls-label">LOADING EXPERIENCE</span>
            <span className="ls-pct" ref={pctRef}>000</span>
          </div>
        </div>
      </div>
    </div>
  )
}
