# Relatório E2E — Severius Website (preview privado)

## Rodada final

**Data:** 2026-09-19 (execução E2E 08:42–08:50 UTC = 05:42–05:50 -03; reverificação independente do Evidence Validator logo depois, 05:51 em diante, -03).
**Comando:** `npm run test:e2e` (= `playwright test`, Chromium 153.0.8010.12, 1 worker, 0 retries) → **205 passed, 0 failed, 0 skipped, 0 flaky** (`evidence/results.json` → `stats`: expected 205, unexpected 0, skipped 0, flaky 0).
**Hash do conteúdo:** `05447a4807737c58` (`evidence/environment.json`, `sourceChangedDuringRun:false`). O validador **recalculou** o hash com o mesmo algoritmo de `e2e/global-setup.ts` (sha256 de `src/` + `package.json` + `package-lock.json` + `next.config.mjs` + `tsconfig.json`) antes e depois de suas verificações: `05447a4807737c58` nas duas vezes → as evidências correspondem ao código atual. Nenhum arquivo de `src/` é mais novo que `evidence/environment.json`. (O repositório ainda não tem commit.)
**Outros gates (executados pelo validador):** `npm run typecheck` exit 0 · `npm run lint` exit 0 · `npm test` exit 0 (4 arquivos, 17 testes) · `npm run build` exit 0 (9 páginas estáticas). Detalhes e saída em `evidence/validation.md`.

**Leitura obrigatória do "205/205":** o verde inclui três testes que passam **por causa de exceção registrada, não por cumprir o critério**: EXC-01 (`script-src 'unsafe-inline'`, teste `security.spec.ts` só exige que a exceção exista em `work/exceptions.md`), EXC-02 (JS inicial 167 452 B / 150 018 B > 130 KB; `perf.spec.ts` só exige ≤ 175 KB) e EXC-03 (aviso `THREE.Clock` filtrado por mensagem exata). Nenhuma das três está aprovada por humano. Só Chromium foi executado.

### Defeitos da rodada inicial — situação final

| # | Sev. | Situação | Como / onde | Evidência na rodada final |
|---|---|---|---|---|
| D1 | S1 | **resolvido** | colisão `.signal-full` → o wrapper do canvas agora é `.signal-layer` (`src/components/Signal.tsx:75`, `src/app/globals.css:14`) | `motion.spec` AC-031/033 passam; CLS medido 0,034–0,037 (era 0,54–0,57), `evidence/perf.json`; captura `evidence/screens/pt-br-1440.png` (Signal na coluna direita, h1 legível) |
| D2 | S2 | **resolvido** | timeout de 6 s (`Signal.tsx:68`) + tratamento de `webglcontextlost` (`SignalFull.tsx:61`) | `motion.spec` AC-093 5/5 |
| D3 | S2 | **exceção registrada (EXC-02), pendente de aprovação** | não corrigido: JS inicial 167 452 B (full/lite) e 150 018 B (static) vs 133 120 B (130 KB); cena 235 902 B ≤ 350 KB | `evidence/perf.json`; teste anota EXC-02 com teto 175 KB |
| D4 | S2 | **resolvido** | foco vai ao 1º campo inválido (`DiagnosticForm.tsx`, `onSubmit`) | `form.spec` AC-044 6/6 |
| D5 | S2 | **resolvido** | `--focus-light:#0a5c8a` em fundos claros (`globals.css`) | `keyboard.spec` AC-052 5/5 |
| D6 | S2 | **resolvido** | link de idioma no cabeçalho do artigo (`insights/[slug]/page.tsx`) | `routes.spec` AC-022 3/3; `curl` mostra hreflang recíproco |
| D7 | S2 | **resolvido** | `x-default` em home e artigos | `seo.spec` AC-061 8/8; `curl` das 2 páginas de artigo mostra `hrefLang="x-default"` |
| D8 | S2 | **exceção registrada (EXC-01), pendente de aprovação** | `script-src 'self' 'unsafe-inline'` mantido (build estático do Next emite scripts inline) | `curl -I /pt-br`; `security.spec` AC-082 (passa condicionado à existência da exceção) |
| D9 | S3 | **resolvido** | `og:locale` e `og:site_name` no artigo | `curl` dos 2 artigos: `og:site_name=Severius`, `og:locale=pt_BR` / `en` (ver achado novo N-1 abaixo) |
| D10 | S3 | **resolvido** | `/` virou `src/app/page.tsx` com `redirect('/pt-br')` | `curl -sI /` → 307 `location: /pt-br` **com** os 7 headers de segurança |
| D11 | S3 | **exceção registrada (EXC-03)** | aviso `THREE.Clock` do R3F 9.7 × three 0.186, upstream | `security.spec` filtra só a mensagem exata; registro diz "Aceito para prévia local" mas o cabeçalho do mesmo arquivo diz que nenhuma é aprovada (ver N-4) |
| D12 | S3 | **resolvido** | `<main id="conteudo" tabIndex={-1}>` (`HomePage.tsx:13`) | `keyboard.spec` AC-051 8/8 |
| D13 | S3 | **resolvido** | `overflow-wrap` / ajuste do h1 (`globals.css`) | `a11y.spec` AC-054 34/34 |
| D14 | S3 | **resolvido** | header `flex-wrap`, breakpoints em `em` (`@media(max-width:56.25em)`) | `a11y.spec` AC-032 29/29 |

