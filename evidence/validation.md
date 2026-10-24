# EVIDENCE_BUNDLE — Severius Website (preview privado local)

```text
EVIDENCE_BUNDLE
spec: QA-EVIDENCE-PLAN v1.0 (work/qa-evidence-plan.md), SEC-PLAN-001, SEC-REVIEW-001
revision: hash de conteúdo 05447a4807737c58 (sem commit; sha256 de src/ + package.json + package-lock.json + next.config.mjs + tsconfig.json,
          recalculado pelo validador antes e depois das verificações: idêntico ao de evidence/environment.json)
task: primeira fatia funcional do site institucional bilíngue Severius — validação da rodada final (pós-correção de D1–D14 e AS-01..03)
author: células executoras (frontend; qa-e2e para a suíte; appsec-review para a revisão de segurança)
reviewer: Evidence Validator (independente; não escreveu código, testes nem relatórios validados)
validator_decision: aprovar para preview privado local   (NÃO é aprovação de publicação nem de preview compartilhado; ver §4 e §5)
```

Data: 2026-09-19. Ambiente da reverificação: macOS Darwin 25.6.0 arm64, Node v26.8.2, Next 16.3.5 (`next start -p 3140 -H 127.0.0.1`, derrubado pela porta ao final; porta confirmada livre), Chromium do Playwright 1.63.0 (headless). Sem rede externa, sem deploy, sem `git commit`. Só `evidence/` foi escrito (mais este arquivo e `evidence/e2e-report.md`); `src/`, `e2e/`, `package.json`, `next.config.mjs` intactos (hash inalterado).

## 1. Decisão e regra aplicada (§10)

| Regra (§10.2 / pedido) | Situação medida |
|---|---|
| Zero S0 abertos | 0 |
| Zero S1 abertos | 0 (D1, o único S1, resolvido: CLS 0,034–0,037 e captura `evidence/screens/pt-br-1440.png`) |
| S2 só com exceção registrada e dono | D3 → EXC-02 e D8 → EXC-01, ambas registradas com dono, **pendentes de aprovação humana**. Nenhum S2 aberto sem registro |
| S3 com dono/decisão | D11 → EXC-03 (registrada). Achados novos N-1..N-8 (§6) são S3/baixa, com dono sugerido; alguns exigem registro em `work/exceptions.md` |
| Falha crítica / segredo / PII / transmissão externa / XSS | nenhum encontrado (ver §2 e §3) |

Decisão: **`aprovar para preview privado local`** — uso na máquina do desenvolvedor, dados sintéticos, sem hospedagem compartilhada, túnel ou divulgação de URL. As exceções pendentes e os itens NÃO VERIFICADOS abaixo continuam abertos; a aprovação técnica não autoriza publicação (AC-095). Se qualquer condição da §4 for violada (por exemplo compartilhar o preview antes de decidir o botão "Copiar resumo"), a decisão volta a `corrigir`.

## 2. Reverificação independente (comandos do validador e saída resumida)

Servidor: `npx next start -p 3140 -H 127.0.0.1` sobre o `.next` gerado pela própria suíte às 05:42 (nenhum arquivo de `src/` mais novo que `.next/BUILD_ID`); depois rodei `npm run build` de novo (exit 0) e o hash não mudou.

**(a) AS-01 — JS desligado não põe dados na URL** (script em scratchpad, Playwright `javaScriptEnabled:false` e, em separado, JS ligado com todos os `_next/static/**/*.js` abortados; preenche nome/contato/contexto com valores sintéticos, marca o consentimento e submete por Enter):

```
js-off  pt-br: h1=1 formVisible=true before=/pt-br after=/pt-br?  urlHasData=false requests-não-GET-ou-com-query: ["GET /pt-br?"]
js-off  en   : h1=1 formVisible=true before=/en    after=/en?     urlHasData=false requests: ["GET /en?"]
bundles-blocked pt-br / en: idem (/pt-br? e /en?, urlHasData=false)
```
A URL só ganha um `?` vazio; nenhum valor digitado aparece. Os inputs não têm `name=` no HTML servido (`grep` → 0 `name=` em input/textarea/select). Resultado: **AS-01 corrigido**. (Observação: com JS desligado o Playwright reportou o checkbox e o botão como "not stable" em vários cliques; contornei submetendo por teclado. Causa não investigada — ver N-8.)

