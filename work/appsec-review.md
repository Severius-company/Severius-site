# Revisão AppSec independente — Severius Website (prévia privada local)

**Documento:** SEC-REVIEW-001 · **Data:** 2026-09-19 · **Revisor:** Application Security + Cybersecurity/Observability (revisor independente; não escreveu o código)
**Escopo:** `severius-website` (Next.js 16.3.5, React 19.2.0, three 0.186, gsap 3.15, MDX local), build de produção (`next build` + `next start`).
**Base:** `work/security-plan.md` (SEC-PLAN-001) e `docs/08-SEGURANCA-E-CIBERSEGURANCA.md`.
**Modo:** somente leitura no projeto. Todo build/servidor/probe rodou em **clones em scratchpad** (`site2` = cópia fiel do estado revisado; `site3`/`site4` = cópias com correções experimentais só para provar as recomendações). Nada foi alterado no projeto além deste arquivo. Servidores das portas 3117/3118/3119 foram derrubados pelo PID de LISTEN ao final.

---

## 1. Veredito

**APROVADO COM RESSALVAS para preview privado local** (uso na máquina do time, dados sintéticos, sem hospedagem compartilhada).

- Nenhum achado Crítico ou Alto. Nenhum segredo, nenhuma requisição externa, nenhuma transmissão/persistência do formulário no caminho hidratado, XSS não explorável, headers presentes em todas as respostas, `npm audit` = 0 (prod e dev).
- Existem **3 ressalvas obrigatórias (R1–R3, severidade Média)** que devem ser corrigidas e re-testadas **antes de o preview sair da máquina do desenvolvedor** (hospedagem compartilhada, túnel, `next start` acessível por terceiros) ou antes de fechar o "Gate de preview privado" do SEC-PLAN §7. Cada correção foi **provada em clone** (seção 5).
- **Publicação pública continua BLOQUEADA** (decisões humanas D1–D6 e gate de release G-1..G-8 abaixo), coerente com SEC-PLAN §7.

---

## 2. Tabela de achados

Severidade: Crítica / Alta / Média / Baixa / Info. "TM" = ameaça do SEC-PLAN §3.

