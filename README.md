# Severius — site institucional

Site da Severius (estúdio de produtos digitais), tema escuro "Studio Dark".

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4 (`@tailwindcss/postcss`; tokens em `@theme` no `src/app/globals.css`)
- Fonte Barlow local (`next/font/local`, `src/app/fonts/`). Sem CDN, sem requisições a terceiros
- Testes: Vitest (lógica pura e dicionários) e Playwright (e2e contra `next build` + `next start`)

## Rotas e idiomas

| Inglês (UK), sem prefixo | Português (Brasil) |
| --- | --- |
| `/` | `/pt-br` |
| `/services` (`?tab=design\|engineering\|project-management`) | `/pt-br/services` |
| `/work`, `/work/[slug]` | `/pt-br/work`, `/pt-br/work/[slug]` |
| `/process`, `/about`, `/contact` | `/pt-br/process`, `/pt-br/about`, `/pt-br/contact` |

- As páginas ficam em `src/app/[locale]/` (`en` | `pt-br`). O `src/proxy.ts` envia visitantes do Brasil
  para `/pt-br/...` pelo header geográfico da Vercel e mantém os demais países no inglês sem prefixo.
  A escolha manual de idioma prevalece e fica salva em cookie funcional.
- O banner bilíngue registra `all` ou `essential`; atualmente o site não usa cookies de análise ou publicidade.
- Os textos ficam em dicionários tipados: `src/content/en`, `src/content/pt-br` e `src/content/types.ts`.
  Dados que não se traduzem (clientes, URLs, contato, ícones) ficam em `src/content/shared.ts`. Use
  `getDictionary(locale)` para obter os textos.
- Cada página define `<html lang>` (`en-GB` / `pt-BR`), title/description, canonical e hreflang. O
  `sitemap.xml` inclui as duas versões. O seletor de idioma com bandeiras fica no header e no menu mobile.

## Careers (standby)

`careersEnabled` em `src/lib/site.ts` (hoje `false`): `/careers` e `/pt-br/careers` respondem 404, e o
link some de header, footer, menu mobile e sitemap. O código e o conteúdo continuam no projeto; para
reativar, troque a flag para `true`.

## Movimento da home

A home é uma cena guiada pela rolagem, feita só com CSS 3D + variáveis CSS (sem three.js nem libs de animação):

1. **Hero preso** (`position: sticky`): anéis "metálicos" (`conic-gradient` + `mask`, 3 camadas em `translateZ`)
   em volta de um núcleo verde tombam em 3D e sobem; o texto sobe e esmaece.
2. **Painel de vidro** (About + "Why Choose Severius?") fica espiando no rodapé e depois sobe por cima do
   hero; o brilho do núcleo vaza borrado pelo `backdrop-filter`. Por fim, núcleo e anéis somem.
3. **ScrollStory:** a frase acende palavra a palavra, os números contam em cards com colchetes nos cantos e a
   pílula "Start Project/Iniciar projeto" passa de branco para verde.

**Como funciona o progresso:** `src/components/ScrollProgress.tsx` calcula o progresso 0→1 de cada cena (um
`requestAnimationFrame` por evento de `scroll` passivo, só enquanto a cena está na viewport via
`IntersectionObserver`) e grava variáveis CSS no elemento: `--hero-progress`, fases com easing (`--hero-tilt`,
`--hero-rise`, `--hero-fade`, `--story-progress`, `--story-cta`). As fases ficam em `HeroHome.tsx`/`ScrollStory.tsx`.
O CSS (`src/app/home-motion.css`) usa essas variáveis só em `transform`/`opacity` e liga `will-change` apenas
com a cena ativa (`[data-scene-active]`).

**Como desativar:** o sistema operacional/navegador com "reduzir movimento" (`prefers-reduced-motion: reduce`)
recebe a versão estática completa: anéis parados, painel em fluxo normal, sem sticky. Sem JS, o padrão das
variáveis também é estático e todo o conteúdo fica visível. Para desligar de vez no código, remova os
`<ScrollProgress>` de `HeroHome.tsx` e `ScrollStory.tsx`. Em telas < 768 px ou com altura < 640 px o hero não é
preso e usa menos camadas.

## Acessibilidade

Meta: WCAG 2.2 AA com reforços AAA onde é tecnicamente aplicável (não é uma declaração de conformidade AAA total).

- **Contraste AAA (1.4.6):** tokens em `src/app/globals.css`; `src/lib/contrast.test.ts` recalcula as
  razões (>= 7:1 texto normal, >= 4.5:1 texto grande), inclusive sobre o pior caso dos painéis de vidro.
  Também há suporte a `prefers-contrast: more` e `forced-colors`.
- **Movimento:** `prefers-reduced-motion` desliga fade-in, parallax do hero, ScrollStory, spotlight do
  ponteiro e transições. Sem JS, todo o conteúdo fica visível (SSR).
- **Teclado:** skip link como primeiro focável; foco visível de 2px em #9EFF00 e nunca coberto pelo header
  sticky (`scroll-padding-top`); menu mobile com foco preso, Esc e fundo `inert`; abas por setas/Home/End.
- **Alvos de toque** >= 44×44 px; reflow em 320 px e text-spacing (1.4.12) testados.
- **Formulário:** `required`, `autocomplete`, dica e erro ligados por `aria-describedby`, erro com
  `role="alert"` e foco no primeiro campo inválido, sucesso em `role="status"`.
- **Testes:** `e2e/a11y.spec.ts` (axe-core: wcag2a/aa, 21a/aa, 22aa, best-practice e `color-contrast-enhanced`
  em todas as rotas, nos 2 idiomas, em 390/1440/1920, com reduced-motion, forced-colors, menu aberto e
  formulário em erro/sucesso) e `e2e/motion-a11y.spec.ts` (foco, alvos, reflow, movimento).
  A revisão manual cobre o que o axe não verifica (1.4.8, 2.4.9, 3.1.x etc.).

## Comandos

```bash
npm install
npm run dev          # http://localhost:3000 (ou PORT=3001 npm run dev)
npm run lint
npm run typecheck
npm test             # vitest
npx playwright test  # e2e: faz build e sobe next start na porta 3117
npm run build && npm start
```

Pare o `next dev` antes de rodar `next build`: os dois compartilham a pasta `.next`.

## Deploy (Vercel)

O projeto já está ligado à Vercel (`.vercel/`); o build padrão é `next build`. Defina
`NEXT_PUBLIC_SITE_ORIGIN` (ex.: `https://severius.com`) só quando o domínio estiver aprovado. Enquanto
estiver vazio, o robots bloqueia a indexação e o canonical/sitemap usam `https://example.invalid`.
Os headers de segurança (CSP same-origin etc.) ficam no `next.config.mjs`.
# Severius-site
