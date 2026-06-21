import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function HeroSection() {
  const eyebrowRef = useRef()
  const headline1 = useRef()
  const headline2 = useRef()
  const headline3 = useRef()
  const subRef = useRef()

  useEffect(() => {
    const tl = gsap.timeline({ delay: 1.5 })

    tl.fromTo(eyebrowRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo([headline1.current, headline2.current, headline3.current],
      { yPercent: 110, skewY: 4 },
      { yPercent: 0, skewY: 0, duration: 1.2, ease: 'power4.out', stagger: 0.1 },
      '-=0.6'
    )
    .fromTo(subRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: 'power2.out' },
      '-=0.4'
    )
  }, [])

  return (
    <section className="section-hero" id="hero">
      <div ref={eyebrowRef} className="hero__eyebrow" style={{ opacity: 0 }}>
        Ford Motor Company · 2021
      </div>

      <h1 className="hero__headline">
        <span className="line">
          <span className="word" ref={headline1}>BUILT</span>
        </span>
        <span className="line">
          <span className="word" ref={headline2}>FOR</span>
        </span>
        <span className="line">
          <span className="word" ref={headline3}>THE WILD</span>
        </span>
      </h1>

      <p ref={subRef} className="hero__sub" style={{ opacity: 0 }}>
        The legend returns. Engineered for extremes.
      </p>

      <div className="scroll-hint">
        <div className="scroll-hint__line" />
        <span className="scroll-hint__text">Scroll to Explore</span>
      </div>
    </section>
  )
}
