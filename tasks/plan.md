# Implementation Plan: Severius Flow — teste02

## Overview

Criar uma vertente da home da Severius inspirada nos padrões de interação do projeto `desenrolai-clone`, preservando Next.js 16, React 19, Tailwind 4, rotas bilíngues, conteúdo existente, acessibilidade e alterações locais. Nenhum vídeo, fotografia, cliente ou resultado da referência será reutilizado.

## Architecture Decisions

- Manter a página como Server Component e isolar interações em pequenas ilhas client.
- Não adicionar GSAP: usar `requestAnimationFrame`, IntersectionObserver, CSS variables e transições nativas.
- Manter conteúdo bilíngue em `src/content/`, com projetos explicitamente marcados como demonstração.
- Implementar a corda geral em Canvas 2D, com geometria e oscilação ligadas ao scroll, substituindo a aproximação SVG.
- Manter componentes e rotas atuais disponíveis; a branch troca apenas a composição da home e acrescenta comportamento ao header/layout.

## Design Direction

- **Cores:** Carbon `#0A0B0A`, Graphite `#141714`, Line `#293029`, Severius Lime `#9EFF00`, Mist `#DDE5DA`.
- **Tipo:** Barlow local; títulos condensados por escala/peso, corpo com largura curta e alta legibilidade.
- **Layout:** blocos editoriais largos, bento assimétrico de serviços, pipeline operacional horizontal e método em cards coreografados.
- **Princípio:** “software em fluxo” — uma corda/lógica contínua conecta diagnóstico, construção e operação.

## Task List

### Phase 1: Foundation
- [ ] Criar conteúdo bilíngue da nova home e estilos isolados.
- [ ] Criar loader da marca e submenu responsivo de serviços.

### Checkpoint: Foundation
- [ ] Lint e TypeScript passam.
- [ ] Header permanece navegável por teclado e mobile.

### Phase 2: Core Experience
- [ ] Criar hero e manifesto gráficos sem vídeos/fotografias.
- [ ] Criar bento de serviços com hover/focus de preenchimento por cordas.
- [ ] Criar pipeline demonstrativo interativo e acessível.
- [ ] Integrar projetos demonstrativos, método animado e FAQ.
- [ ] Criar corda global em Canvas ligada ao scroll.

### Checkpoint: Core Experience
- [ ] Home completa funciona em inglês e português.
- [ ] Reduced motion exibe versão estática completa.

### Phase 3: Verification
- [ ] Atualizar testes de conteúdo/interação.
- [ ] Validar desktop, mobile, teclado, console e acessibilidade.
- [ ] Executar lint, typecheck, unitários, e2e relevante e build.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Alterações locais sobrepostas | Alto | Alterações aditivas e patches focados; sem reset/checkout destrutivo |
| Canvas custoso | Médio | DPR limitado, pausa fora da viewport e reduced-motion estático |
| Sticky/scroll em telas baixas | Médio | Fallback estático por breakpoint de largura/altura |
| Claims confundidos com cases reais | Alto | Disclaimer visível e dados explicitamente demonstrativos |

## Open Questions

- Projetos reais e métricas verificadas serão substituídos futuramente; nesta branch tudo permanece demonstrativo.
