import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollProgress() {
  const progress = useRef(0)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    })

    // Tell ScrollTrigger to read scroll position from Lenis instead of
    // the native DOM — this prevents scrub drift when the two disagree.
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
    })

    // Lenis → ScrollTrigger bridge
    lenis.on('scroll', e => {
      progress.current = e.progress
      ScrollTrigger.update()
    })

    // Use GSAP ticker for Lenis RAF (no double rAF loops)
    const tick = time => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Recompute all trigger positions against the Lenis-proxied scroller
    ScrollTrigger.refresh()

    return () => {
      ScrollTrigger.scrollerProxy(document.documentElement, null)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return progress
}