**(b) AS-02 — conteúdo no HTML, sem `hidden`:** `curl -s /pt-br` e `/en`: `<h1` = 1 em cada, `<form class="diagnostic-form" …>` = 1 em cada; ocorrências de `id="S:0"`, `id="B:0"`, `$RC(`, `aria-busy` = 0. O único `hidden=""` é o `<div hidden=""><!--$--><!--/$--></div>` vazio do próprio Next (metadata), não esconde conteúdo. `loading.tsx` não existe em `src/`. **AS-02 corrigido.**

**(c) AS-03 — 404 real e sem crescimento de disco:**
```
curl -sI /pt-br/insights/slug-invalido  → HTTP/1.1 404, Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate (+ 7 headers de segurança)
/en/insights/foo → 404 · /xx/nada → 404 · /pt-br/insights/%ZZ → 500 (AS-11, já classificado Info pelo AppSec)
find .next/server/app -type f | wc -l  antes: 105 → depois de 120 URLs aleatórias (40× /pt-br/insights/rnd-*, /rnd-*, /en/rnd-*): 105
```
(Antes da correção o AppSec mediu 156 → 636 com 80 URLs.) `dynamicParams=false` presente em `src/app/[locale]/layout.tsx` e `insights/[slug]/page.tsx`; existe `src/app/not-found.tsx` raiz. **AS-03 corrigido.**

**(d) `curl -sI /`:** `HTTP/1.1 307 Temporary Redirect`, `location: /pt-br`, e os 7 headers de segurança presentes (CSP, Referrer-Policy, X-Content-Type-Options, X-Frame-Options, Permissions-Policy, COOP, CORP). `src/app/page.tsx` faz `redirect('/pt-br')`. **D10 resolvido.**

**(e) JSON-LD sem `url`:** `/pt-br` e `/en` têm 1 `<script type="application/ld+json">`; conteúdo: `{"@context":"https://schema.org","@type":"Organization","name":"Severius","description":"Consultoria de tecnologia e estúdio de software AI-native …"}` — chaves `@context,@type,name,description`; `url` ausente. O código só emite `url` se `NEXT_PUBLIC_SITE_ORIGIN` existir (`hasApprovedOrigin`). Páginas de artigo não têm JSON-LD.

**(f) `example.invalid` fora do JSON-LD:** 0 ocorrências dentro do JSON-LD em home PT/EN e artigos. Ele aparece (esperado, origem reservada do preview) em canonical, `hreflang`, `og:url`, `robots.txt` (`Sitemap:`) e `sitemap.xml` — 1 ou mais vezes por página; **não é domínio real** e o gate de publicação (G-1..G-3 do AppSec) continua pendente.

**(g) Contagens reais em `evidence/results.json`** (leitura do JSON e recontagem por teste): `stats` = `{expected:205, skipped:0, unexpected:0, flaky:0}`; recontagem por status de cada teste: `{expected:205}` → **205 passed, 0 failed, 0 skipped, 0 flaky**. Arquivos: a11y 40, form 22, keyboard 12, motion 15, perf 8, responsive 27, routes 19, scroll 4, security 25, seo 33. `evidence/perf.json` e `evidence/axe/*.json` (31 varreduras: 0 com violações, recontado por mim) e `evidence/screens/` (23 PNG) têm carimbo 05:42–05:49, isto é, da mesma execução final.
**Hash:** `evidence/environment.json` → `contentHash 05447a4807737c58`, `contentHashEnd` igual, `sourceChangedDuringRun:false`. Recalculei com o algoritmo de `e2e/global-setup.ts` (script em scratchpad): `05447a4807737c58` — **confere com o código atual** (também após meu `npm run build`).

**Perf (sintético, `perf.json`, 3 amostras/perfil; NÃO é dado de campo):** desktop full LCP 48–52 ms, CLS 0,034–0,037, INP aprox. 32–40 ms, maior long task 87–97 ms, JS inicial 167 452 B, cena 235 902 B; mobile lite LCP 48–52 ms, CLS 0, sem long task; reduced-motion static LCP 52–56 ms, CLS ≤ 0,013, JS 150 018 B; mobile CPU 4× (informativo) LCP ≤ 96 ms, long task ≤ 61 ms. Só o JS inicial excede o orçamento (§7: 130 KB = 133 120 B) → EXC-02.

### Gates de código (executados por mim)

