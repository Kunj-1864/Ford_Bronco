# Ford Bronco — Cinematic 3D Showcase Website

A scroll-driven, cinematic 3D experience built around the Ford Bronco.

---

## What It Does

- **Scroll-scrubbed camera** — GSAP + ScrollTrigger animates 7 cinematic camera beats tied 1:1 to scroll progress
- **Real-geometry precision** — Camera targets derived from actual GLB mesh coordinates (grille, wheels, headlights, taillights)
- **Cinematic text overlay** — Section titles and subtitles fade in/out in sync with each camera beat
- **Particle field** — Ambient floating particles add depth to the dark environment
- **Film grain** — Subtle CSS noise overlay for a cinematic, analog feel
- **Smooth loader** — Full-screen branded intro that fades out once the 3D scene is ready

---

## 🛠 Stack

| Layer | Tool |
|---|---|
| Framework | React + Vite |
| 3D Rendering | Three.js via `@react-three/fiber` |
| 3D Helpers | `@react-three/drei` (Environment, ContactShadows) |
| Animation | GSAP + ScrollTrigger |
| Model Format | GLB (loaded via `useGLTF`) |
| Styling | Vanilla CSS |

---

## 🎬 Camera Beats

| Beat | Shot |
|---|---|
| 0 → 1 | Darkness — wide front reveal |
| 1 → 2 | Right-rear quarter, full car in one spotlight |
| 2 → 3 | Dead-on grille crash (real grille center: `0, 0.963, 1.659`) |
| 3 → 4 | FL wheel ground crawl from below |
| 4 → 5 | Headlight stare, tight 16° FOV |
| 5 → 6 | Wide blast — full car from cinematic rear angle |
| 6 → 7 | Hero shot — front-right quarter, elevated |

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and scroll.

---

> *Designed and Built by Kunj Sharma*