Nenhum defeito **aberto** (sem exceção). Abertos com exceção pendente: D3, D8 (S2) e D11 (S3). Achados novos do validador (não cobertos pela suíte): ver `evidence/validation.md` §6.

### Correções AppSec (reteste independente do validador — comandos e saída em `evidence/validation.md` §2)

AS-01 (submit nativo sem `name`) verificado com JS desligado e com bundles bloqueados: URL vira `/pt-br?` / `/en?`, sem dados. AS-02 (`loading.tsx` removido): `<h1>` e `<form>` presentes no HTML, sem `$RC`/`aria-busy`/`id="S:0"`. AS-03 (`dynamicParams=false`): slug inválido → 404 e 120 URLs aleatórias não criaram arquivos (105 → 105 em `.next/server/app`).

---

## Rodada inicial (histórico)

*Conteúdo original preservado sem alterações. Os números, defeitos e decisão abaixo descrevem a rodada de 08:07–08:14 UTC (hash `bd78a9a4ed4e181d`, 178 passed / 27 failed) e foram superados pela "Rodada final" acima.*

### Relatório E2E — Severius Website (preview privado)

**Spec de referência:** `work/qa-evidence-plan.md` v1.0 (§4 critérios `AC-*`, §6 estratégia, §7 orçamento, §10.2 severidade)
**Autor:** QA & Release (célula Severius) — validação independente do executor; nenhum arquivo de produto foi alterado.
**Decisão do validador (E2E):** `corrigir` — 27 testes falham por 14 defeitos distintos do produto (nenhum S0; um S1). Preview exige zero S0/S1 abertos (§10.2).

## 1. Execução

| Item | Valor |
|---|---|
| Comando exato | `npm run test:e2e` (= `playwright test`; o `webServer` executa `npm run build && npx next start -p 3107`, `reuseExistingServer: true`) |
| Data / hora | 2026-09-19, 08:07–08:14 UTC (duração 7 min 31 s) |
| Chromium | 153.0.8010.12 (Chromium do Playwright, revisão 1243, headless; nada foi baixado) |
| Playwright / axe | @playwright/test 1.63.0 · @axe-core/playwright 4.13.0 · axe-core 4.13.0 |
| Next / React / three / gsap | Next 16.3.5 (Turbopack) · React 19.2.0 · three 0.186.0 · gsap 3.15.0 |
| Ambiente | macOS Darwin 25.6.0 arm64, Apple M4 Pro (12 núcleos, 26 GB), Node v26.8.2, `NEXT_PUBLIC_SITE_ORIGIN` não definido, 1 worker, 0 retries |
| Hash do conteúdo | `bd78a9a4ed4e181d` (sha256 de `src/` + `package.json` + lockfile + `next.config.mjs` + `tsconfig.json`; o repositório ainda não tem commit). `sourceChangedDuringRun: false` (ver `evidence/environment.json`) |
| Resultado | **205 testes: 178 passaram, 27 falharam, 0 skipped, 0 flaky** |

