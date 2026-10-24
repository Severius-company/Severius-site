/** kebab-case ASCII: "Dream Homes Realty" -> "dream-homes-realty". */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function initials(name: string): string {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2)
}
