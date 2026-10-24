import { NextResponse, type NextRequest } from 'next/server'

/**
 * Roteamento de idioma sem cookie nem Accept-Language:
 * - /pt-br/...            -> segue para app/[locale] com locale "pt-br"
 * - /en e /en/...         -> 308 para a URL sem prefixo (inglês é a versão canônica sem prefixo)
 * - qualquer outro caminho -> rewrite interno para /en/... (inglês)
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname === '/pt-br' || pathname.startsWith('/pt-br/')) return NextResponse.next()
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(3) || '/'
    return NextResponse.redirect(url, 308)
  }
  const url = request.nextUrl.clone()
  url.pathname = `/en${pathname === '/' ? '' : pathname}`
  url.search = search
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/|api/|robots\\.txt$|sitemap\\.xml$|icon\\.svg$|favicon\\.ico$).*)'],
}