Por arquivo (passou/falhou): `a11y` 38/2 · `form` 20/2 · `keyboard` 9/3 · `motion` 13/2 · `perf` 2/6 · `responsive` 27/0 · `routes` 17/2 · `scroll` 4/0 · `security` 21/4 · `seo` 27/6.

Artefatos em `evidence/`: `results.json` (reporter JSON do Playwright), `environment.json`, `perf.json` + `perf-samples/`, `axe/*.json` (31 varreduras com nós/seletores), `screens/<locale>-<largura>.png` (320, 375, 390, 768, 1024, 1440 × pt-br/en), `screens/en-320-form-*.png`, `screens/pt-br-320x256-reflow400.png`, `screens/forced-colors-*.png`.

Estrutura: `playwright.config.ts`, `e2e/{helpers,global-setup,global-teardown}.ts`, `e2e/{routes,keyboard,form,motion,scroll,responsive,a11y,seo,security,perf}.spec.ts`. `npx tsc --noEmit` e `npx eslint e2e playwright.config.ts` passam sem avisos.

**Nota de revisão.** Durante meu trabalho `src/` foi editado por outro agente (a run 1 e a run 3 rodaram contra revisões diferentes). Na run 1 vi e depois vi corrigidos: conteúdo da home oculto sem JavaScript (o HTML entregava o fallback de `loading.tsx` e o conteúdo real em `<div hidden id="S:0">`), 404 sem `html[lang]` e sem localização, `og:url` do artigo herdado da home e `name=` nos campos do formulário. Esses itens não estão na lista abaixo porque os testes correspondentes passam no hash final; não foram re-triados além disso. Todos os números deste relatório são do hash `bd78a9a4ed4e181d` (última run, sem mudança durante a execução).

## 2. Critério → teste → resultado

Legenda: OK = todos os testes do critério passam; FALHA n/m = n de m passam; `NV` = não verificado (ver §5). O ID `AC-*` está no título de cada teste (`[AC-xxx]`).