| ID | Sev. | Arquivo:linha | Evidência reproduzível (resumo; comandos na seção 8) | Recomendação | TM |
|---|---|---|---|---|---|
| **AS-01** (R1) | Média | `src/components/DiagnosticForm.tsx:36` (`<form … noValidate action={undefined}>` sem `method`; campos com `name=` em :38-42) | Com os bundles JS bloqueados (hidratação atrasada/falha), o `submit` é **nativo GET** e os valores vão para a URL: `http://127.0.0.1:3117/en?name=Pessoa+Sintetica&contact=pessoa%40example.com&context=Contexto+sintetico…&consent=on` (probe2/probe6). Viola a invariante do SEC-PLAN §2 ("nunca navegação com query string; valores nunca em URL"). Em navegador normal e hidratado: 0 requests novos, URL inalterada (probe1). Hoje o cenário é mascarado pelo AS-02, mas o `$RC` inline revela o formulário mesmo sem os bundles. | Remover os atributos `name` dos campos e ler os valores por `id`/refs (o submit nativo passa a gerar `/en?` sem dados). **Verificado em clone (site3):** com JS desligado e com bundles bloqueados a URL fica `/en?`; caminho hidratado segue com 0 requests e resumo exibido. Complemento opcional: só renderizar o formulário quando hidratado (`useEffect`/flag) ou `<noscript>` explicativo. | T04, T08 |
| **AS-02** (R2) | Média | `src/app/[locale]/loading.tsx` (existência) | HTML servido de `/en` contém `<template id="B:0">`, `<div hidden id="S:0">` e `$RC(` : o conteúdo real fica escondido e só é revelado por script inline; com JS desligado só aparece o fallback "Severius + barra" (captura em scratchpad `nojs.png`, probe2: `form visible = false`, `aria-busy="true"` no HTML). Falha o teste "Desabilitar JavaScript" do SEC-PLAN §6 (conteúdo/CTA legíveis sem JS). **Verificado em clone:** sem `loading.tsx`, `/en` traz `<h1>` no HTML, 0 `$RC`, 0 `aria-busy`, formulário visível sem JS. | Remover `loading.tsx` de `[locale]` (páginas são SSG; o fallback não tem função) ou movê-lo para um segmento realmente dinâmico. Re-testar com JS off. Aplicar **junto com AS-01** (ao expor o formulário sem JS, o AS-01 deixa de ser mascarado). | T06, T04 |
| **AS-03** (R3) | Média | `src/app/[locale]/layout.tsx:8`, `src/app/[locale]/insights/[slug]/page.tsx:9` (`generateStaticParams` sem `dynamicParams = false`) | (a) `GET /pt-br/insights/foo` → **HTTP 200** (soft-404: body é a página "não encontrada" via streaming; `<meta name=robots content=noindex>` presente). (b) Cada URL desconhecida **grava 4 arquivos** em `.next/server/app/…` (`foo.html/.meta/.rsc/.segments`): 80 requests únicas → `find .next/server/app -type f | wc -l` foi de 156 para 636 (~17 KB/URL, sem limite) — crescimento de disco ilimitado em `next start` (DoS por disco/inodes). (c) 404 servido com `Cache-Control: s-maxage=31536000`. (d) Path de 9000 chars gera erros `ENAMETOOLONG` no log do servidor com o path inteiro (ruído/amplificação de log). **Verificado em clone:** com `export const dynamicParams = false` nos dois arquivos → `/pt-br/insights/foo` = **404**, 40 requests desconhecidas → **0 arquivos novos**, 404 com `no-store`. | Adicionar `export const dynamicParams = false` em `[locale]/layout.tsx` e em `insights/[slug]/page.tsx`. Manter `notFound()` como defesa. | T07, T06 |
| **AS-04** | Média (defesa em profundidade; exceção a registrar) | `next.config.mjs:6` (`script-src 'self' 'unsafe-inline'`) | O build emite **16 `<script>` inline únicos por página** (`self.__next_f.push(...)`, dados RSC) — por isso `'unsafe-inline'` é necessário. Alternativas avaliadas: **(1) SRI experimental** (`experimental.sri`, doc local `content-security-policy.md` §"Subresource Integrity") gera `integrity=` só nos scripts externos; com `script-src 'self'` **quebrou**: 16 violações `script-src-elem`, formulário **não hidrata** (site4/probe3). **(2) nonce via `proxy.ts`** (doc §"Nonces"): exige renderização dinâmica por requisição (perde SSG/CDN estático) — viável para um site pequeno, mas muda a arquitetura. **(3) hash por build**: sem suporte nativo; exigiria pós-processo calculando sha256 dos 16 inline por rota e emitindo CSP por caminho na camada de hospedagem (frágil). Mitigadores presentes: zero HTML de usuário, zero terceiros, JSON-LD estático, MDX confiável. | **Não aplicar agora.** Para preview local: aceitar `'unsafe-inline'` como **exceção registrada** (D2). Antes de publicar: decidir entre nonce+dynamic (recomendado se houver requisito estrito) ou manter exceção com aceite formal. Nunca `'unsafe-eval'` em produção (não há hoje: verificado). | T01, T02 |
| AS-05 | Baixa | `next.config.mjs:7-9` | Com CSP reescrita em rota do Playwright removendo `data: blob:` de `img-src` e `worker-src 'self' blob:`, **0 violações** em `/en`, `/pt-br` (canvas WebGL ativo) e mobile 390px, com scroll (probe5). Mesmo com `style-src 'self'` (sem `'unsafe-inline'`): 0 violações nessas cargas (HTML sem `<style>`/`style=`). Não exercitado: menu móvel e foco/validação do formulário. | Remover `data: blob:` e `worker-src blob:` (SEC-PLAN §4.3 pede só se comprovadamente necessário). Testar `style-src 'self'` no e2e antes de tirar `'unsafe-inline'` de estilos. Em produção HTTPS: adicionar `upgrade-insecure-requests` e HSTS (D5). | T01, T02 |
| AS-06 | Baixa | `src/lib/form.ts:15` (`forbiddenControls`), `:54-59` (`buildRequestSummary`) | Aceitos sem erro e reproduzidos no resumo copiável: bidi **U+202E (RLO)**, isolates U+2066–2069, separadores U+2028/U+2029/U+0085, ZWSP/BOM; LF em `name`/`contact` quando injetado programaticamente (input de linha única do navegador remove LF, mas o schema não impede). Ex.: contexto `"texto ‮gpj.exe"` → `success:true` e o resumo contém o RLO (zz-probe). Rejeita corretamente NUL, ESC, DEL. Risco: spoofing de texto (Trojan-Source-like) quando o resumo é colado em e-mail/CRM por alguém; o usuário só se autoataca, salvo clipboard envenenado. | Rejeitar (`invalid`) ou remover U+202A–U+202E, U+2066–U+2069, U+2028/2029/0085 e, opcionalmente, U+200B–U+200F/U+FEFF; proibir LF/TAB em `name` e `contact`. Adicionar testes em `form.test.ts`. | T01, T08 |
| AS-07 | Baixa | `src/lib/form.ts:54-59` | Linhas do contexto iniciadas em `=`, `+`, `-`, `@` são preservadas: `"=cmd|' /C calc'!A0\n+1+1\n@SUM(1)"` (zz-probe). O resumo é texto puro para a área de transferência (não CSV), portanto sem exploração hoje; vira injeção de fórmula se alguém colar linha a linha em planilha ou se um backend futuro exportar CSV. | Registrar como risco aceito agora. Quando houver backend/exportação: neutralizar célula (prefixo `'`) na camada de exportação, não no schema. | T01 |
| AS-08 | Baixa | `src/lib/site.ts:3-6`, `layout.tsx:14`, `sitemap.ts:5`, `robots.ts:4`, `insights/[slug]/page.tsx:14` | Sem `NEXT_PUBLIC_SITE_ORIGIN`, o build emite `https://example.invalid` em **8 ocorrências por página** (canonical, `og:url`, `hreflang`, sitemap, `Sitemap:` do robots). O JSON-LD **não** afirma `url` (verificado). `.invalid` é TLD reservado (RFC 2606) — não resolve, não vaza domínio real. Fail-closed: `robots: noindex,nofollow` e `Disallow: /` são fixos. Erro correlato: a página de insight herda `og:url = …/pt-br` do layout (deveria ser a URL do artigo). A variável é embutida **em tempo de build**. | Ver gate G-1..G-3. Corrigir `openGraph.url` em `generateMetadata` do insight. Centralizar em um único `SITE_MODE` (`preview`\|`public`) que controla robots, noindex, origin e sitemap. | T13 |
| AS-09 | Baixa | `package.json:20` (`zod`) | `zod` está declarado e **não é importado** em `src/`, `*.mjs`, `*.mts` (grep). README o chama de "reservado". SEC-PLAN §4.5: só dependências justificadas. Ranges `^` em todas as deps diretas (o lockfile fixa versões e todos os 650 pacotes vêm de `registry.npmjs.org` com `integrity`). | Remover `zod` até haver backend. Usar `npm ci` (não `npm install`) em CI/gates; considerar pinagem exata das diretas de runtime (`next`, `react`, `three`, `gsap`). | T02 |
| AS-10 | Info (decisão) | `package.json:14` (`gsap`) | Licença declarada: `Standard 'no charge' license: https://gsap.com/standard-license` (README do pacote). **Não foi possível ler o texto atual da licença (sem rede além do registry).** Pelo meu conhecimento (não verificado aqui): uso comercial gratuito é permitido, com restrição para uso dentro de ferramentas/produtos que permitam a terceiros criar animações no estilo *visual builder*/concorrer com o Webflow, e sem redistribuição de código modificado sob outra licença. Uso no site institucional (ScrollTrigger no hero) tende a ser enquadrável. | **Decisão humana D3:** confirmar o texto vigente em gsap.com/standard-license e registrar aceite. Alternativa sem licença própria: remover GSAP (o mapeamento scroll→fase pode usar `IntersectionObserver`/CSS `animation-timeline`). | T02 |
| AS-11 | Info | — | `/pt-br/insights/%ZZ` → 500 com corpo genérico `Internal Server Error` (21 bytes, sem stack; ideal seria 400). `POST /en` → 200 (página estática ignora corpo; nada refletido). `/EN` e `/pt-BR` respondem 200 (roteamento case-insensitive do Next; canonical sempre minúsculo). `OPTIONS` → 400; sem `Access-Control-*`; sem `X-Powered-By`/`Server`. | Nenhuma ação necessária para o preview. | T07 |
| AS-12 | Baixa | `next.config.mjs:26-38` | HTML SSG sai com `Cache-Control: s-maxage=31536000` (sem `max-age`/`must-revalidate`); assets com hash: `public, max-age=31536000, immutable` (correto). Um CDN reteria HTML por 1 ano até purge. | Definir a política de cache no deploy (D5); HTML com `s-maxage` curto/revalidação ou deploy-scoped. | — |
| AS-13 | Baixa | `.gitignore` | `tsconfig.tsbuildinfo` (320 KB, artefato de build com caminhos locais) **não** está ignorado e aparece como untracked; o repositório ainda não tem commits (`git ls-files` = 0). `.env*` e `.next/` estão ignorados (`git check-ignore` confirmado); `.env.example` só tem comentário. | Adicionar `*.tsbuildinfo` ao `.gitignore`; decidir se `work/` e `evidence/` entram no repositório (D6). | T03 |
| AS-14 | Baixa (decisão) | `DiagnosticForm.tsx:25-28` | SEC-PLAN §2 diz "não envia, persiste, **copia**, registra". A implementação oferece **botão explícito "Copiar resumo"** (`navigator.clipboard.writeText`, exige gesto do usuário; falha tratada). É uma ação do usuário, não automática; o texto de consentimento fala em "resumo local". Dados na área de transferência escapam do controle da página (gerenciadores de clipboard). | **Decisão D4:** aceitar e documentar como exceção ao texto do plano, ou remover. Se mantido, o aviso de privacidade deve citar a área de transferência. | T12 |

