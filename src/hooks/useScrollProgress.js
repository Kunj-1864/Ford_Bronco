import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Snap targets ──────────────────────────────────────────────────────────────
// One per beat — the progress value where all text in that beat is fully visible.
// Index matches the active dot shown by Overlay.jsx (floor(sp * 7), capped at 6).
//
//  Beat 0 (Darkness)     → 0.09
//  Beat 1 (Reveal)       → 0.25
//  Beat 2 (Grille)       → 0.38
//  Beat 3 (Wheel)        → 0.52
//  Beat 4 (Headlight)    → 0.68  (extended plateau: all 3 clip-lines at v=1)
//  Beat 5 (3/4 Reveal)   → 0.83
//  Beat 6 (Finale)       → 0.95
const SNAP_TARGETS = [0.09, 0.25, 0.38, 0.52, 0.68, 0.83, 0.95]

// ms of scroll silence before snap evaluates
const SNAP_DELAY = 380

// Don't re-snap if already within this distance of the target (avoids stutter)
const SNAP_MIN = 0.012

const snapEase = t => Math.min(1, 1.001 - Math.pow(2, -10 * t))

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

    // ── Section snap ──────────────────────────────────────────────────────────
    // Mirrors the active-dot logic in Overlay.jsx exactly:
    //   idx = Math.min(Math.floor(progress * 7), 6)
    //
    // After SNAP_DELAY ms of scroll silence, determine which section the user
    // is currently in and snap to that section's peak — the same section the
    // active dot is highlighting. No radius math, no nearest-neighbour: you
    // always land on the beat you're already watching.
    let snapTimer = null

    const attemptSnap = () => {
      const p   = progress.current
      const idx = Math.min(Math.floor(p * 7), 6)     // same formula as the dots
      const target = SNAP_TARGETS[idx]
      const dist   = Math.abs(p - target)

      // Skip if already sitting on (or past) the target — avoids re-trigger loop
      if (dist <= SNAP_MIN) return

      lenis.scrollTo(target * lenis.limit, {
        duration: 0.42,
        easing:   snapEase,
      })
    }

    // Lenis → ScrollTrigger bridge + snap timer reset on every scroll tick
    lenis.on('scroll', e => {
      progress.current = e.progress
      ScrollTrigger.update()

      // Reset idle timer — snap only fires after the user truly stops
      clearTimeout(snapTimer)
      snapTimer = setTimeout(attemptSnap, SNAP_DELAY)
    })

    // Use GSAP ticker for Lenis RAF (no double rAF loops)
    const tick = time => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Recompute all trigger positions against the Lenis-proxied scroller
    ScrollTrigger.refresh()

    return () => {
      clearTimeout(snapTimer)
      ScrollTrigger.scrollerProxy(document.documentElement, null)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return progress
}
