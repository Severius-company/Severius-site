'use client'

import { Canvas, useFrame, type RootState } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const COUNT = 96
const smooth = (edge0: number, edge1: number, x: number) => { const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0))); return t * t * t * (t * (t * 6 - 15) + 10) }

/** PRNG determinístico: a mesma cena em todo carregamento, sem ruído procedural imprevisível. */
function mulberry32(seed: number) {
  return () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

/** Ponto sobre o "S": dois arcos complementares (duas correntes) que se encontram no centro. */
function sPoint(u: number, side: number, out: THREE.Vector3) {
  const R = 0.8, sweep = Math.PI * 1.35
  const upper = u < 0.5
  const k = upper ? u / 0.5 : (u - 0.5) / 0.5
  const theta = upper ? Math.PI * 0.15 + k * sweep : Math.PI / 2 - k * sweep
  const cx = 0, cy = upper ? R : -R
  const r = R + side * 0.16
  return out.set(cx + r * Math.cos(theta), cy + r * Math.sin(theta), side * 0.12)
}

function buildNetwork() {
  const rand = mulberry32(7)
  const scatter = Array.from({ length: COUNT }, () => new THREE.Vector3((rand() - 0.3) * 10.5, (rand() - 0.5) * 6.4, (rand() - 0.5) * 3.2))
  const target = Array.from({ length: COUNT }, (_, i) => sPoint(i / (COUNT - 1), i % 2 ? 1 : -1, new THREE.Vector3()))
  // Rotas: cada sinal se liga ao vizinho da mesma corrente e, a cada três, à outra corrente (interface entre sistemas).
  const edges: number[] = []
  for (let i = 0; i < COUNT - 2; i++) edges.push(i, i + 2)
  for (let i = 0; i < COUNT - 1; i += 3) edges.push(i, i + 1)
  const positions = new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3)
  positions.setUsage(THREE.DynamicDrawUsage)
  const halo = (() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(canvas)
  })()
  return { scatter, target, edges: new Uint16Array(edges), edgeCount: edges.length / 2, positions, halo }
}

type Net = ReturnType<typeof buildNetwork>
type Scratch = { tmp: THREE.Vector3; cold: THREE.Color; hot: THREE.Color }
type Refs = { group: THREE.Group | null; lines: THREE.LineSegments | null; lineMaterial: THREE.LineBasicMaterial | null; human: THREE.Mesh | null }

/** Passo imperativo por quadro (fora do componente: escreve direto em buffers do Three, não em estado do React). */
function step(state: RootState, delta: number, progress: number, net: Net, scratch: Scratch, refs: Refs) {
  const { tmp, cold, hot } = scratch
  const time = state.clock.elapsedTime
  const morph = smooth(0.08, 0.78, progress)
  const array = net.positions.array as Float32Array
  for (let i = 0; i < COUNT; i++) {
    tmp.copy(net.scatter[i]).lerp(net.target[i], morph)
    const drift = 0.05 * (1 - morph * 0.85)
    array[i * 3] = tmp.x + Math.sin(time * 0.6 + i) * drift
    array[i * 3 + 1] = tmp.y + Math.cos(time * 0.5 + i * 1.7) * drift
    array[i * 3 + 2] = tmp.z
  }
  net.positions.needsUpdate = true
  // Rotas nascem só quando os sinais já se aproximam (≈32%); a rede esquenta de cor ao virar sistema.
  refs.lines?.geometry.setDrawRange(0, Math.round(net.edgeCount * smooth(0.32, 0.8, progress)) * 2)
  refs.lineMaterial?.color.lerpColors(cold, hot, smooth(0.55, 0.95, progress))
  // Traço humano: o ponto Copper não é absorvido; percorre a rede e permanece identificável.
  if (refs.human) {
    const at = Math.min(COUNT - 1, Math.round(progress * (COUNT - 1)))
    refs.human.position.set(array[at * 3], array[at * 3 + 1], array[at * 3 + 2] + 0.2)
    refs.human.scale.setScalar(1 + Math.sin(time * 2.4) * 0.12)
  }
  const cam = state.camera
  cam.position.z += ((8.6 - progress * 1.6) - cam.position.z) * Math.min(1, delta * 6)
  cam.position.x += ((state.pointer.x * 0.25) - cam.position.x) * Math.min(1, delta * 3)
  cam.lookAt(0, 0, 0)
  if (refs.group) refs.group.position.x = state.size.width > 900 ? 1.9 : 0
}

function Network({ progress }: { progress: { current: number } }) {
  const group = useRef<THREE.Group>(null)
  const lines = useRef<THREE.LineSegments>(null)
  const lineMaterial = useRef<THREE.LineBasicMaterial>(null)
  const human = useRef<THREE.Mesh>(null)
  const network = useMemo(() => buildNetwork(), [])
  const scratch = useMemo<Scratch>(() => ({ tmp: new THREE.Vector3(), cold: new THREE.Color('#35566b'), hot: new THREE.Color('#70c7ff') }), [])
  useEffect(() => () => network.halo.dispose(), [network])

  useFrame((state, delta) => step(state, delta, progress.current, network, scratch, { group: group.current, lines: lines.current, lineMaterial: lineMaterial.current, human: human.current }))

  return <group ref={group}>
    <points frustumCulled={false}>
      <bufferGeometry><primitive object={network.positions} attach="attributes-position" /></bufferGeometry>
      <pointsMaterial color="#70c7ff" size={0.16} sizeAttenuation map={network.halo} alphaMap={network.halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
    <lineSegments ref={lines} frustumCulled={false}>
      <bufferGeometry><primitive object={network.positions} attach="attributes-position" /><bufferAttribute attach="index" args={[network.edges, 1]} /></bufferGeometry>
      <lineBasicMaterial ref={lineMaterial} color="#35566b" transparent opacity={0.65} depthWrite={false} />
    </lineSegments>
    <mesh ref={human} frustumCulled={false}><sphereGeometry args={[0.09, 20, 20]} /><meshBasicMaterial color="#e08b5b" /></mesh>
  </group>
}

/** Só renderiza quadros enquanto o canvas está visível e a aba está ativa. */
function useActive(target: React.RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(true)
  useEffect(() => {
    let visible = true
    const update = () => setActive(visible && document.visibilityState === 'visible')
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update() })
    if (target.current) observer.observe(target.current)
    document.addEventListener('visibilitychange', update)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [target])
  return active
}

export default function SignalFull({ progress, onReady, onFail }: { progress: { current: number }; onReady: () => void; onFail: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const active = useActive(box)
  return <div ref={box} style={{ width: '100%', height: '100%' }}>
    <Canvas className="signal-canvas" frameloop={active ? 'always' : 'never'} dpr={[1, 1.5]} camera={{ position: [0, 0, 8.6], fov: 48 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', onFail, { once: true }); onReady() }}>
      <Network progress={progress} />
    </Canvas>
  </div>
}