| Critério | Arquivo(s) e o que é provado | Resultado |
|---|---|---|
| AC-011/012/013 CTA, estrutura, método | `routes`: CTA "Solicitar diagnóstico", 7 seções, 16 capacidades em 4 grupos, método na ordem PT/EN | OK 3/3 |
| AC-014 sem claims | `seo`: "clientes atendidos", "%", "anos de experiência", "case", "depoimento", prêmio/award/testimonial no texto visível, metadados e JSON-LD | OK 4/4 |
| AC-020 rotas | `routes`: /pt-br e /en 200, `lang` pt-BR/en, h1 e main únicos, artigos 200, `/`→307 `/pt-br` sem loop | OK 5/5 |
| AC-022 seletor de idioma | `routes`: seletor (nome acessível, hreflang, PT→EN, back/forward) passa; equivalente no artigo **falha** | FALHA 1/3 (D6) |
| AC-023 âncoras/histórico | `routes`, `keyboard`: âncoras do menu desktop e mobile, back/forward | OK 2/2 |
| AC-024 sem JS | `routes` com `javaScriptEnabled:false`: h1, CTA, 16 capacidades, método, SVG do Signal | OK 2/2 |
| AC-031/033 hero e modos | `motion`: modos full/lite/static verificados; **Signal fica na coluna e não cobre o h1 em modo full falha** | FALHA (D1); AC-033 6/7 |
| AC-032 responsividade | `responsive`: sem overflow em 320/375/390/768/1024/1440 (pt/en, home e artigos), estados de erro/sucesso EN a 320, reflow 320×256; `a11y`: texto 200% **falha** | FALHA 28/29 (D14) |
| AC-034/036/037 fallback e reduced motion | `motion`: reduce ⇒ `data-mode="static"`, sem `data-phase`, sem canvas, **nenhum chunk com three/gsap requisitado**, `scroll-behavior:auto`; lite ⇒ sem three; WebGL `getContext→null` ⇒ static e página utilizável | OK 4/4, 4/4, 4/4 |
| AC-035 scroll nativo | `scroll`: `scrollY` muda com wheel/teclado, html/body sem `overflow:hidden`/fixed/snap, nenhum listener wheel/touch não-passivo em window/document/body (ignora o interceptor do próprio Playwright), `data-phase` 0→3 em full e lite e reversível | OK 5/5 |
| AC-040/041 coleta e validação | `form`: consentimento obrigatório, contato >160 (maxlength e injeção), contexto 1500 ok / 1501 rejeitado | OK 2/2, 6/6 |
| AC-042 nenhum transporte externo | `form`: após o envio zero requisições; sessão sem não-GET, sem outra origem, sem xhr/ws; dados não vão a URL/storage/cookies; `security`: só same-origin, fontes locais, sem cookies/storage. As 2 falhas são o aviso de console THREE.Clock (D11), não rede | FALHA 10/12 |
| AC-043 estados acessíveis | `form`+`a11y`: `role=alert`, `aria-invalid`, `aria-describedby`→id do erro, `aria-live=polite`, axe nos estados erro/sucesso | OK 10/10 |
| AC-044 preservação/foco | `form`: preserva campos e correção limpa erros (passa); **foco após envio inválido falha** | FALHA 4/6 (D4) |
| AC-050/053/054/056 a11y | `a11y`: axe (wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa) em 4 páginas × desktop/mobile × padrão/reduced-motion/forced-colors, formulário (erro/sucesso), menu mobile aberto, reflow 320: **zero violações**; espaçamento de texto 390 **falha** | AC-050 26/26 · AC-053 24/24 · AC-056 30/30 · AC-054 FALHA 32/34 (D13, D14) |
| AC-051 teclado | `keyboard`: skip link é o 1º Tab, ativa `#conteudo`, Tab seguinte cai no `main`; menu mobile abre por teclado, foco entra, Tab/Shift+Tab ciclam (trap), Esc fecha e devolve o foco; `activeElement === #conteudo` **falha** | FALHA 7/8 (D12) |
| AC-052 foco visível | `keyboard`: outline computado ≠ none e não coberto em todos os elementos (pt/en) e no menu mobile (passa); **contraste do indicador ≥3:1 falha em fundo claro** | FALHA 3/5 (D5) |
| AC-060/061/062/063/064/065/066 SEO | `seo`: title/description/OG coerentes e distintos por idioma, canonical único autorreferente, hreflang pt-BR/en recíprocos, `noindex, nofollow`, robots.txt e sitemap.xml parseáveis com rotas existentes (200), JSON-LD `Organization` sem `url` sem origem aprovada e sem campos/claims, links/âncoras internos sem quebra e sem links externos; **`x-default` ausente** e **OG do artigo incompleto** falham | AC-060 7/9 (D9) · AC-061 4/8 (D7) · AC-062 5/5 · AC-063 2/2 · AC-064 6/6 · AC-065 2/2 · AC-066 4/4 |
| AC-070/071/072/073 performance | `perf` + `motion`: LCP/CLS/INP e orçamento §7 (§4 abaixo); orçamento de bytes JS e CLS do modo full **falham** | FALHA (D1, D3) |
| AC-080/081 segredos e superfície | `security`: sem padrões de segredo comuns nem `sourceMappingURL` no HTML/JS/CSS servidos; `/api*`, `/.env`, `/package.json` → 404 | OK 1/1, 1/1 |
| AC-082 headers | `security`: CSP/nosniff/referrer/X-Frame/Permissions-Policy em 4 páginas, robots, sitemap, 3 rotas 404; baseline CSP (default-src self, sem curinga/host externo/unsafe-eval em prod, frame-ancestors none…) passa; **`/` (307) sem headers** e **`script-src 'unsafe-inline'`** falham | FALHA 19/23 (D8, D10, D11) |
| AC-083 entrada hostil | `form`: `<script>`, `<img onerror>`, `<svg onload>` aparecem literais no textarea de resumo, sem execução (`window.__pwned` indefinido, nenhum dialog, nenhum nó injetado); CRLF normalizado; caractere de controle rejeitado | OK 4/4 |
| AC-086 sem PII/telemetria | `security`: sem cookies, sem storage, sem requisições externas | FALHA 8/10 (D11 apenas) |
| AC-092 not found | `routes`: `/xx`, `/pt-br/nada`, `/en/nada` → 404, mensagem legível PT+EN, `html[lang]`, links para as duas homes | OK 6/6 |
| AC-093 erro da cena | `motion`: `getContext→null` e chunk three/R3F abortado degradam para static; **falha de criação do contexto após a detecção não degrada** | FALHA 4/5 (D2) |