### Itens verificados e corretos (sem achado)

| # | Verificação | Resultado / evidência |
|---|---|---|
| V-01 | Sem transmissão no formulário | `grep` em `src/`: nenhum `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, `use server`, `mailto:`. Probe1 (Chromium, hidratado): 0 requests após submit; URL inalterada (`/en`). |
| V-02 | Sem persistência | `grep`: nenhum `localStorage`/`sessionStorage`/`indexedDB`/`document.cookie`. Probe1: storage/cookies/IndexedDB inalterados antes×depois do submit; `ctx.cookies()` = 0; nenhum `Set-Cookie` em nenhuma resposta. |
| V-03 | Saída segura | React escapa valores; o resumo é `<textarea readOnly value>`; nenhum `dangerouslySetInnerHTML` além do JSON-LD. Payload hostil `<img onerror>`, `<script>`, `"><svg onload>` no contexto: `window.__pwn` = null, 0 nós injetados, 0 violações CSP (probe1). |
| V-04 | Limites de tamanho | `form.ts:36,39,42` nome ≤100, contato ≤160, contexto ≤1500 (teste: 100/160 ok, 101/161 erro); `maxLength` 101/161/1501 no DOM permite detectar excesso. Obs.: contagem em unidades UTF-16 (750 emojis = 1500 aceitos; 751 rejeitado) — só diverge da mensagem "1.500 caracteres" para emoji. |
| V-05 | Caracteres de controle | NUL, ESC, DEL → `invalid`; CRLF/CR normalizados para LF; `stage` fora da allowlist → `invalid`. |
| V-06 | Logs/erros | `grep console.` em `src/`: nenhuma ocorrência. `error.tsx` recebe `error` mas **não o usa nem exibe** (apenas texto genérico + "Tentar novamente"); `not-found.tsx` usa `localeFromPath` (allowlist `en`/`pt-br`), sem refletir a URL. Log do servidor só tem mensagens do Next (sem valores de campo, pois nada é enviado). |
| V-07 | JSON-LD (item 2) | `page.tsx:10` usa `JSON.stringify(...).replace(/</g,'\\u003c')` sobre objeto construído só de constantes editoriais (`copy[locale]`), sem entrada de usuário. **Teste** `jsonld-test.cjs` (jsdom, `runScripts: 'dangerously'`) com 8 payloads (`</script><script>`, `</SCRIPT >`, `<!--<script>`, `<!-- <script>`, U+2028/2029, NUL+`</script`, quebra de string, `\"</script>`): todos `OK` — 1 único `<script>`, 0 `<img>`, `pwn` indefinido, JSON round-trip idêntico, nenhum `<` cru. `<!--` e `</script` ficam neutros porque todo `<` vira `<`. U+2028/2029 permanecem literais na saída, mas em `type="application/ld+json"` não são analisados como JS e são JSON válido → **escape suficiente**. Ressalva de manutenção: se algum dia entrar dado de usuário, o padrão continua seguro; `&`/`>` não precisam de escape aqui. |
| V-08 | Headers (item 3) | `curl -I` no build de produção: **mesmos 7 headers** (CSP, Referrer-Policy, XCTO, XFO DENY, Permissions-Policy, COOP same-origin, CORP same-origin) em `/pt-br`, `/en`, `/pt-br/insights/…`, `/robots.txt`, `/sitemap.xml`, 404 de página (`/nope`, `/xx`) e 404 de asset `/_next/static/chunks/nope.js`; assets JS/woff2 com COOP/CORP e `immutable`. Sem `unsafe-eval` na CSP de produção; `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `connect-src 'self'`. Ausentes (esperado em HTTP local): HSTS. |
| V-09 | Clickjacking (item 6) | Página em origem `http://attacker.test` (rota do Playwright) com `<iframe src=http://127.0.0.1:3117/en>`: o frame fica em `chrome-error://chromewebdata/` (bloqueado; probe4). |
| V-10 | Redirecionamentos | `/` → **307** `Location: /pt-br` (relativo). `//evil.com` → 308 `/evil.com` (mesma origem, cai em 404); `/\evil.com` → 308 `/evil.com`; `?next=//evil.com` ignorado. Com `Host: evil.example` e `X-Forwarded-Host: evil.example` o `Location` continua relativo (sem open redirect/host injection). |
| V-11 | Rotas dinâmicas maliciosas (item 6) | Valores testados em `[locale]` e `[slug]`: `../`, `..%2f..%2fetc%2fpasswd`, `%2e%2e/`, `%00`, `%E2%80%AE` (RLO), `%3C%2Fscript%3E%22%5C%E2%80%A8`, `%2f%2fevil.com`, 9000 caracteres. Nenhum caminho de leitura de arquivo (`etc/passwd` nunca refletido; nomes de cache ficam percent-encoded, ex. `%2F%2Fevil.com.html`). Entrada só aparece **percent-encoded dentro do payload RSC JSON** (`"slug","%3C%2Fscript%3E…"`), nunca como HTML cru (`<img src=x` = 0). Status: locale inválido → 404; **slug inválido → 200 soft-404 (ver AS-03)**. |
| V-12 | Zero requisição externa (item 5) | Chromium real (probe1): 19 requests na carga, **origins = ["http://127.0.0.1:3117"]**; JS + CSS + `recursive-latin-wght-normal.woff2` locais; nenhuma fonte remota. `performance.getEntriesByType('resource')` idem (11 entradas, 1 origin). Sem Service Worker, sem cookies. URLs `https://` nos chunks são strings de bibliotecas (w3.org, react.dev, nextjs.org docs, gsap.com) — não são requisições. |
| V-13 | Build sem segredo/mapas | `.next/static`: **0** `.map`; regex de chaves (AKIA, `sk-`, `ghp_`, `xox`, chaves privadas) = 0 em `.next/static` e `.next/server`; `example.invalid` não está em nenhum JS de cliente; grep de `secret|token|password|api_key` em `src/` = 0. `poweredByHeader:false` confirmado (sem `X-Powered-By`). |
| V-14 | CSP × WebGL | Sem violações no Chromium com a cena WebGL ativa (`canvas` presente em desktop; ausente em 390px por modo leve, como projetado). Avisos de console: `THREE.Clock deprecated` e "GPU stall due to ReadPixels" (informativos; não são erro de segurança). |
| V-15 | Privacidade/indexação | `robots.txt`: `User-Agent: *`/`Disallow: /`; toda página tem `<meta name="robots" content="noindex, nofollow">` (inclusive 404 e insight); JSON-LD sem `url` sem origem aprovada. Atenção: `Disallow: /` impede o crawler de ler o `noindex` — aceitável no preview; na publicação os dois devem ser alterados juntos (G-3). |
| V-16 | MDX | `mdx-components.tsx` não expõe componentes; os dois `.mdx` só têm Markdown (títulos/parágrafos), sem JSX/import/export. Conteúdo só do repositório (hipótese do SEC-PLAN §2 confirmada). |