| Comando | Resultado |
|---|---|
| `npm run typecheck` (`tsc --noEmit`) | exit 0, sem saída |
| `npm run lint` (`eslint .`) | exit 0, sem avisos |
| `npm test` (`vitest run`) | exit 0 — 4 arquivos, **17 testes passed** (copy, form, signal-mode, site) |
| `npm run build` | exit 0 — compilou, TypeScript ok, 9 páginas estáticas (`/`, `/_not-found`, `/pt-br`, `/en`, 2 artigos, `robots.txt`, `sitemap.xml`) |
| `git diff --check` | exit 0, **mas sem valor**: o repositório não tem commit, tudo é untracked. Substituído por `grep -rInE "[ \t]+$"` em `src e2e package.json next.config.mjs playwright.config.ts README.md` (exceto `.mdx`): 0 linhas |
| Varredura de segredos (regex AKIA/`sk-`/`ghp_`/chave privada/`xox`) em `src`, `e2e`, `.next/static`, `.next/server` | 0 arquivos; `.map` em `.next/static`: 0 |
| Lint/a11y suppressions | nenhum `eslint-disable`, `@ts-ignore` ou `@ts-expect-error` em `src`/`e2e`; a única desativação é `color-contrast` no axe em `forced-colors` (justificada no teste e no relatório E2E) |

**Artefatos de builds concorrentes:** nenhum `* 2.ts` em `.next/types`. Encontrei 3 diretórios vazios `.next/cache 2`, `.next/server/app 2`, `.next/server/chunks 2`; **movi** (não apaguei) para `/private/tmp/claude-501/-Users-walace-workspace-Porto-Softvaro/66342cc7-ff86-4455-ac1f-e4bfaef8b553/scratchpad/stray/`. Um novo `npm run build` não os recriou. Sinal de builds simultâneos por outros agentes: reexecutar o build de forma serial antes de qualquer gate final.

## 3. Matriz critério → evidência → status (QA plan §5)

Legenda: **VERIFICADO** · **VERIFICADO COM EXCEÇÃO REGISTRADA** (exceção pendente de aprovação humana) · **NÃO VERIFICADO** · **FALHA**. "n/m" = testes Playwright do critério (o ID `[AC-xxx]` está no título do teste em `evidence/results.json`; contagem recontada por mim). Todos os testes E2E rodaram só em **Chromium**. Nenhum critério está em **FALHA**.

