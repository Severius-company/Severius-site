/** Razão de contraste WCAG 2.x entre duas cores hex (#rgb ou #rrggbb). */
export function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const [r, g, b] = [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/** Mistura src (alpha) sobre dst — usado para estimar o fundo dos painéis de vidro. */
export function over(src: string, alpha: number, dst: string): string {
  const p = (hex: string) => [1, 3, 5].map(i => parseInt(hex.replace('#', '').padStart(6, '0').slice(i - 1, i + 1), 16))
  const [s, d] = [p(src), p(dst)]
  return `#${s.map((c, i) => Math.round(c * alpha + d[i] * (1 - alpha)).toString(16).padStart(2, '0')).join('')}`
}
