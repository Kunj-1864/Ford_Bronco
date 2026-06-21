import { useEffect, useRef } from 'react'

// smoothstep
const ss = (a, b, v) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// beat visibility: ramps 0→1 from inAt→peakAt, then 1→0 from peakAt→outAt
const bv = (sp, inAt, peakAt, outAt) => {
  if (sp <= inAt || sp >= outAt) return 0
  if (sp <= peakAt) return ss(inAt, peakAt, sp)
  return 1 - ss(peakAt, outAt, sp)
}

// Apply visibility to a DOM ref
const applyVis = (el, v, opts = {}) => {
  if (!el) return
  const {
    fromX = 0, fromY = 0, toX = 0, toY = 0,
    fromScale = 1, toScale = 1,
    fromSkew = 0,
    clipY = false,
  } = opts
  const inv = 1 - v
  el.style.opacity = v
  const tx = fromX + (toX - fromX) * v
  const ty = fromY + (toY - fromY) * v
  const sc = fromScale + (toScale - fromScale) * v
  const sk = fromSkew * inv
  el.style.transform = `translate(${tx}px,${ty}px) scale(${sc}) skewY(${sk}deg)`
  if (clipY) el.style.clipPath = `inset(${(1 - v) * 100}% 0 0 0)`
}

export default function Overlay({ scrollProgress }) {
  // Beat 1 — Darkness
  const b1Title   = useRef()
  const b1Sub     = useRef()

  // Beat 2 — Reveal
  const b2Line1   = useRef()
  const b2Line2   = useRef()
  const b2Line3   = useRef()
  const b2Tag     = useRef()

  // Beat 3 — Grille
  const b3Word1   = useRef()
  const b3Word2   = useRef()
  const b3Desc    = useRef()

  // Beat 4 — Wheel
  const b4Big     = useRef()
  const b4Spec    = useRef()

  // Beat 5 — Headlight
  const b5Line1   = useRef()
  const b5Line2   = useRef()
  const b5Line3   = useRef()

  // Beat 6 — 3/4 Reveal (specs)
  const b6Title   = useRef()
  const b6s1      = useRef(); const b6s2 = useRef()
  const b6s3      = useRef(); const b6s4 = useRef()

  // Beat 7 — Finale
  const b7Title   = useRef()
  const b7Sub     = useRef()
  const b7Cta     = useRef()

  // Progress bar + dots
  const progressEl = useRef()
  const dotsEl     = useRef()

  useEffect(() => {
    const BEATS = [
      [0.00, 0.13],
      [0.13, 0.27],
      [0.27, 0.42],
      [0.42, 0.57],
      [0.57, 0.72],
      [0.72, 0.87],
      [0.87, 1.00],
    ]

    let raf
    const update = () => {
      const sp = scrollProgress.current

      /* ── Progress bar ── */
      if (progressEl.current) {
        progressEl.current.style.transform = `scaleX(${sp})`
      }

      /* ── Dots ── */
      if (dotsEl.current) {
        const idx = Math.min(Math.floor(sp / (1 / 7)), 6)
        dotsEl.current.querySelectorAll('.dot').forEach((d, i) => {
          d.classList.toggle('active', i === idx)
        })
      }

      /* ── Beat 1: Darkness — "BRONCO" behind layer ── */
      {
        applyVis(b1Title.current, bv(sp, 0,    0.06, 0.17), { fromY: 30, toY: 0 })
        applyVis(b1Sub.current,   bv(sp, 0.02, 0.08, 0.17), { fromY: 20, toY: 0 })
      }

      /* ── Beat 2: Reveal — "BUILT / FOR / THE WILD" (cam swings right) ── */
      {
        applyVis(b2Line1.current, bv(sp, 0.13, 0.18, 0.30), { fromX: -150, toX: 0, fromSkew: -5 })
        applyVis(b2Line2.current, bv(sp, 0.15, 0.20, 0.30), { fromX: -150, toX: 0, fromSkew: -5 })
        applyVis(b2Line3.current, bv(sp, 0.17, 0.22, 0.30), { fromX: -150, toX: 0, fromSkew: -5 })
        applyVis(b2Tag.current,   bv(sp, 0.20, 0.24, 0.30), { fromY: 20, toY: 0 })
      }

      /* ── Beat 3: Grille — "AMERICAN / LEGACY" from right ── */
      {
        applyVis(b3Word1.current, bv(sp, 0.28, 0.33, 0.44), { fromX: 160, toX: 0, fromSkew: 4 })
        applyVis(b3Word2.current, bv(sp, 0.30, 0.35, 0.44), { fromX: 160, toX: 0, fromSkew: 4 })
        applyVis(b3Desc.current,  bv(sp, 0.33, 0.37, 0.44), { fromY: 16,  toY: 0 })
      }

      /* ── Beat 4: Wheel — "GRIP." + specs ── */
      {
        applyVis(b4Big.current,  bv(sp, 0.42, 0.47, 0.58), { fromScale: 1.5, toScale: 1 })
        applyVis(b4Spec.current, bv(sp, 0.46, 0.51, 0.58), { fromY: 20, toY: 0 })
      }

      /* ── Beat 5: Headlight — wipe-in lines ── */
      {
        applyVis(b5Line1.current, bv(sp, 0.57, 0.62, 0.76), { clipY: true })
        applyVis(b5Line2.current, bv(sp, 0.59, 0.64, 0.76), { clipY: true })
        applyVis(b5Line3.current, bv(sp, 0.61, 0.66, 0.76), { clipY: true })
      }

      /* ── Beat 6: 3/4 Reveal specs ── */
      {
        applyVis(b6Title.current, bv(sp, 0.72, 0.77, 0.89), { fromY: -30, toY: 0 })
        applyVis(b6s1.current,    bv(sp, 0.74, 0.79, 0.89), { fromY: 22, toY: 0 })
        applyVis(b6s2.current,    bv(sp, 0.75, 0.80, 0.89), { fromY: 22, toY: 0 })
        applyVis(b6s3.current,    bv(sp, 0.76, 0.81, 0.89), { fromY: 22, toY: 0 })
        applyVis(b6s4.current,    bv(sp, 0.77, 0.82, 0.89), { fromY: 22, toY: 0 })
      }

      /* ── Beat 7: Finale — stays visible at bottom of scroll ── */
      {
        applyVis(b7Title.current, bv(sp, 0.87, 0.92, 1.02), { fromY: 60, toY: 0 })
        applyVis(b7Sub.current,   bv(sp, 0.89, 0.93, 1.02), { fromY: 36, toY: 0 })
        applyVis(b7Cta.current,   bv(sp, 0.91, 0.95, 1.02), { fromY: 24, toY: 0 })
      }

      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [scrollProgress])

  return (
    <>
      {/* ── Progress bar ── */}
      <div className="ov-progress" ref={progressEl} />

      {/* ── Section dots ── */}
      <div className="ov-dots" ref={dotsEl}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="dot" />
        ))}
      </div>

      {/* ══ BEHIND LAYER (z:2) ══ */}
      <div className="ov-layer ov-behind">

        {/* Beat 1: Enormous BRONCO behind car */}
        <div className="beat beat-1-bg">
          <div ref={b1Title} className="behind-title" style={{ opacity: 0 }}>
            BRONCO
          </div>
          <div ref={b1Sub} className="behind-sub" style={{ opacity: 0 }}>
            FORD MOTOR COMPANY · EST. 1966
          </div>
        </div>

        {/* Beat 4: GRIP. behind wheel */}
        <div className="beat beat-4-bg">
          <div ref={b4Big} className="grip-title" style={{ opacity: 0 }}>
            GRIP.
          </div>
        </div>

      </div>

      {/* ══ FRONT LAYER (z:10) ══ */}
      <div className="ov-layer ov-front">

        {/* Beat 2: Reveal */}
        <div className="beat beat-2">
          <div className="reveal-stack">
            <div ref={b2Line1} className="reveal-word" style={{ opacity: 0 }}>BUILT</div>
            <div ref={b2Line2} className="reveal-word" style={{ opacity: 0 }}>FOR</div>
            <div ref={b2Line3} className="reveal-word accent" style={{ opacity: 0 }}>THE WILD</div>
          </div>
          <div ref={b2Tag} className="reveal-tag" style={{ opacity: 0 }}>
            <span className="dot-line" />
            Engineered for the impossible
          </div>
        </div>

        {/* Beat 3: Grille — right side */}
        <div className="beat beat-3">
          <div className="grille-stack">
            <div ref={b3Word1} className="grille-word" style={{ opacity: 0 }}>AMERICAN</div>
            <div ref={b3Word2} className="grille-word grille-outline" style={{ opacity: 0 }}>LEGACY</div>
          </div>
          <div ref={b3Desc} className="grille-desc" style={{ opacity: 0 }}>
            Forged steel. Zero compromise.
          </div>
        </div>

        {/* Beat 4: Wheel spec overlay */}
        <div className="beat beat-4-front">
          <div ref={b4Spec} className="wheel-spec" style={{ opacity: 0 }}>
            <div className="spec-number">35"</div>
            <div className="spec-label">ALL-TERRAIN<br />BFGoodrich</div>
            <div className="spec-bar" />
            <div className="spec-row"><span>Clearance</span><span>11.6 in</span></div>
            <div className="spec-row"><span>Suspension</span><span>HOSS 3.0</span></div>
            <div className="spec-row"><span>Approach Angle</span><span>43.2°</span></div>
          </div>
        </div>

        {/* Beat 5: Headlight */}
        <div className="beat beat-5">
          <div className="headlight-stack">
            <div ref={b5Line1} className="hl-word" style={{ opacity: 0 }}>SEE</div>
            <div ref={b5Line2} className="hl-word hl-outline" style={{ opacity: 0 }}>THROUGH</div>
            <div ref={b5Line3} className="hl-word" style={{ opacity: 0 }}>THE DARK</div>
          </div>
        </div>

        {/* Beat 6: 3/4 specs */}
        <div className="beat beat-6">
          <div ref={b6Title} className="beauty-title" style={{ opacity: 0 }}>
            BRONCO<br /><span>2021</span>
          </div>
          <div className="specs-grid">
            <div ref={b6s1} className="spec-card" style={{ opacity: 0 }}>
              <div className="sc-val">330<span>hp</span></div>
              <div className="sc-label">EcoBoost® 2.7L</div>
            </div>
            <div ref={b6s2} className="spec-card" style={{ opacity: 0 }}>
              <div className="sc-val">7</div>
              <div className="sc-label">Go Modes™</div>
            </div>
            <div ref={b6s3} className="spec-card" style={{ opacity: 0 }}>
              <div className="sc-val">4×4</div>
              <div className="sc-label">Full-Time AWD</div>
            </div>
            <div ref={b6s4} className="spec-card" style={{ opacity: 0 }}>
              <div className="sc-val">29"</div>
              <div className="sc-label">Water Fording</div>
            </div>
          </div>
        </div>

        {/* Beat 7: Finale */}
        <div className="beat beat-7">
          <div ref={b7Title} className="finale-title" style={{ opacity: 0 }}>
            FORD<br /><em>BRONCO</em>
          </div>
          <div ref={b7Sub} className="finale-sub" style={{ opacity: 0 }}>
            The most capable Bronco ever built.
          </div>
          <div ref={b7Cta} className="finale-cta" style={{ opacity: 0 }}>
            <button className="btn-primary" id="btn-configure">Configure Yours</button>
            <button className="btn-ghost"   id="btn-explore">Explore Features</button>
          </div>
        </div>

      </div>
    </>
  )
}