| AC | Evidência | Status | Nota / limitação |
|---|---|---|---|
| AC-001 | `package.json` (scripts dev/build/lint/typecheck/test/test:e2e), `package-lock.json` (lockfileVersion 3, AppSec: `npm ci --dry-run --ignore-scripts` ok), README "Verificar"; meus exit 0 de typecheck/lint/test/build | VERIFICADO | **NÃO VERIFICADO:** instalação limpa real (`npm ci` em diretório vazio) — não executada (sem rede). Só dry-run do AppSec |
| AC-002 | `environment.json`: Next 16.3.5, React 19.2.0, three 0.186.0, gsap 3.15.0; docs locais existem em `node_modules/next/dist/docs/`; AppSec citou a doc local de CSP/SRI/nonce | VERIFICADO | Conferência sistemática "cada API usada × doc local" não foi feita por mim |
| AC-003 | Inspeção: `'use client'` só em `Header`, `DiagnosticForm`, `Signal*`, `error.tsx`; motion: reduce ⇒ nenhum chunk three/gsap, lite ⇒ sem three | VERIFICADO | Julgamento de arquitetura por leitura do código, sem métrica adicional |
| AC-004 | typecheck/lint/test/build exit 0 (meus); e2e 205/205 | VERIFICADO COM EXCEÇÃO REGISTRADA | EXC-03 (aviso `THREE.Clock` filtrado no console do modo full) |
| AC-005 | `git remote -v` vazio; nenhum arquivo de deploy/DNS na raiz; e2e: 0 requisições externas | VERIFICADO | Ausência de deploy por inspeção do diretório; não há como provar "nunca aconteceu fora dele" |
| AC-010 | `copy.ts` (promessa "Transformamos ideias e operações em software seguro, útil e preparado para evoluir.", CTA "Solicitar diagnóstico", marca Severius); captura 1440 | VERIFICADO | Comparação **completa** da copy com o brief por revisor humano não feita (§9.3 pendente) |
| AC-011 | routes 1/1 | VERIFICADO | |
| AC-012 | routes 1/1 (7 seções, 16 capacidades em 4 grupos) | VERIFICADO | |
| AC-013 | routes 1/1 (ordem Mapear→Desenhar→Construir→Evoluir, PT/EN) | VERIFICADO | |
| AC-014 | seo 4/4 (sem clientes/%/anos/case/depoimento/prêmio no texto, metadados e JSON-LD) + captura: rótulo "Severius Labs — demonstrações conceituais, não projetos de clientes" e cada demo marcada "Conceito em desenvolvimento" | VERIFICADO | Heurística por regex; ver §7 |
| AC-015 | `copy.ts` (PT L14 e EN L37): "células de agentes especializados… O fundador mantém a direção, aprova decisões críticas…", ancorado em `AGENTS.md` L11/L56 da Severius | VERIFICADO | Por inspeção de texto; não há teste automatizado dedicado |
| AC-016 | — | NÃO VERIFICADO | Originalidade vs. referências exige revisão humana; nenhuma comparação executada |
| AC-020 | routes 5/5; meu `curl -sI /` → 307 `/pt-br` sem loop; `/pt-br` e `/en` 200 | VERIFICADO | |
| AC-021 | — | NÃO VERIFICADO | Adaptação editorial EN/PT depende de revisão humana do inglês (README já lista como pendente) |
| AC-022 | routes 3/3 (seletor, hreflang, PT→EN, back/forward, equivalente no artigo) | VERIFICADO | |
| AC-023 | routes+keyboard 2/2 (âncoras desktop/mobile, histórico) | VERIFICADO | |
| AC-024 | routes 2/2 (JS off) + meu teste JS-off (h1 e formulário visíveis) | VERIFICADO | |
| AC-030 | `globals.css` `:root`: `--carbon:#0d1012 --graphite:#191e22 --cloud:#edf1f3 --ion:#70c7ff --copper:#e08b5b` (+ `--focus-light`, `--muted-*`) | VERIFICADO | Só as 5 cores conferidas byte a byte; tokens de tipografia/espaço/movimento não auditados |
| AC-031 | motion 2/2 (Signal na coluna e não cobre o h1) + `screens/pt-br-1440.png` | VERIFICADO | "Não é template SaaS/cartões repetidos" é julgamento humano |
| AC-032 | responsive+a11y 29/29 (320/375/390/768/1024/1440 PT/EN, home e artigos; texto 200%; reflow 320×256) | VERIFICADO | Zoom de página a 200% do navegador não simulado; orientação não testada |
| AC-033 | motion+scroll 7/7 (três modos e fases 0→3) | VERIFICADO | Sem gravação curta dos 3 modos; se cada modo "comunica sinais→rotas→sistemas→impacto" é revisão visual humana |
| AC-034 | motion 4/4 (`getContext→null`, chunk abortado) | VERIFICADO | GPU real não testada (WebGL de software) |
| AC-035 | scroll 5/5 (sem scroll-jacking, sem listeners wheel/touch não passivos) | VERIFICADO | |
| AC-036 | motion 4/4 (reduce ⇒ static, sem three/gsap, `scroll-behavior:auto`) | VERIFICADO | `forced-colors` testado só via axe/capturas |
| AC-037 | motion 4/4; `dpr={[1,1.5]}`, `frameloop` condicional em `SignalFull.tsx`; CLS ≤ 0,037 | NÃO VERIFICADO | **Pausa fora da viewport, FPS e energia não medidos** (só o limite de dpr e CLS têm evidência) |
| AC-040 | form 2/2; texto de consentimento/privacidade em `copy.ts` | VERIFICADO | |
| AC-041 | form 6/6 + `form.test.ts` (limites 100/160/1500, controles, CRLF, allowlist de `stage`) | NÃO VERIFICADO | **Validação no servidor não existe** (sem endpoint, por desenho — SEC-PLAN L15/L100). No cliente: verificado. O texto literal do AC pede servidor; ver N-5 |
| AC-042 | form+security 12/12 (0 requisições após envio; sem não-GET/outra origem/xhr/ws; dados fora de URL/storage/cookies) + meu teste AS-01 (URL sem dados) | VERIFICADO | |
| AC-043 | form+a11y 10/10 (`role=alert`, `aria-invalid`, `aria-describedby`, `aria-live`, axe nos estados) | VERIFICADO | Anúncio real por leitor de tela não testado (ver AC-055) |
| AC-044 | form 6/6 (preserva campos; foco no 1º campo inválido) | VERIFICADO | D4 resolvido |
| AC-045 | Limites de tamanho no código; sem envio, sem CAPTCHA/fingerprint (grep) | NÃO VERIFICADO | Limite de frequência/controle de repetição não existe e não está documentado; "repetição rápida" (§6.3 passo 6) não testada |
| AC-050 | a11y+routes 26/26 | VERIFICADO | |
| AC-051 | keyboard+a11y 8/8 (skip link, `#conteudo` recebe foco, trap do menu, Esc) | VERIFICADO | Só nas homes; páginas de artigo não têm skip link (N-6) |
| AC-052 | keyboard 5/5 (outline visível, contraste ≥ 3:1 com `--focus-light`) | VERIFICADO | Fundos com gradiente medidos por amostragem |
| AC-053 | a11y 24/24 | VERIFICADO | |
| AC-054 | a11y 34/34 (contraste, espaçamento de texto 1.4.12) | VERIFICADO | Tamanho de alvo (2.5.8) não testado explicitamente |
| AC-055 | — | NÃO VERIFICADO | VoiceOver + Safari **não executado** |
| AC-056 | a11y 30/30; recontagem: 31 JSON em `evidence/axe/`, **0 com violações** (wcag2a/aa, 21a/aa, 22aa) | VERIFICADO | Axe não substitui teclado/leitor de tela; `color-contrast` desativado só em forced-colors |
| AC-060 | seo 9/9; `curl` dos artigos: `og:site_name`, `og:locale` presentes | VERIFICADO | `og:locale` do inglês é `en`, não `en_US` (N-1) |
| AC-061 | seo 8/8; `curl`: canonical, `pt-BR`, `en`, `x-default` recíprocos nos 2 artigos | VERIFICADO | Origem é `https://example.invalid`; **origem real pendente** (bloqueia publicação) |
| AC-062 | seo 5/5; `robots.txt` `Disallow: /`; `noindex, nofollow` | VERIFICADO | O sitemap lista as 4 rotas mesmo com `Disallow: /` (aceito no preview) |
| AC-063 | seo 2/2; meu `curl` de `robots.txt` e `sitemap.xml` (4 URLs, todas existentes) | VERIFICADO | |
| AC-064 | seo 6/6; meu `curl` do JSON-LD (só `@context,@type,name,description`) | VERIFICADO | |
| AC-065 | routes 2/2; AppSec V-16 (MDX só Markdown, sem JSX/import); 1 artigo por idioma | VERIFICADO | Sem frontmatter (slug em `site.ts`); sem autor/revisão inventados |
| AC-066 | seo 4/4 (links/âncoras internos, sem links externos) | VERIFICADO | |
| AC-070 | motion 1/1 + `perf.json` (LCP = H1; three/gsap só depois) | VERIFICADO | |
| AC-071 | `perf.json` + `perf.spec.ts` | VERIFICADO COM EXCEÇÃO REGISTRADA | **EXC-02**: JS inicial 167 452 B (full/lite) e 150 018 B (static) > 133 120 B. Demais itens do §7 dentro do orçamento |
| AC-072 | `perf.json` (8 grupos × 3 amostras) | VERIFICADO | **Sintético**: loopback, sem throttle de rede, "mobile" é emulação, INP é aproximação por Event Timing; sem p75 de campo |
| AC-073 | perf+motion 10/10; CLS 0–0,037 | VERIFICADO | |
| AC-074 | `perf.json` perfil `mobile-cpu4x` (informativo, não assertado) | NÃO VERIFICADO | Rede lenta não testada; CPU 4× é só informativo |
| AC-080 | security 1/1 + meu scan de padrões (0) + `.map` = 0 | VERIFICADO | Scan por padrões conhecidos, não exaustivo |
| AC-081 | security 1/1 (`/api*`, `/.env`, `/package.json` → 404); `zod` removido (grep em `package.json`/`src`: 0) | VERIFICADO | Justificativa/licença por dependência: AppSec §3; GSAP pendente de decisão (AS-10) |
| AC-082 | security 23/23; `curl -I` (7 headers em `/`, `/pt-br`, 404, redirect) | VERIFICADO COM EXCEÇÃO REGISTRADA | **EXC-01** (`script-src 'unsafe-inline'`). Ainda abertos, Baixa: AS-05 (`data: blob:`/`worker-src blob:` mantidos em `next.config.mjs`) |
| AC-083 | form 4/4 (`<script>`, `<img onerror>`, `<svg onload>` literais; CRLF; controle rejeitado) | VERIFICADO | AS-06 aberto (Baixa): bidi U+202E, U+2028/2029 etc. **aceitos** por `form.ts` (`forbiddenControls` inalterado) |
| AC-084 | Aviso na UI ("dados permanecem no navegador e são descartados ao recarregar"); e2e: sem storage/cookies/logs | VERIFICADO | Botão "Copiar resumo" (AS-14) contradiz o texto "não … copia" do SEC-PLAN e não está registrado como exceção (N-2). Política de privacidade formal/retenção: apenas o texto de UI |
| AC-085 | AppSec §3: `npm audit` 0 vulnerabilidades (prod e dev) | NÃO VERIFICADO | **Não reproduzido por mim** (exige registry). Evidência de terceiro; `npm audit signatures` completo não concluiu (404 do registry) |
| AC-086 | security 10/10 (sem cookies, storage ou requisições externas; sem `console.*` em `src`) | VERIFICADO COM EXCEÇÃO REGISTRADA | EXC-03 (aviso do R3F) |
| AC-087 | SEC-PLAN §9 / AppSec §4: "não instrumentado" | NÃO VERIFICADO | Por definição do AC: cadeia evento→alerta→runbook não aplicável ao preview local; pendente antes da produção |
| AC-090 | — | NÃO VERIFICADO | `loading.tsx` foi removido de propósito (AS-02) e as rotas são estáticas; estado de carregamento da rota/cena nunca foi forçado em teste |
| AC-091 | Inspeção de `src/app/[locale]/error.tsx` (mensagem genérica bilíngue, botão de retry, sem `error`/digest exibidos) | NÃO VERIFICADO | Nunca forçado por teste (não dá para lançar erro sem alterar o produto); só leitura de código |
| AC-092 | routes 6/6; meus `curl`: slug inválido, `/xx/nada`, `/en/insights/foo` → 404 | VERIFICADO | 404 raiz é bilíngue com `lang="pt-BR"`; `/pt-br/insights/%ZZ` → 500 genérico (AS-11, Info) |
| AC-093 | motion 5/5 (WebGL nulo, chunk abortado, contexto que falha após detecção) | VERIFICADO | |
| AC-094 | — | NÃO VERIFICADO | Checklist §9 **não está completo**: §9.3 (revisão humana: copy, screenshots, teclado, VoiceOver, reduced motion/WebGL-off/JS-off manuais, mensagens PT/EN, segundo aprovador) e parte de §9.4 (orçamento com amostras ok; risco residual em §5) pendentes |
| AC-095 | README "Decisões humanas pendentes"; `work/exceptions.md` ("nenhuma autoriza publicar"); este documento | VERIFICADO | Gates separados: preview técnico ≠ publicação |