---

## 3. Cadeia de suprimentos (item 4)

| Verificação | Resultado |
|---|---|
| `npm audit` (todas as deps) e `npm audit --omit=dev` | **0 vulnerabilidades** (info/low/moderate/high/critical = 0). Árvore: prod 154, dev 460, optional 91, total 650. |
| `npm audit signatures --omit=dev` | 158 pacotes com assinatura de registry verificada; 26 com attestations. |
| `npm audit signatures` (árvore completa) | **Não concluído**: erro 404 do registry em `/-/npm/v1/attestations/whatwg-url@17.1.1` (falha do endpoint de attestations, reproduzida 2×). Tratar como "não verificado" para deps de dev. |
| Lockfile | `lockfileVersion 3`, 651 entradas, **650 resolvidas em `registry.npmjs.org`**, 0 sem `integrity`, 0 dependências git/URL, `npm ci --dry-run --ignore-scripts` OK. |
| Scripts de instalação | Apenas 2 pacotes com `hasInstallScript`: **`fsevents@2.3.3`** (opcional, macOS; sem script `install` no manifesto — só `binding.gyp`, binário pré-compilado) e **`unrs-resolver@1.12.2`** (dev; via `eslint-config-next → eslint-import-resolver-typescript`; `postinstall: node postinstall.js` → `napi-postinstall`, que **só baixa o binding do registry npm se o binário opcional faltar**, podendo executar `npm install`). Nenhum dos dois está no bundle de produção. |
| Diretas de runtime × justificativa | `next`, `react`, `react-dom` (app); `three` + `@react-three/fiber` (só `SignalFull`); `gsap` (só `Signal`, import dinâmico); `@next/mdx` (config) + `@mdx-js/loader`/`@mdx-js/react` (peers do `@next/mdx`; nenhum importado diretamente); `@fontsource-variable/recursive` (layout); **`zod` sem uso (AS-09)**. Dev: vitest/RTL/jsdom/playwright/axe/eslint/typescript — coerentes com README. |
| Ranges | Todas com `^`; versões resolvidas fixas no lock (next 16.3.5, react 19.2.0, three 0.186.0, gsap 3.15.0, zod 4.6.5). `npm outdated`: `react`/`react-dom` 19.2.0 → 19.3.0 disponível (não atualizar durante o gate; triar depois). |
| Licenças (árvore de produção, 158 pacotes) | 139 MIT, 8 Apache-2.0, 3 ISC, 3 BSD-3-Clause, 1 0BSD (`tslib`), 1 CC-BY-4.0 (`caniuse-lite`, dado), 1 OFL-1.1 (**Recursive** — fonte local, permite uso/embed/redistribuição com o texto da licença; requer manter aviso de copyright/licença junto à fonte se redistribuída), 1 **LGPL-3.0-or-later** (`@img/sharp-libvips-darwin-arm64`, binário nativo opcional do `sharp`, dependência de `next` para `next/image`; **não usado** por este site e não vai ao bundle; relevante só se o deploy empacotar `node_modules` — informar jurídico), 1 **GSAP "Standard no charge"** (AS-10). `three`, `@react-three/fiber`, `zod`, `next`, `react`: MIT. |

