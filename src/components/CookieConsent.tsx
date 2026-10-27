'use client'

import { useEffect, useState } from 'react'
import type { Dictionary } from '@/content/types'
import { COOKIE_CONSENT_COOKIE } from '@/lib/i18n'

type Consent = 'all' | 'essential'

export function CookieConsent({ copy }: { copy: Dictionary['cookies'] }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(!document.cookie.split('; ').some(cookie => cookie.startsWith(`${COOKIE_CONSENT_COOKIE}=`))))
    return () => cancelAnimationFrame(frame)
  }, [])

  const choose = (consent: Consent) => {
    const secure = location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${COOKIE_CONSENT_COOKIE}=${consent}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
    setVisible(false)
  }

  if (!visible) return null

  return (
    <section aria-label={copy.aria} className="fixed right-4 bottom-4 left-4 z-[80] mx-auto max-w-3xl rounded-[18px] border border-white/15 bg-[#171717]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,.55)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-white">{copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#b8b8b8]">{copy.body}</p>
        </div>
        <div className="flex flex-col gap-2 sm:min-w-48">
          <button type="button" onClick={() => choose('all')} className="min-h-11 rounded-rb bg-accent px-5 font-semibold text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            {copy.accept}
          </button>
          <button type="button" onClick={() => choose('essential')} className="min-h-11 rounded-rb border border-white/20 px-5 font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            {copy.essential}
          </button>
        </div>
      </div>
    </section>
  )
}
