import { Suspense } from 'react'
import { useScrollProgress } from './hooks/useScrollProgress'
import Scene        from './components/Scene'
import Overlay      from './components/Overlay'
import Loader       from './components/Loader'


export default function App() {
  const scrollProgress = useScrollProgress()

  return (
    <>
      {/* Film grain */}
      <div className="noise" />



      {/* Loading screen */}
      <Loader onComplete={() => { document.body.style.overflow = 'auto' }} />

      {/* ── Fixed stage — everything lives here ── */}
      <div className="fixed-stage">

        {/* NAV — absolute inside fixed stage */}
        <nav className="main-nav">
          <a href="#" className="nav-brand">
            FORD<em>.</em>BRONCO
          </a>
          <ul className="nav-links">
            <li><a href="#">Overview</a></li>
            <li><a href="#">Performance</a></li>
            <li><a href="#">Configure</a></li>
          </ul>
          <button className="nav-cta">Order Now</button>
        </nav>

        {/* 3D Canvas — z:5, alpha:true */}
        <Scene scrollProgress={scrollProgress} />

        {/* Cinematic text overlay — behind (z:2) + front (z:10) */}
        <Suspense fallback={null}>
          <Overlay scrollProgress={scrollProgress} />
        </Suspense>

      </div>

      {/* Scroll spacer — the only element that scrolls, invisible */}
      <div className="scroll-spacer" aria-hidden="true" />
    </>
  )
}
