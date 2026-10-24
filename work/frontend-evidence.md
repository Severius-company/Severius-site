# Evidência da implementação frontend — Severius Website

**Executor:** Frontend Engineer (célula Severius)  
**Data-base:** 2026-09-19  
**Specs:** `PD-001 v1.0`, `QA-EVIDENCE-PLAN v1.0` e `security-plan.md`  
**Estado:** fatia funcional implementada; preview/publicação permanecem sujeitos aos gates independentes.

## 1. Fonte e limites respeitados

- Fonte canônica externa: somente `/Users/walace/Desktop/workspace/Severius-company/`.
- A pasta de grafia incorreta `Serverius-company` foi explicitamente ignorada: não foi lida, copiada, sincronizada, escrita ou removida.
- As três specs de entrada em `work/product-design.md`, `work/qa-evidence-plan.md` e `work/security-plan.md` foram lidas e não foram alteradas por este executor.
- Sem deploy, domínio, serviço pago, analytics, chamada externa de produto, envio ou persistência do formulário.

## 2. Contratos implementados

| Spec / aceite | Implementação | Evidência reproduzível |
|---|---|---|
| PD §3, AC-020–024 · rotas e idiomas | `/pt-br`, `/en`, artigos equivalentes e `/` → `/pt-br`; dicionários server-side e idioma do documento atualizado por valor de allowlist | `src/app/[locale]`, `src/lib/copy.ts`, `e2e/routes.spec.ts` |
| PD §7 · Campo de Conexões | tokens Carbon/Graphite/Cloud/Ink/Ion/Copper, Recursive local, grade editorial assimétrica, sem biblioteca de componentes/Tailwind | `src/app/globals.css`; capturas em `evidence/screens/` |
| PD §8, AC-031–037 · Severius Signal | HTML/SVG estático primeiro; seleção determinística static/lite/full; R3F e GSAP sob demanda; fallback de WebGL/chunk; reduced motion; scroll nativo | `src/components/Signal*.tsx`, `src/lib/signal-mode.ts`, `e2e/motion.spec.ts`, `e2e/scroll.spec.ts`, `e2e/scrub.spec.ts` |
| AC-011–015 · conteúdo | hero, quatro grupos/16 capacidades, processo, Labs rotulados, insights e CTA sem claims comerciais inventados | `src/components/HomePage.tsx`, `src/lib/copy.ts`, `e2e/routes.spec.ts`, `e2e/seo.spec.ts` |
| AC-040–044, AC-083 · formulário | validação local, limites, normalização CRLF/domínio, allowlist de estágio, rejeição de controles, consentimento, foco no erro e resumo efêmero; nenhum `fetch`, action, storage ou cookie | `src/lib/form.ts`, `src/components/DiagnosticForm.tsx`, testes unitários e `e2e/form.spec.ts` |
| AC-050–056 · acessibilidade | skip link, foco visível contextual, trap/Esc no menu, labels/erros associados, reflow, forced colors, reduced motion | `Header.tsx`, `DiagnosticForm.tsx`, `globals.css`, `e2e/a11y.spec.ts`, `e2e/keyboard.spec.ts` |
| AC-060–066 · SEO técnico | metadata localizada, canonical/hreflang/x-default, OG, sitemap, robots noindex, JSON-LD editorial com escape de `<`, MDX local confiável | layouts/pages, `robots.ts`, `sitemap.ts`, `src/content/**/*.mdx`, `e2e/seo.spec.ts` |
| AC-080–086 · segurança | CSP e headers, sem origem externa, sem source map público, sem padrão de segredo, formulário sem transmissão | `next.config.mjs`, `e2e/security.spec.ts`, `work/appsec-review.md` |
| AC-090–093 · estados | error/not-found bilíngues; Signal estático disponível sem JS e em falha | `src/app/**/error.tsx`, `not-found.tsx`, `SignalStatic.tsx`, testes de rotas/motion |

## 3. TDD e incrementos

### Red → green: formulário

1. `src/lib/form.test.ts` foi criado antes do módulo e falhou por import inexistente.
2. `src/lib/form.ts` implementou apenas normalização, validação e resumo local.
3. Resultado final: testes de limites, controles, consentimento e ausência de campos ocultos passam.

### Red → green: modos do Signal

1. `src/lib/signal-mode.test.ts` foi criado antes do módulo e falhou por import inexistente.
2. `src/lib/signal-mode.ts` implementou a precedência `static → lite → full` conforme capacidades.
3. Resultado final: reduced motion/WebGL indisponível, viewport conservadora/save-data e modo full estão cobertos.

## 4. Dependências e decisões técnicas