Resumo da matriz (64 critérios): **VERIFICADO 48** (AC-001 e outros com ressalvas descritas na coluna Nota) · **VERIFICADO COM EXCEÇÃO REGISTRADA 4** (AC-004, 071, 082, 086) · **NÃO VERIFICADO 12** (AC-016, 021, 037, 041, 045, 055, 074, 085, 087, 090, 091, 094) · **FALHA 0**. Nas linhas VERIFICADO, a coluna Nota lista o que dentro do critério não foi coberto (por exemplo instalação limpa em AC-001).

## 4. Exceções pendentes de aprovação humana (`work/exceptions.md`)

| ID | Critério | Dono | O que a decisão humana precisa escolher |
|---|---|---|---|
| EXC-01 | AC-082 CSP `script-src 'unsafe-inline'` | Fundador (decisão) · AppSec | Aceitar com HTTPS+HSTS, ou nonce via `proxy.ts` (perde SSG), ou hash por build. **Bloqueia publicação** |
| EXC-02 | AC-071 JS inicial 167 452 B / 150 018 B > 130 KB | Frontend · QA | Otimizar (análise de bundle; menu/formulário sob demanda) ou aprovar novo orçamento com base em LCP medido. Teto de regressão no teste: 175 KB |
| EXC-03 | AC-086/082 aviso `THREE.Clock` | Frontend | Upstream (R3F 9.7 × three 0.186); reverificar a cada atualização. O registro diz "Aceito para prévia local" (ver N-4) |