---

## 4. Observabilidade proporcional (item 7)

**Existe hoje:** `error.tsx` (mensagem genérica bilíngue + `reset`, sem `console`, sem digest exibido), `not-found.tsx` (allowlist de locale), `SignalBoundary` que devolve ao fallback estático sem laço de erro, erros de servidor do Next em stdout (sem PII, pois nenhum dado chega ao servidor). Não há telemetria, analytics, Sentry, session replay, CSP reporting, cookie nem `console.*`.

**Estado correto a declarar:** "**não instrumentado por ausência de coleta/backend aprovado**" (SEC-PLAN §9). Monitoramento/alerta **não validado** — não deve ser descrito como "pronto".

**NÃO adicionar sem decisão humana e novo gate:** analytics/pixels/replay; Sentry ou qualquer captura de erro de cliente (envia stack/URL/breadcrumbs a terceiro e pode carregar valores do formulário nos breadcrumbs); `report-uri`/`report-to` externo da CSP; `console.log` de dados de formulário; qualquer `fetch`/Server Action; source maps públicos. Se aprovados no futuro: `request_id` opaco, allowlist de campos, redação antes de serializar, retenção curta, dono/canal/SLA/runbook por alerta e teste ponta a ponta (SEC-PLAN §5).

**Recomendação leve (opcional, sem coleta):** nenhum ajuste; manter mensagens de erro genéricas.

