import type { CSSProperties } from 'react'

type RingStyle = CSSProperties & { '--size': string; '--w': string; '--rx': string; '--ry': string; '--rz': string }

/** Cada anel tomba num eixo diferente; com --hero-tilt = 0 ficam concêntricos, de frente. */
const RINGS: RingStyle[] = [
  { '--size': '100%', '--w': '6%', '--rx': '58deg', '--ry': '-16deg', '--rz': '34deg' },
  { '--size': '82%', '--w': '7%', '--rx': '46deg', '--ry': '28deg', '--rz': '-48deg' },
  { '--size': '64%', '--w': '8.5%', '--rx': '66deg', '--ry': '-34deg', '--rz': '62deg' },
  { '--size': '47%', '--w': '11%', '--rx': '34deg', '--ry': '44deg', '--rz': '-28deg' },
]

/**
 * Anéis 3D "metálicos" em CSS puro (sem three.js): cada anel é um disco com conic-gradient
 * recortado por mask radial, com 3 camadas em translateZ para dar espessura. Decorativo.
 */
export function HeroRings() {
  return (
    <div aria-hidden="true" className="hero-backdrop">
      <div className="hero-glow" />
      <div className="hero-rings">
        <div className="hero-rings-3d">
          {RINGS.map((style, i) => (
            <div key={i} className="hero-ring" style={style}>
              <span className="hero-ring-layer" />
              <span className="hero-ring-layer" />
              <span className="hero-ring-layer" />
            </div>
          ))}
        </div>
        <div className="hero-core" />
      </div>
    </div>
  )
}