Registros que **recomendo criar** (não escrevi em `work/exceptions.md`; cabe ao orquestrador/AppSec): (i) botão "Copiar resumo" (AS-14/D4, Produto + Privacidade, **bloqueia preview compartilhado**); (ii) AC-041 sem validação de servidor (por desenho; deixa de valer quando houver destino do formulário); (iii) AS-05/06/07/12 (Baixa) como riscos aceitos ou corrigidos; (iv) AC-090/091 sem teste forçado.

## 5. Decisões humanas necessárias antes de publicar

1. **Domínio/origem canônica real** (`NEXT_PUBLIC_SITE_ORIGIN`), e-mail/canal de contato, HTTPS/HSTS, política de cache do HTML, hosting/DNS e o gate G-1..G-8 do AppSec (troca conjunta de `noindex`/`Disallow`).
2. **Licença do GSAP** ("Standard no charge"): ler o texto vigente e registrar aceite, ou remover GSAP (AS-10/D3). Não foi possível ler a licença sem rede.
3. **CSP `'unsafe-inline'`** (EXC-01): decidir entre aceitar, nonce ou hash.
4. **Logotipo definitivo** (hoje wordmark tipográfico provisório).
5. **Casos reais autorizados** para complementar/substituir "Severius Labs".
6. **Envio real do formulário**: destino, finalidade, retenção, acesso e descarte, validação no servidor, proteção contra abuso e nova rodada de threat model (T09–T12).
7. **Botão "Copiar resumo"** (manter com aviso de clipboard, ou remover).
8. Analytics/consentimento (não incluído), revisão humana do copy em inglês, revisão de originalidade (AC-016) e aprovação explícita de publicação.
9. Estratégia de commits/`.gitignore` de `work/` e `evidence/` (o time faz o commit; o repositório não tem histórico ainda).