---

## 5. Correções experimentais provadas (clones; nada aplicado ao projeto)

| Correção | Onde provada | Resultado |
|---|---|---|
| Remover `loading.tsx` + `dynamicParams=false` (layout e insight) | `site3` | `/en` sem `$RC`/`hidden`; formulário visível sem JS; `/pt-br/insights/foo` 404; 404 de `/rndN`; 40 URLs aleatórias → 0 arquivos novos no cache; 404 com `no-store`. |
| Formulário sem `name=` e leitura por `id` | `site3` | JS off: URL `/en?`; bundles bloqueados: `/en?`; hidratado: resumo exibido, 0 requests, URL `/en`. |
| `experimental.sri` + `script-src 'self'` | `site4` | **Não funciona** neste app (16 scripts inline bloqueados, sem hidratação) — evidência para AS-04. |
| CSP sem `data: blob:`/`worker-src`, e sem `'unsafe-inline'` em `style-src` | site3 + rota Playwright | 0 violações nas 3 cargas testadas. |

---

## 6. Decisões humanas pendentes

| ID | Decisão | Dono sugerido | Bloqueia |
|---|---|---|---|
| D1 | Aprovar/rejeitar correções R1–R3 (AS-01/02/03) antes de compartilhar o preview | Frontend + Produto | Sair da máquina local |
| D2 | Aceitar formalmente `'unsafe-inline'` em `script-src` (exceção registrada) **ou** migrar para nonce + renderização dinâmica (`proxy.ts`) | Responsável de segurança + Arquitetura | Publicação |
| D3 | Licença GSAP "Standard no charge": ler texto vigente, registrar aceite; ou remover GSAP | Jurídico/Produto | Publicação |
| D4 | Botão "Copiar resumo": manter (exceção ao SEC-PLAN §2, com aviso de privacidade citando clipboard) ou remover | Produto + Privacidade | Preview compartilhado |
| D5 | Domínio, HTTPS, HSTS (`includeSubDomains`/preload), política de cache do HTML, provedor/hospedagem, acesso restrito ao preview | Responsável humano autorizado | Publicação |
| D6 | O que entra no repositório (`work/`, `evidence/`, `*.tsbuildinfo`), estratégia de commits (regra do time: commit feito pelo usuário) | Time | Primeiro commit |
| D7 | Adotar `npm ci --ignore-scripts` + allowlist de scripts e pinagem exata das deps de runtime | Engenharia | Publicação |

