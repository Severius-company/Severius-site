# Severius Website

Site institucional bilíngue (PT-BR fonte editorial · inglês adaptado) da Severius — consultoria de tecnologia e
estúdio de software AI-native. **Primeira fatia funcional: prévia privada local. Nada foi publicado.**

Direção visual aprovada: **Campo de Conexões** (charcoal, tecnológico, editorial) com a assinatura
**Severius Signal**. Fontes de verdade: `Severius-company/docs/*` (visão, catálogo, segurança, conceito e prompt do site).

## Executar

```bash
npm install
npm run dev            # http://localhost:3000  (/ redireciona para /pt-br)
npm run build && npm start
```

## Verificar (reprodutível)

| Gate | Comando |
| --- | --- |
| Tipos | `npm run typecheck` |
| Lint | `npm run lint` |
| Unidade/contrato | `npm test` |
| Build de produção | `npm run build` |
| E2E, a11y, SEO, headers, performance | `npm run test:e2e` |

Evidências em `evidence/` e critérios de aceite/matriz em `work/qa-evidence-plan.md`. Revisão AppSec em `work/appsec-review.md`.

## Stack e justificativa (arquitetura mínima)

| Dependência | Por quê | Onde |
| --- | --- | --- |
| Next.js 16 (App Router) + React 19 + TypeScript 6 | rotas `/pt-br` e `/en` estáticas (SSG), metadata/sitemap/robots nativos | todo o app |
| `three` + `@react-three/fiber` | cena 3D do Signal (modo completo) | só `SignalFull`, `dynamic(ssr:false)` |
| `gsap` (ScrollTrigger) | mapeia o scroll nativo do hero → fase do Signal, sem pinagem nem scroll-jacking | só quando o modo não é estático, import dinâmico |
| `@next/mdx` + `@mdx-js/*` | insights em MDX local (sem CMS) | `src/content/**` |
| `@fontsource-variable/recursive` | fonte local OFL-1.1 (sem Google Fonts em runtime) | layout |
| Vitest + Testing Library | unidade/contrato | `src/**/*.test.ts` |
| Playwright + axe-core | jornada, a11y, headers, performance | `e2e/` |

**Sem backend, CMS, analytics, banco, cookies ou serviço externo.** O formulário valida no cliente e devolve
“resumo preparado — nada foi enviado”; o usuário pode copiá-lo manualmente para a área de transferência (botão “Copiar resumo”, ver EXC-04).

Compatibilidade fixada: TypeScript 6 e ESLint 9 (o `eslint-config-next` 16 ainda não suporta TS 7 / ESLint 10).

## Movimento (v2)

- **Hero pinado ("Signal Lock").** O palco fica preso por ~2,6 telas (1,8 no modo leve) enquanto a **rolagem nativa** conduz
  uma linha do tempo GSAP (`scrub`): a rede parte dispersa (Sinais), ganha rotas, vira sistemas e fecha no “S” (Impacto);
  o título sai de foco (blur), a frase “Do sinal ao sistema, pronto para evoluir.” entra no fim e o CTA nunca sai da tela.
  Nada captura wheel/touch nem trava o `body`: teclado, leitores de tela e âncoras funcionam. O pin só existe quando o conteúdo
  cabe na viewport (zoom, espaçamento de texto e paisagem curta rolam normalmente).
- **Capacidades.** A espinha se desenha com a rolagem; cada grupo entra com linha de acento, marcador que “acende”, título com
  foco e itens em cascata (uma vez por grupo). Impressão força tudo visível.
- Com `prefers-reduced-motion` o GSAP **nem é carregado**: hero estático e capacidades sem animação.
- Referência de estilo: hero “scroll-locked” do 21st.dev e o site weevolveit.com foram estudados só como inspiração de linguagem
  (rolagem conduzindo a cena, título que desfoca, frase de fechamento). Nenhum código, vídeo, conteúdo, número ou depoimento foi
  copiado; o componente de referência trava o `body` sem liberar, o que não atende à exigência de rolagem nativa/acessibilidade.

## Severius Signal — modos

| Modo | Quando | O que é |
| --- | --- | --- |
| Completo | desktop, WebGL, sem `prefers-reduced-motion`, sem `saveData` | canvas R3F em tela cheia, montado em idle; progresso via GSAP (96 sinais → “S”) |
| Leve | viewport < 768px ou `saveData` | SVG original com rotas reveladas por fase (CSS) |
| Estático | `prefers-reduced-motion`, sem WebGL/JS, falha de chunk/contexto (inclui contexto que não fica pronto em 6 s) | SVG original; a narrativa das 4 fases permanece em HTML |

O HTML + SVG estático é sempre renderizado primeiro; o viewport tem dimensões reservadas (sem CLS).

## Suposições explícitas

1. Marca pública **Severius**; wordmark tipográfico provisório.
2. Origem/domínio **não aprovados**: `NEXT_PUBLIC_SITE_ORIGIN` vazio → JSON-LD sem `url`; `robots` = `Disallow: /`;
   canonical/sitemap usam a origem placeholder `https://example.invalid` apenas para a prévia.
3. Sem clientes, estatísticas, depoimentos, prêmios, e-mail ou telefone. Demonstrações rotuladas **Severius Labs** (conceituais).
4. Um insight publicado por idioma (MDX); os demais são “em preparação”.
5. Localização: o diretório foi criado fora do workspace `Severius-company` para virar repositório próprio na organização
   `Severius-company` do GitHub; **nenhum remoto configurado**.

## Decisões humanas pendentes (antes de qualquer publicação)

- Domínio e origem pública; e-mail/canal de recebimento e destino aprovado do formulário (o que implica backend, privacidade e retenção).
- Logotipo definitivo (hoje wordmark tipográfico).
- Casos reais autorizados para substituir/complementar Severius Labs.
- Analytics/consentimento (não incluído por padrão).
- Exceções pendentes em `work/exceptions.md`: CSP com `'unsafe-inline'` (EXC-01), JS inicial acima do orçamento (EXC-02), aviso upstream `THREE.Clock` (EXC-03) e botão “Copiar resumo” (EXC-04).
- Aprovação de publicação e revisão de licença GSAP para uso comercial (ver `work/appsec-review.md`).
- Revisão humana do copy em inglês.