## 6. Achados novos do validador (não cobertos por testes; nenhum S0/S1)

| # | Sev. | Achado | Dono sugerido |
|---|---|---|---|
| N-1 | S3 | `og:locale` das páginas em inglês é `en` (`copy.lang.replace('-','_')` com `lang:'en'`), enquanto o padrão do Open Graph é `en_US`. PT sai `pt_BR` (correto). Confirmado por `curl` no artigo EN; a home EN usa a mesma fórmula no layout | Frontend |
| N-2 | S3 (decisão) | Botão "Copiar resumo" usa a área de transferência; o SEC-PLAN §1 diz que o formulário **não copia**. Não há exceção registrada; o README não menciona o botão; o texto de UI cita "copiá-lo" mas o aviso de privacidade não fala em clipboard (AS-14 aberto) | Produto + Privacidade |
| N-3 | S3 | AppSec Baixa ainda abertas sem registro: AS-05 (`data: blob:`/`worker-src blob:` na CSP), AS-06 (bidi/separadores aceitos no formulário), AS-07 (fórmula em resumo, risco aceito só se registrado), AS-12 (`Cache-Control: s-maxage=31536000` no HTML) | Frontend · AppSec |
| N-4 | S3 (governança) | `work/exceptions.md` se contradiz: o cabeçalho afirma "Nenhuma está aprovada", mas EXC-03 está marcada "Aceito para prévia local (upstream)" sem indicar quem aceitou. Tratado aqui como **pendente** | Orquestrador |
| N-5 | S3 (adequação de teste) | O teste de EXC-01 (`security.spec.ts`) só exige o regex `EXC-01[\s\S]*Pendente de aprovação`, que casa com o "Pendente" da linha do EXC-02; ele não prova que EXC-01 continua pendente e não bloqueia se a CSP mudar para pior sem tocar em `unsafe-inline`. Igualmente, "205/205" inclui EXC-01/02/03 (ver relatório E2E). AC-041 literal (servidor) não tem teste | QA |
| N-6 | S3 | Páginas de artigo não têm skip link nem `main` focalizável (`<main className="article page-grid">` sem `id`/`tabIndex`); AC-051 foi testado só nas homes | Frontend |
| N-7 | S3 (documentação) | README diverge do código: (a) tabela "Estático" lista "impressão" como gatilho de modo, mas `signal-mode.ts` não trata impressão (só CSS `@media print` esconde a camada); (b) diz que o formulário "devolve resumo… nada foi enviado" sem citar o botão de cópia; (c) "Decisões pendentes" não lista EXC-01, EXC-02 nem a decisão do clipboard; (d) o item de `zod` do AppSec AS-09 foi resolvido (dependência removida), coerente | Frontend |
| N-8 | Info (não confirmado) | Com JS desligado, o Playwright falhou 3× em verificar estabilidade do checkbox/botão do formulário em `/en` (elemento "not stable"), embora `boundingBox` em `/pt-br` seja estável; suspeita de rolagem suave/animação CSS, **causa não investigada**. A suíte com JS ligado passa | QA |

Achados AppSec já conhecidos e reproduzidos: `/pt-br/insights/%ZZ` → 500 (AS-11, Info; retorna erro genérico).

## 7. Checagem "nada inventado"