---

## 7. Gate de Segurança para release privado

### Bloqueantes (para fechar o Gate de preview privado do SEC-PLAN §7 antes de compartilhar fora da máquina local)

| ID | Item | Sev. | TM |
|---|---|---|---|
| B-1 | AS-01: submit nativo pré-hidratação leva dados à URL | Média | T04/T08 |
| B-2 | AS-02: sem JS/pré-hidratação só aparece o fallback (teste "JS off" do plano falha) | Média | T06/T04 |
| B-3 | AS-03: `dynamicParams` — crescimento ilimitado de disco, soft-404 200, 404 cacheável | Média | T07 |
| B-4 | Re-teste independente dos B-1..B-3 (JS off, bundles bloqueados, 100 URLs aleatórias, `curl -I` em 404) | — | — |

### Recomendações (não bloqueiam o preview local)

AS-05 (endurecer CSP), AS-06 (bidi/separadores), AS-07 (fórmula, registrar), AS-08 (og:url do insight + `SITE_MODE`), AS-09 (remover `zod`), AS-12 (cache), AS-13 (`.gitignore`), AS-14 (decisão do clipboard).

### Bloqueantes adicionais para **publicação** (gate G)

| ID | Gate de release (script único `scripts/release-gate.mjs`, executado no CI e localmente antes do deploy) |
|---|---|
| G-1 | `NEXT_PUBLIC_SITE_ORIGIN` **definida**, `https:`, host não `.invalid`/`localhost`/IP e igual ao domínio aprovado (D5); falha se ausente. |
| G-2 | Após `next build`: `grep` falha se `example.invalid` ou `localhost` aparecer em `.next/server/app/**/*.{html,rsc}`, `robots.txt`, `sitemap.xml`, `og:url`, canonical, `hreflang`, JSON-LD. |
| G-3 | Coerência de modo: em `preview` exigir `noindex` + `Disallow: /`; em `public` exigir o **oposto** e revisão humana explícita (um único `SITE_MODE`; hoje ambos estão fixos e precisariam de duas edições silenciosas). |
| G-4 | `npm ci --ignore-scripts`, `npm audit --omit=dev` (0 high/critical), `npm audit signatures --omit=dev`, lock sem URLs fora de `registry.npmjs.org`. |
| G-5 | `curl -I` em `/`, `/pt-br`, `/en`, artigo, `/robots.txt`, `/sitemap.xml`, 404 e um asset: 7 headers presentes; sem `unsafe-eval`; HSTS presente em HTTPS. |
| G-6 | E2E: 0 requests externos, 0 mudança de storage/cookies, 0 violações CSP, JS off legível, `/x` e slug inválido → **404 real**. |
| G-7 | Scanner de segredos no fonte e em `.next` (incluir ausência de `.map`). |
| G-8 | Aceites humanos D2, D3, D5 assinados; se houver backend/analytics: reabrir threat model (T09–T12) antes. |

**Risco de esquecer (AS-08):** publicar sem `NEXT_PUBLIC_SITE_ORIGIN` produz canonical/`og:url`/`hreflang`/sitemap apontando para `https://example.invalid` (SEO quebrado, compartilhamentos com URL morta, afirmação pública de um domínio inexistente); publicar **com** a origem mas esquecendo `noindex`/`Disallow` deixa o site fora dos buscadores sem aviso; o inverso (remover noindex sem revisão) indexaria conteúdo de preview. O G-1..G-3 transforma isso em falha de build.