- Versões confirmadas: Next 16.3.5, React 19.2.0, TypeScript 6.0.3, GSAP 3.15.0, R3F 9.7.0, Three 0.186.0.
- APIs verificadas na documentação local `node_modules/next/dist/docs/`: App Router, Server/Client Components, metadata, i18n, JSON-LD, lazy loading, MDX, CSP, Vitest e Playwright.
- `experimental.mdxRs: true` usa o compilador MDX Rust documentado do Next. Ele preserva Turbopack e evita o loader JS de MDX que, neste sandbox, tentava abrir uma porta interna e falhava com `EPERM`.
- GSAP e R3F/Three ficam restritos ao gesto principal. Reduced motion e mobile lite não requisitam Three; reduced motion não requisita GSAP.
- Recursive é local (`@fontsource-variable/recursive`): zero requisição a provedor de fonte.
- Não foi adicionada biblioteca de componentes, estado global, analytics ou backend.

## 5. Comandos e resultados finais

| Comando | Resultado |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0 — 4 arquivos, 17 testes |
| `npm run build` | exit 0 — Turbopack + `mdxRs`, 9 páginas estáticas |
| `npm audit --offline --omit=dev --audit-level=high` | exit 0 — 0 vulnerabilidades no cache local |
| `npm audit --omit=dev --audit-level=high` | não executável no sandbox: DNS externo bloqueado; nenhuma permissão de rede foi solicitada |
| `npm run test:e2e` | 211 testes Chromium, 209 passaram; 2 falharam inicialmente no perfil desktop/full por bundle webpack usado como fallback temporário |
| reteste focado desktop/full após Turbopack + `mdxRs` e redução de um chunk inicial | PT-BR passou; EN cumpriu bytes/requests/LCP/INP/CLS, mas uma de três amostras teve long task atípica de 1.416 ms (as outras: 111/116 ms), portanto o teste permaneceu vermelho, sem retry oculto |
| regressão focada de rotas/idioma | artigo EN passou após ajuste final |

O Chromium requerido pelo Playwright já estava instalado. Nada foi baixado. Firefox/WebKit não estavam instalados e não foram baixados.

## 6. Performance medida (sintética local; não é dado de campo)

Build final Turbopack, desktop/full, três amostras frias:

- JS inicial sem Three/GSAP: **165.519 B gzip** — acima da meta de 130 KiB, abaixo do teto registrado de 175 KiB (`EXC-02`, ainda pendente de aprovação).
- Chunk Three/R3F: **236.687 B gzip** — dentro de 350 KiB.
- GSAP: **27.289 B gzip**.
- Requests até LCP: **20** — dentro do limite.
- PT-BR: LCP mediano **692 ms**, INP aproximado máximo **40 ms**, CLS **0,0062**, long task máxima **166 ms** — teste passou.
- EN: LCP mediano **696 ms**, INP aproximado máximo **48 ms**, CLS **0,0185**. Duas amostras tiveram long task máxima de **111/116 ms**; uma amostra atípica teve **1.416 ms**, mantendo esse gate vermelho. Não houve retry para converter a falha em verde.

Mobile lite, reduced motion/static e mobile CPU 4× haviam passado seus perfis na rodada integral. Resultados brutos: `evidence/perf.json` e `evidence/perf-samples/`.

## 7. Limitações e riscos residuais

1. **Gate de performance desktop EN:** falha isolada de long task deve ser reproduzida em preview privado estável; não autoriza afirmar Core Web Vitals.
2. **EXC-01:** CSP precisa de decisão humana sobre `'unsafe-inline'` antes de publicar.
3. **EXC-02:** JS inicial excede 130 KiB, embora permaneça abaixo do teto de regressão e com LCP/INP sintéticos bons.
4. **EXC-03:** warning upstream R3F/Three permanece registrado.
5. Apenas Chromium foi validado; Safari/VoiceOver, Firefox e WebKit continuam pendentes.
6. `example.invalid` é placeholder deliberado. Origem/domínio real, envio, privacidade operacional, analytics e HSTS permanecem bloqueados até aprovação/configuração.
7. As evidências existentes em `evidence/e2e-report.md`/`validation.md` incluem rodadas anteriores e devem ser lidas com seus hashes/datas; este arquivo registra os comandos executados nesta implementação e o estado final observado, sem reclassificar o gate independente.

## 8. Handoff

Fatia frontend entregue para QA/AppSec/Evidence Validator. A implementação não está autorizada para publicação. O próximo gate deve usar o build Turbopack com `mdxRs`, revalidar o outlier de long task sem esconder falhas e reconciliar o bundle final com as exceções pendentes.