## 3. Defeitos (severidade §10.2)

Todos são do produto; os testes correspondentes ficaram corretos e falhando.

| # | Sev. | Critério | Defeito | Arquivo/linha | Reprodução |
|---|---|---|---|---|---|
| D1 | **S1** | AC-031/033/073 | Colisão de classe: o wrapper externo recebe `signal-${effective}`, então em modo `full` fica com a classe `signal-full`, que já existe para o wrapper interno do canvas (`position:absolute; inset:0`). O `.signal` inteiro sai da coluna do grid e cobre o hero (1440×900): o h1 se sobrepõe à lista de estados e o hero deixa de ser utilizável no desktop com WebGL. Consequência medida: **CLS 0,54–0,57** (mediana das 3 amostras, orçamento 0,10) — o deslocamento é `div.signal` indo de `x=736,w=688` para `x=0,w=1440` ao trocar de `static` para `full` na hidratação. | `src/components/Signal.tsx:65` (`signal-${effective}`) e `:68` (`className="signal-full"`); `src/app/globals.css:14` (`.signal-full{position:absolute;inset:0}`) | `npm run build && npx next start -p 3107`, abrir `/pt-br` em 1440×900 com WebGL; ou `npx playwright test -g "modo full"`. Evidência: teste `[AC-031][AC-033][AC-073] … modo full` e `evidence/perf.json`. O controle em modo static (reduced motion) passa. |
| D2 | S2 | AC-093/034 | Se `getContext('webgl')` funciona na detecção mas falha ao criar o renderer do canvas montado (perda de contexto/limite de contextos), o erro `THREE.WebGLRenderer: Error creating WebGL context.` sobe como `pageerror` não capturado: `data-mode` continua `full`, sobra um canvas em branco e a mensagem "Preparando visualização…" fica para sempre. O `SignalBoundary` não recebe o erro. | `src/components/Signal.tsx:12-17` (boundary), `:19-21` (`hasWebGL`) | Teste `[AC-093] WebGL detectado mas o contexto do canvas falha`: `addInitScript` que devolve `null` em `getContext('webgl*')` só para canvas conectado ao DOM; esperado `data-mode="static"` em 15 s, observado `full`. |
| D3 | S2 | AC-071 | JS inicial comprimido acima do orçamento §7 (≤130 KB): **167 332 B** (full/lite, sem three/R3F e sem gsap), **149 898 B** em modo static, medidos como `encodedBodySize` gzip. Chunk da cena 235 863 B (≤350 KB, ok); HTML+CSS 13,7 KB, fontes 55,9 KB, requests até o LCP 12, terceiros 0. Excesso +15% a +29%; falta justificativa/dono/plano exigido por §7. | (bundle) `npm run build`; ver `evidence/perf.json` `budgets` | `npx playwright test e2e/perf.spec.ts` |
| D4 | S2 | AC-044 | Após envio inválido o foco permanece no botão "Preparar solicitação": não vai ao primeiro campo inválido nem ao resumo de erros. | `src/components/DiagnosticForm.tsx:22` (`setErrors(result.errors)` sem mover foco) | `form.spec.ts` `[AC-044] após envio inválido…`, ambos os idiomas |
| D5 | S2 | AC-052 | Indicador de foco (`outline:2px solid var(--ion)`, #70C7FF) tem contraste **1,38–1,50:1** contra Cloud nas seções claras (link contextual "Solicitar diagnóstico", título do insight, "Ler insight"), abaixo de 3:1 (WCAG 1.4.11/2.4.11). No hero/fundos escuros é adequado. | `src/app/globals.css:9` | `keyboard.spec.ts` `[AC-052] … contraste ≥ 3:1` (mede o fundo real ao redor via `elementsFromPoint`, com a rolagem suave já estabilizada) |
| D6 | S2 | AC-022 | Páginas de artigo não têm seletor de idioma nem link para o artigo equivalente (só "Voltar aos insights"). | `src/app/[locale]/insights/[slug]/page.tsx:23` | `routes.spec.ts` `[AC-022] artigo …` (pt→en e en→pt) |
| D7 | S2 | AC-061 | `hreflang` só tem `pt-BR` e `en`; falta `x-default` em home e artigos. | `src/app/[locale]/layout.tsx:16`, `src/app/[locale]/insights/[slug]/page.tsx:16` (`alternates.languages`) | `seo.spec.ts` `[AC-061] … x-default` (4 páginas) |
| D8 | S2 | AC-082 | `script-src 'self' 'unsafe-inline'` no preview de produção; `work/security-plan.md` L134 pede nonce/hash ou exceção registrada, e não há exceção registrada. (`style-src 'unsafe-inline'` é reportado como anotação; sem `unsafe-eval`, sem curinga.) | `next.config.mjs:6` | `security.spec.ts` `[AC-082] CSP: script-src não usa 'unsafe-inline'`; `curl -sI 127.0.0.1:3107/pt-br` |
| D9 | S3 | AC-060 | Páginas de artigo emitem `og:title/description/url/type` mas não `og:locale` nem `og:site_name` (o `openGraph` do artigo substitui o do layout em vez de mesclar). | `src/app/[locale]/insights/[slug]/page.tsx:16` | `seo.spec.ts` `[AC-060] … Open Graph e idioma coerentes` (artigos) |
| D10 | S3 | AC-082 | A resposta `307` de `/` sai sem nenhum header de segurança (só `location`); `headers()` não cobre redirects de `next.config`. Impacto baixo (sem corpo). | `next.config.mjs:22-24` | `curl -sI http://127.0.0.1:3107/`; `security.spec.ts` rota `/` |
| D11 | S3 | AC-086/082 | Console em produção, modo full: `warning: THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` (R3F 9.7 com three 0.186). Não é erro de runtime, mas viola "nenhum erro de console relevante" do checklist §9.2. (O ruído "GL Driver Message … GPU stall due to ReadPixels" do driver do host é filtrado no teste.) | dependências `@react-three/fiber` ↔ `three` | `security.spec.ts` `/pt-br` e `/en` desktop |
| D12 | S3 | AC-051 | O skip link move a navegação sequencial (o próximo Tab cai dentro de `main`, teste passa), mas `document.activeElement` não vira `#conteudo` porque `main` não tem `tabindex="-1"`; leitores de tela podem não anunciar o destino. | `src/components/HomePage.tsx:13` | `keyboard.spec.ts` `[AC-051] … activeElement é o próprio #conteudo` |
| D13 | S3 | AC-054 | Com espaçamento de texto WCAG 1.4.12 (line-height 1,5, letter-spacing .12em, word-spacing .16em) o h1 do hero em 390 px estoura para 466 px de largura (`scrollWidth` 478 > 390): rolagem horizontal. | `src/app/globals.css:14` (`.hero h1`, tamanho `--step-4`) | `a11y.spec.ts` `[AC-054] /pt-br @390px: espaçamento de texto…` |
| D14 | S3 | AC-032/054 | Com fonte raiz a 200% em 1280 px o cabeçalho não colapsa (breakpoint em px, 900): `.header-actions` passa de 1280 (`scrollWidth` 1314). Aproximação de "somente texto 200%"; zoom de página a 200% não é afetado. | `src/app/globals.css:23` (`@media(max-width:900px)`) | `a11y.spec.ts` `[AC-032][AC-054] tamanho do texto 200%…` |

Observações que não geram teste falho: (a) `robots.txt` e `sitemap.xml` apontam para `https://example.invalid` (origem reservada, AC-061 aceita em teste); o sitemap lista rotas mesmo com `Disallow: /` — a decisão de omitir sitemap no preview é do dono do produto. (b) O 404 raiz é bilíngue com `lang="pt-BR"`; em `/en/nada` o idioma primário do documento é pt-BR (aceito por AC-092, registrado como S3 de coerência). (c) `loading.tsx`/`error.tsx` (AC-090/091) não puderam ser forçados por E2E (ver §5).

## 4. Performance sintética (`evidence/perf.json`)

**NÃO é dado de campo.** Build de produção local em loopback (`127.0.0.1`), Chromium headless, contexto novo por amostra (cache frio), 3 amostras por rota/perfil, sem throttle de rede e sem throttle de CPU (exceto o perfil informativo `mobile-cpu4x`, CDP `Emulation.setCPUThrottlingRate=4`). LCP via PerformanceObserver; CLS = maior janela de sessão com rolagem completa; **INP é aproximação** (Event Timing, maior duração entre interações sintéticas de teclado/clique/digitação/validação); bytes = `encodedBodySize`. Não permite afirmar p75 de LCP/INP/CLS de usuários reais.

| Perfil (pt-br; en equivalente) | Modo | LCP (ms) | CLS | INP aprox. (ms) | Maior long task (ms) | JS inicial (B) | Orçamento §7 |
|---|---|---|---|---|---|---|---|
| desktop 1440×900 | full | 48–52 | **0,544** | 32–40 | 93–124 | 167 332 (+235 863 cena, +27 289 gsap) | **falha** CLS e JS |
| mobile emulado 390×844 DPR3 | lite | 52–64 | 0 | 32–40 | 0 | 167 332 (+27 289 gsap) | **falha** JS |
| desktop + reduced motion | static | 52 | 0,019 (en 0,07) | 40 | 0 | 149 898 | **falha** JS |
| mobile, CPU 4× (informativo) | lite | 96–108 | 0 | 32–48 | ≤ 62 | 167 332 | JS (não assertado) |

Dentro do orçamento em todos os perfis: LCP ≤ 2,5 s, INP ≤ 200 ms, HTML+CSS ≤ 100 KB (13,7 KB), chunk da cena ≤ 350 KB (235,9 KB), fontes ≤ 160 KB (55,9 KB), requests até o LCP ≤ 20 (12), long task ≤ 200 ms, terceiros 0 KB, arte fallback 0 B (SVG inline). Reduced motion não carrega gsap nem three; lite não carrega three (verificado por conteúdo do script, não por nome de chunk).

## 5. Limitações e itens não verificados

- **Só Chromium.** Firefox e WebKit não estão instalados e não foram baixados; o plano §6.3 pede os três. Safari/VoiceOver (AC-055) e dispositivos físicos: **não verificado**.
- **Sem GPU real:** o WebGL do Chromium headless funciona (modo `full` foi observado e testado), mas é renderização de software; FPS, energia e pausa do canvas fora da viewport (AC-037, parte) **não verificados**.
- **AC-090/091 (loading/erro de rota) e AC-074 sob rede lenta:** não há como forçar `loading.tsx`/`error.tsx` sem alterar o produto; **não verificado**.
- **AC-001–005, 010, 015, 016, 021, 030, 045, 084, 085, 087, 094, 095:** dependem de revisão humana/inspeção de repositório, scripts (`lint`, `typecheck`, `test`) ou auditoria de dependências, fora do escopo deste E2E — **não verificado**. `npm run test:e2e` não roda lint/typecheck/unit.
- **Axe/forced-colors:** a regra `color-contrast` está desativada somente nas varreduras de `forced-colors` (o axe avalia as cores do autor, que o navegador substitui; falso positivo verificado nos `evidence/screens/forced-colors-*.png`: texto escuro sobre fundo claro do sistema). Nas demais 4 páginas × modos a regra está ativa e passa. Axe não substitui teclado/leitor de tela.
- O contraste do indicador de foco (D5) é medido por amostragem de cor de fundo próxima ao elemento; fundos com gradiente/imagem podem variar ligeiramente.
- INP/TBT são proxies sintéticos; amostras (3) são poucas para variância; `hostLoad` do momento está em `perf.json` (a máquina estava com carga alta por processos alheios).
- Sem teste de envio real (não existe), de origem canônica real (pendência humana §2.3) ou de aprovação de publicação. `example.invalid` é usado somente como origem de teste.
- Nenhuma requisição externa foi feita pelos testes e nada foi publicado.