---

## 8. Comandos exatos usados

Ambiente: macOS, Node 26.8.2, npm/Next 16.3.5. `S=/private/tmp/claude-501/-Users-walace-workspace-Porto-Softvaro/66342cc7-ff86-4455-ac1f-e4bfaef8b553/scratchpad`.

```bash
# clone fiel (APFS clone) e build de produção — projeto original intocado
cd $S && cp -cR /Users/walace/Documents/Codex/2026-09-19/severius-website site2 && cd site2 && mv .next .next-old && npx next build
(npx next start -p 3117 -H 127.0.0.1 > ../next3117.log 2>&1 &)

# headers (item 3) e rotas/redirects (itens 3, 6)
for p in / /pt-br /en /robots.txt /sitemap.xml /pt-br/insights/como-tirar-uma-ideia-do-campo-da-incerteza /nope /xx /pt-br/insights/foo; do curl -sI http://127.0.0.1:3117$p; done
curl -s -o out.html -w "%{http_code}" --path-as-is "http://127.0.0.1:3117/pt-br/insights/..%2f..%2fetc%2fpasswd"   # e demais payloads da seção V-11
curl -s -o /dev/null -D - -H 'Host: evil.example' http://127.0.0.1:3117/
curl -s -o /dev/null -D - -H 'X-Forwarded-Host: evil.example' http://127.0.0.1:3117/
curl -s -X POST -o /dev/null -w "%{http_code}" http://127.0.0.1:3117/en -d 'name=x'

# AS-03: crescimento do cache em disco
find .next/server/app -type f | wc -l      # antes: 156
for i in $(seq 1 40); do curl -s -o /dev/null http://127.0.0.1:3117/pt-br/insights/rand$i; curl -s -o /dev/null http://127.0.0.1:3117/rnd$i; done
find .next/server/app -type f | wc -l      # depois: 636

# HTML/metadados/inline scripts/artefatos de build
curl -s http://127.0.0.1:3117/en -o en.html; grep -o -E 'id="S:[0-9]+"|\$RC\(|<template[^>]*>' en.html
grep -o -E '<link rel="canonical"[^>]*>|<meta property="og:url"[^>]*>|<meta name="robots"[^>]*>' page.html
find .next/static -name '*.map' | wc -l
grep -rlE "AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY|xox[bp]-" .next/static .next/server

# JSON-LD (item 2), form (item 1) — scripts em scratchpad, não no projeto
node jsonld-test.cjs                                   # jsdom, 8 payloads, exit=0
npx vitest run src/lib/zz-probe.test.ts --reporter=verbose --silent=false   # limites/bidi/controle/fórmula
# Chromium real (playwright-core do projeto): carga, origens, storage, CSP, submit hostil, JS off, iframe cross-origin
node appsec-probe.cjs; node appsec-probe2.cjs; node site3/probe4.cjs   # iframe via page.route em http://attacker.test

# clones com correções experimentais (nada aplicado ao projeto)
cp -cR site2 site3   # sem loading.tsx; dynamicParams=false; DiagnosticForm sem name=; portas 3117
cp -cR site3 site4   # experimental.sri + script-src 'self'; porta 3118
node site3/probe5.cjs   # CSP reescrita (sem data:/blob:/worker-src; sem 'unsafe-inline' em style-src)
node site3/probe6.cjs   # submit com JS off / bundles bloqueados / hidratado

# supply chain (item 4)
npm audit --omit=dev; npm audit; npm audit --json
npm audit signatures --omit=dev; npm audit signatures
npm ci --dry-run --ignore-scripts; npm outdated; npm ls unrs-resolver; npm ls --omit=dev --all --parseable
python3 (leitura do package-lock.json: hosts, integrity, hasInstallScript, git deps)
node -p "require('./node_modules/<pkg>/package.json').license"   # por dependência

# encerramento: cada servidor derrubado pelo PID de LISTEN
lsof -nP -iTCP:3117 -sTCP:LISTEN -t | xargs kill   # idem 3118 e 3119; portas confirmadas livres
```

Limitações: sem rede externa além do registry (texto da licença GSAP não lido — AS-10); teste em Chromium (Playwright); WebKit/Firefox não exercitados; `npm audit signatures` completo não concluiu por 404 do registry; menu móvel/foco não testados sob CSP mais estrita; navegação entre locales via RSC prefetch (`?_rsc=`) observada só como same-origin 200.
