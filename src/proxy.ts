import { NextResponse, type NextRequest } from 'next/server'
import { LOCALE_COOKIE } from '@/lib/i18n'

/**
 * Roteamento de idioma por escolha explícita ou país informado pela Vercel:
 * - /pt-br/...            -> segue para app/[locale] com locale "pt-br"
 * - /en e /en/...         -> 308 para a URL sem prefixo (inglês é a versão canônica sem prefixo)
 * - Brasil sem preferência -> redireciona para /pt-br/...
 * - demais países          -> rewrite interno para /en/... (inglês)
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname === '/pt-br' || pathname.startsWith('/pt-br/')) return NextResponse.next()
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(3) || '/'
    return NextResponse.redirect(url, 308)
  }

  const preference = request.cookies.get(LOCALE_COOKIE)?.value
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase()
  if (preference === 'pt-br' || (preference !== 'en' && country === 'BR')) {
    const url = request.nextUrl.clone()
    url.pathname = `/pt-br${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  const url = request.nextUrl.clone()
  url.pathname = `/en${pathname === '/' ? '' : pathname}`
  url.search = search
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/|api/|robots\\.txt$|sitemap\\.xml$|icon\\.svg$|favicon\\.ico$).*)'],
}