Método (evidência textual, não prova semântica):
1. `grep -iE "[0-9]+ ?(\+|%|anos|clientes|years|clients)"` em `src/lib/copy.ts` e `src/content/**`: 0 ocorrências; `grep` de e-mails (`@`) em `copy.ts`: 0; nenhum `mailto:`/telefone (AppSec V-01: sem `mailto:`).
2. E2E AC-014 (seo, 4/4): sem "clientes atendidos", "%", "anos de experiência", "case", "depoimento", prêmio/award/testimonial no texto visível, metadados e JSON-LD.
3. JSON-LD lido por mim: só `Organization` com `name` e `description` (texto da descrição aprovada); sem `url`, e-mail, fundador, endereço, rating; sem `example.invalid`.
4. Domínio: `example.invalid` (TLD reservado RFC 2606) só como origem de preview em canonical/hreflang/og:url/sitemap/robots; `robots: noindex,nofollow` + `Disallow: /`. Não é claim público.
5. Clientes/resultados: leitura da captura de página inteira (1440): as três demonstrações ("Pulso operacional", "Brief vivo", "Conhecimento com fonte") aparecem sob "Severius Labs — demonstrações conceituais, não projetos de clientes" e cada uma rotulada "Conceito em desenvolvimento"; os "insights" planejados estão marcados "Em preparação" (só 1 artigo real por idioma).
6. Afirmações sobre o modelo AI-native ("células de agentes", "fundador mantém a direção…") conferidas contra `AGENTS.md` da Severius (L10–11, L56) e `docs/11-PROMPT-SITE-SEVERIUS.md` (L107–110).
7. Rodapé/notas da página: "Prévia privada. Nenhum formulário envia dados …" (declara o estado real).

Limitações desse método: regex e leitura parcial não provam a ausência de afirmações inventadas em cada frase (não li `copy.ts` e os MDX linha a linha); o inglês e a originalidade (AC-016/021) exigem revisão humana. Nenhuma estatística, cliente, logotipo de cliente, depoimento, e-mail ou domínio foi encontrado por esses métodos.

## 8. Limitações da validação

- **Só Chromium** (Firefox/WebKit não instalados; plano §6.3 pede os três). Safari/VoiceOver (AC-055), dispositivos físicos e GPU real: não verificados (WebGL do headless é software).
- Performance é **sintética**, em loopback, sem throttle de rede, 3 amostras; não permite afirmar p75 de LCP/INP/CLS de usuários reais. INP é aproximado.
- Instalação limpa (`npm ci`) e `npm audit` não reproduzidos por mim (sem rede); evidência do AppSec.
- `git diff --check` sem valor (repositório sem commit); a revisão de whitespace foi por `grep`.
- Nenhum teste força `loading`/`error` de rota (AC-090/091).
- Aprovação de preview técnico ≠ aprovação de conteúdo, jurídica nem de publicação (AC-095).
- Riscos residuais: EXC-01 (S2, Fundador/AppSec), EXC-02 (S2, Frontend/QA), AS-14/N-2 (S3, Produto+Privacidade), N-1/N-3/N-6/N-7 (S3, Frontend), AS-10 GSAP (decisão humana).

## 9. Reprodução

```bash
cd /Users/walace/Documents/Codex/2026-09-19/severius-website
npm run typecheck && npm run lint && npm test && npm run build
npx next start -p 3140 -H 127.0.0.1 &        # derrubar: lsof -nP -iTCP:3140 -sTCP:LISTEN -t | xargs kill
curl -sI http://127.0.0.1:3140/ ; curl -sI http://127.0.0.1:3140/pt-br/insights/slug-invalido
curl -s http://127.0.0.1:3140/pt-br | grep -c '<h1'   # e '<form', '$RC('
npm run test:e2e                                       # 205 passed; regrava evidence/*.json, perf-samples, axe, screens
```
Scripts ad hoc do validador (fora do repositório): `scratchpad/hash.mjs` (recalcula o hash), `scratchpad/as01.cjs` (AS-01 com JS off / bundles bloqueados).

---

## Nota pós-validação (autor da célula, não do validador)

Após a decisão acima, foram aplicadas correções dos achados N-1, N-2 (registro EXC-04), N-4, N-5, N-6 e N-7:
`og:locale` `pt_BR`/`en_US`, skip link e `main` focalizável nas páginas de artigo, regex por linha no teste da EXC-01,
EXC-03 marcada como pendente, EXC-04 (botão “Copiar resumo”) registrada e README alinhado ao código. O hash de conteúdo
mudou; a suíte foi reexecutada integralmente sobre o código final: **205 passed**, hash `33708f168d52c5b4`, typecheck, lint,
`npm test` (17) e `npm run build` limpos. **Esta nota não substitui uma revalidação independente** — o validador não
reexaminou estas mudanças. N-3 (achados de baixa severidade do AppSec) e N-8 continuam abertos e sem registro.
