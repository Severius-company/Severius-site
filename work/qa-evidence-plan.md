# Plano de QA, release e validação de evidências — Severius Website

**Documento:** `QA-EVIDENCE-PLAN`  
**Versão:** 1.0  
**Status:** spec de validação pronta; execução e resultados pendentes  
**Papel autor:** QA & Release / Evidence Validator independente  
**Escopo:** primeira fatia funcional do site institucional bilíngue da Severius  
**Data-base:** 2026-09-19  

## 1. Fontes de verdade e precedência

Esta spec foi derivada integralmente de:

1. pedido do usuário que iniciou a execução;
2. `/Users/walace/Desktop/workspace/Severius-company/AGENTS.md`;
3. `docs/10-SITE-SEVERIUS-CONCEITO.md`;
4. `docs/11-PROMPT-SITE-SEVERIUS.md`;
5. `docs/12-ORQUESTRACAO-GOVERNANCA-E-EVIDENCIAS.md`;
6. `docs/08-SEGURANCA-E-CIBERSEGURANCA.md`;
7. skill `orchestrate-growth-studio` e seus contratos de charter, agentes,
   handoff, gates, evidências e governança.

Em caso de conflito, prevalecem o pedido atual do usuário e as regras da
Severius. Governança só deve ser acionada para regra ausente ou conflitante,
desvio arquitetural, exceção de política, risco não aceito ou decisão humana.
Defeito objetivo volta ao executor sem reescrever silenciosamente esta spec.

## 2. Enquadramento e classificação das afirmações

### 2.1 Fatos aprovados

- Marca pública: **Severius**.
- Posicionamento: consultoria de tecnologia e estúdio de software AI-native.
- Público inicial: fundadores, líderes de produto e empresas que precisam criar
  ou modernizar produtos, sistemas e operações digitais.
- Promessa: **“Transformamos ideias e operações em software seguro, útil e
  preparado para evoluir”**.
- CTA principal: **“Solicitar diagnóstico”**.
- Primeiro passo: formulário curto, sem envio a serviço externo até existir
  configuração aprovada.
- Capacidades: Definir, Construir, Conectar e Evoluir, com quatro capacidades em
  cada grupo.
- Demonstrações sem caso real autorizado recebem o rótulo **Severius Labs**.
- PT-BR é a fonte editorial; inglês é adaptação, não tradução literal.
- Direção visual: Campo de Conexões, charcoal, tecnológica e editorial.
- Assinatura visual: Severius Signal nos modos completo, leve e estático.
- Stack: Next.js App Router + TypeScript; GSAP/ScrollTrigger e React Three Fiber
  somente na cena principal, progressivamente.
- Blog inicial: MDX versionado.
- Não haverá deploy, domínio, serviço pago ou transmissão externa de dados nesta
  entrega.

### 2.2 Inferências reversíveis

- O formulário pode validar no servidor da própria aplicação e descartar o
  payload em memória, desde que informe com clareza que não envia nem armazena a
  solicitação e que nenhuma PII apareça em logs.
- Backend especializado não é necessário sem persistência, autenticação,
  pagamento, CRM, webhook ou integração externa.
- O preview privado deve usar `noindex` e não pode ser tratado como produção.
- Observabilidade desta fatia se limita a erros locais, estado do formulário e
  verificação de ausência de PII/segredos; uma cadeia real evento→alerta→runbook
  permanece fora do gate de preview porque não há serviço externo aprovado.

### 2.3 Decisões humanas ainda necessárias para produção

- origem/domínio canônico real e endereço público de contato;
- autorização do conteúdo final e da direção visual final;
- destino, finalidade, retenção, acesso e descarte dos dados do formulário;
- analytics, consentimento e eventual provedor;
- política de publicação, hosting, DNS e monitoramento;
- autorização explícita para deploy/publicação.

Essas pendências não impedem um preview local/privado verificável, mas impedem
aprovação de release público.

## 3. Resultado esperado e não-escopo

### 3.1 Resultado esperado

Entregar uma fatia vertical local e reproduzível que permita a uma pessoa:

1. acessar `/pt-br` e `/en`;
2. entender posicionamento, promessa, capacidades, método, Severius Labs e
   insights;
3. navegar por teclado e alternar idioma;
4. perceber a identidade Campo de Conexões com fallback funcional;
5. iniciar e concluir a validação do formulário sem transmissão externa;
6. inspecionar metadados, dados estruturados e conteúdo editorial verdadeiro;
7. reproduzir testes funcionais, visuais, de acessibilidade, performance, SEO e
   segurança.

### 3.2 Não-escopo

- deploy ou publicação pública;
- configuração de domínio/DNS, e-mail ou analytics;
- persistência de leads, CRM, webhooks ou envio de mensagens;
- autenticação, pagamento, área privada ou banco de dados;
- casos, clientes, depoimentos, logotipos, números ou resultados não autorizados;
- garantia de ranking, tráfego, Core Web Vitals de campo ou citação por IA;
- páginas individuais para as 16 capacidades;
- teste ativo em sistemas externos ou produção.

## 4. Critérios de aceite observáveis — spec v1

Cada critério só passa com evidência direta. “O agente afirmou que fez” não é
evidência suficiente.

### A. Estrutura, stack e execução

- **AC-001 — estrutura mínima:** o projeto possui scripts documentados para
  desenvolvimento, build, lint, typecheck, testes automatizados e jornada no
  navegador; uma instalação limpa consegue executar o conjunto com versões
  fixadas em lockfile.
- **AC-002 — Next.js confirmado:** a versão realmente instalada é registrada no
  pacote de evidências e as APIs usadas são compatíveis com a documentação local
  em `node_modules/next/dist/docs/`.
- **AC-003 — arquitetura contida:** componentes de servidor são o padrão;
  componentes cliente ficam limitados a interações de navegador; Three/R3F e
  GSAP não entram no caminho crítico do conteúdo.
- **AC-004 — build íntegro:** lint, typecheck, testes e build encerram com código
  zero, sem warnings de runtime relevantes ignorados.
- **AC-005 — sem publicação:** não existe evidência de deploy, DNS, compra,
  integração paga ou ação externa realizada por esta entrega.

### B. Conteúdo, marca e arquitetura da informação

- **AC-010 — posicionamento fiel:** marca, público, promessa e CTA correspondem
  exatamente às decisões aprovadas, sem claims adicionais não demonstrados.
- **AC-011 — CTA prioritário:** “Solicitar diagnóstico” é a única ação primária
  visual e semântica no hero, navegação e conversão final; ações editoriais são
  secundárias.
- **AC-012 — estrutura completa:** a homepage contém navegação, hero, proposta,
  fricção→sistema, 16 capacidades em quatro grupos, método, Severius Labs,
  insights, conversão final e rodapé.
- **AC-013 — método correto:** Mapear, Desenhar, Construir e Evoluir aparecem na
  ordem e com sentido coerente com a documentação.
- **AC-014 — demonstrações honestas:** todo trabalho não respaldado por caso real
  autorizado é explicitamente identificado como Severius Labs/demonstração e
  não sugere cliente, contrato ou resultado real.
- **AC-015 — agentes sem personificação indevida:** o modelo AI-native deixa
  claro que agentes são papéis digitais e que direção e aprovações críticas são
  humanas.
- **AC-016 — originalidade:** não há cópia de texto, composição, globo de
  partículas, assinatura, vídeo, código ou asset das referências citadas.

### C. Idiomas e navegação

- **AC-020 — rotas bilíngues:** `/pt-br` e `/en` retornam conteúdo completo e
  coerente; a raiz possui comportamento deliberado e testado, sem loop.
- **AC-021 — adaptação editorial:** PT-BR é a fonte e o inglês preserva intenção,
  clareza e CTA sem tradução literal ruim ou mistura acidental de idiomas.
- **AC-022 — seletor equivalente:** o seletor indica idioma atual, possui nome
  acessível, preserva a página equivalente quando existente e mantém navegação
  por histórico.
- **AC-023 — navegação resiliente:** âncoras levam ao destino, foco não fica
  oculto pelo cabeçalho e voltar/avançar do navegador continua funcional.
- **AC-024 — sem JavaScript:** conteúdo principal, promessa, capacidades e CTA
  continuam disponíveis e semanticamente compreensíveis com JavaScript
  desativado; aprimoramentos podem ficar indisponíveis.

### D. Sistema visual, responsividade e Severius Signal

- **AC-030 — tokens:** Carbon `#0D1012`, Graphite `#191E22`, Cloud `#EDF1F3`, Ion
  `#70C7FF` e Copper `#E08B5B` estão centralizados em tokens, junto de tipografia,
  espaços, foco e movimento.
- **AC-031 — direção original:** a composição é charcoal/editorial, usa espaço,
  escala e alinhamento e não se reduz a template SaaS, glassmorphism ou grade de
  cartões repetidos.
- **AC-032 — responsividade:** não há overflow horizontal nem perda de conteúdo
  em 320, 375, 768, 1024 e 1440 px; zoom a 200% e reflow a 400% permanecem
  utilizáveis.
- **AC-033 — três modos:** a cena possui seleção verificável dos modos completo,
  leve e estático; os três comunicam sinais→rotas→sistemas→impacto.
- **AC-034 — progressive enhancement:** falha/indisponibilidade de WebGL ou do
  carregamento dinâmico mostra fallback estático sem quebrar conteúdo ou CTA.
- **AC-035 — movimento seguro:** rolagem é nativa; não há `body` travado, captura
  global persistente de wheel/touch, autoplay de áudio ou pinagem que prenda
  teclado/toque/histórico.
- **AC-036 — movimento reduzido:** `prefers-reduced-motion: reduce` impede a cena
  intensa e animações não essenciais, oferecendo arte estática ou transições
  discretas sem remover informação.
- **AC-037 — uso de recursos:** canvas pausa fora da viewport, limita densidade
  de pixels e não causa deslocamento de layout.

### E. Formulário e estados de interface

- **AC-040 — coleta mínima:** o formulário solicita somente dados necessários ao
  primeiro passo e explica finalidade e ausência de envio/armazenamento externo
  nesta versão.
- **AC-041 — validação segura:** os mesmos limites essenciais são aplicados no
  servidor, com tipo, tamanho, normalização e allowlist quando aplicável;
  payloads ausentes, excessivos e inválidos são rejeitados de forma previsível.
- **AC-042 — nenhum transporte externo:** teste de rede demonstra que o envio não
  chama domínio/serviço externo, não persiste dados e não inclui dados do usuário
  em URL, analytics, storage do navegador ou logs.
- **AC-043 — estados acessíveis:** idle, foco, inválido, enviando, sucesso local e
  erro inesperado têm mensagem clara, associação programática e anúncio por
  tecnologia assistiva sem depender apenas de cor.
- **AC-044 — preservação de entrada:** erro corrigível preserva campos seguros já
  digitados e leva foco/resumo ao problema sem loop ou perda silenciosa.
- **AC-045 — abuso proporcional:** limites de tamanho e frequência/controle local
  são documentados; não se usa CAPTCHA externo ou fingerprinting sem aprovação.

### F. Acessibilidade WCAG 2.2 AA

- **AC-050 — semântica:** existe um único `main`, landmarks nomeados quando
  repetidos, heading hierarchy coerente, idioma do documento correto e HTML
  válido o bastante para não quebrar a árvore acessível.
- **AC-051 — teclado:** todas as funções são alcançáveis e operáveis com Tab,
  Shift+Tab, Enter, Space e Escape quando aplicável; ordem é lógica, não há
  keyboard trap e há skip link funcional.
- **AC-052 — foco:** foco é sempre visível e contrastante em fundos escuros e
  claros, não é removido sem substituto e não fica coberto.
- **AC-053 — nomes e erros:** controles, seletor de idioma, links e formulário
  têm nomes acessíveis; labels/instruções/erros são associados; `aria` não
  contradiz o HTML nativo.
- **AC-054 — percepção:** texto e controles atingem contraste AA; informação não
  depende só de cor; alvos essenciais têm tamanho confortável; arte decorativa
  não polui leitor de tela.
- **AC-055 — leitura assistiva:** o fluxo principal e o formulário são
  percorridos com VoiceOver + Safari, sem anúncio enganoso ou perda de contexto.
- **AC-056 — automação sem violações sérias:** auditoria automatizada nas duas
  homepages e nos estados de formulário não encontra violações `critical` ou
  `serious`; achados menores são triados, não simplesmente suprimidos.

### G. SEO, metadados e conteúdo editorial

- **AC-060 — metadata por idioma:** título, descrição, Open Graph e idioma são
  coerentes com o conteúdo visível e diferem apropriadamente entre PT-BR e EN.
- **AC-061 — canonical/hreflang:** relações canonical, `pt-BR`, `en` e `x-default`
  são recíprocas e apontam para páginas equivalentes usando uma origem aprovada
  via configuração; teste automatizado pode usar `example.invalid`, nunca como
  domínio público ou claim real.
- **AC-062 — preview não indexável:** ambiente privado usa `noindex, nofollow` e
  não aparece no sitemap de produção; a configuração de produção não pode ser
  aprovada antes do domínio real.
- **AC-063 — sitemap/robots:** saídas são parseáveis, contêm somente rotas
  existentes e obedecem à política do ambiente.
- **AC-064 — JSON-LD verdadeiro:** JSON-LD é JSON válido, não injeta conteúdo não
  confiável e descreve apenas organização/serviços/artigos realmente visíveis;
  não contém e-mail, domínio, fundador, endereço, rating, clientes ou resultados
  inventados.
- **AC-065 — MDX:** existe conteúdo inicial versionado, com slug, idioma, título,
  data, autor/revisão apenas quando verdadeiros, fontes quando necessárias e
  renderização sem HTML/script arbitrário não previsto.
- **AC-066 — links:** verificação interna não encontra links ou âncoras quebrados;
  qualquer link externo é intencional e não transmite dados do formulário.

### H. Performance e estabilidade

- **AC-070 — conteúdo crítico primeiro:** proposta, CTA e estrutura inicial são
  renderizados sem depender de Three/R3F/GSAP; a cena é carregada depois do
  conteúdo crítico.
- **AC-071 — orçamento de carregamento:** o orçamento da seção 7 é medido em build
  de produção e desvios têm justificativa, responsável e plano de correção.
- **AC-072 — metas sintéticas:** em execução controlada mobile, LCP ≤ 2,5 s, INP
  (ou proxy TBT quando INP sintético não estiver disponível) ≤ 200 ms como meta e
  CLS ≤ 0,1; resultados registram ferramenta, versão, hardware, URL, rede e
  número de amostras.
- **AC-073 — estabilidade:** fontes, canvas e mídia reservam espaço; não há salto
  visual perceptível durante hidratação, troca de modo ou carregamento da cena.
- **AC-074 — degradação:** perfil leve/estático reduz trabalho gráfico e mantém
  conteúdo/CTA utilizáveis sob CPU e rede limitadas.

### I. Segurança, privacidade e observabilidade proporcional

- **AC-080 — nenhum segredo:** busca no repositório, bundle, HTML, source maps,
  URL, storage, mensagens de erro e logs não encontra credenciais ou tokens.
- **AC-081 — superfície mínima:** não há endpoint, API, dependência ou permissão
  sem necessidade; dependências diretas têm justificativa, licença e versão.
- **AC-082 — headers:** headers aplicáveis ao preview/build (CSP compatível,
  `X-Content-Type-Options`, política de referrer e framing) são verificados; CSP
  não usa relaxamentos amplos sem justificativa.
- **AC-083 — entrada hostil:** payloads com HTML/script, CRLF, campos extras,
  Unicode incomum, comprimentos extremos e tipos errados são tratados como texto
  ou rejeitados; não há reflexão executável nem erro interno exposto.
- **AC-084 — privacidade:** finalidade, campos mínimos, acesso, retenção e descarte
  estão documentados. Nesta fatia, retenção deve ser zero e nenhum corpo de
  formulário deve ser logado.
- **AC-085 — dependências:** auditoria de dependências é registrada sem afirmar
  ausência absoluta de risco; vulnerabilidade high/critical explorável no escopo
  bloqueia o preview até correção ou decisão formal.
- **AC-086 — eventos mínimos:** erros técnicos podem usar identificador de
  correlação opaco, mas não incluem PII, corpo completo, cookie ou headers de
  autorização. Nenhuma telemetria externa é habilitada.
- **AC-087 — limite operacional:** cadeia real evento→alerta→runbook é marcada
  `não aplicável ao preview local / pendente antes da produção`, nunca como
  validada sem teste ponta a ponta.

### J. Estados sistêmicos e release

- **AC-090 — loading:** carregamento de rota/cena preserva layout, informa estado
  somente quando a espera é perceptível e não bloqueia conteúdo crítico.
- **AC-091 — erro de rota:** erro inesperado oferece mensagem humana, tentativa
  segura de recuperação e retorno à página; detalhes internos e stack traces não
  aparecem ao usuário.
- **AC-092 — not found:** rota inexistente apresenta 404 bilíngue/coerente, link
  de retorno e status HTTP correto.
- **AC-093 — erro da cena:** falha de import, canvas ou WebGL degrada para arte
  estática sem acionar o estado de erro da página inteira.
- **AC-094 — preview privado:** checklist da seção 9 está completo e o endereço
  privado, se houver, não é divulgado como produção.
- **AC-095 — separação de gates:** aprovação técnica de preview não autoriza
  publicação; release público permanece bloqueado até as decisões humanas da
  seção 2.3 e novo reteste proporcional.

## 5. Matriz critério → evidência

| Critérios | Evidência mínima reproduzível | Ferramenta/método | Decisão sem evidência |
|---|---|---|---|
| AC-001–005 | manifestos, lockfile, inventário, saída integral dos scripts e `git diff --check` | package manager + CI/local limpo | `bloqueado` |
| AC-010–016 | comparação de copy com brief, screenshots, claim ledger, revisão manual de originalidade | revisão independente | `corrigir` ou `escalar` se mudar claim |
| AC-020–024 | respostas HTTP/HTML das rotas, jornada PT↔EN, teste JS-off, histórico e anchors | navegador real + requisições locais | `corrigir` |
| AC-030–037 | tokens, screenshots nos breakpoints, gravação curta dos 3 modos, emulação reduce/WebGL-off | navegador real, inspeção visual e performance | `corrigir` |
| AC-040–045 | testes de schema/server, HAR ou registro de rede minimizado, estados do formulário e teste de logs/storage | unit/integration/browser + revisão AppSec | `bloqueado` se houver transmissão/PII |
| AC-050–056 | relatório automatizado, roteiro de teclado preenchido e notas VoiceOver/Safari | axe equivalente + teste manual | `corrigir`; `bloqueado` para barreira crítica |
| AC-060–066 | HTML renderizado, headers, sitemap/robots parseados, JSON-LD validado, crawler local | integration/browser + parser | `corrigir`; `escalar` para origem real ausente |
| AC-070–074 | bundle/build stats, waterfall, ≥3 medições por perfil, trace e screenshots de estabilidade | Lighthouse/DevTools/PerformanceObserver | `corrigir`; nunca inferir p75 de campo |
| AC-080–087 | secret scan, inspeção de bundle/storage/logs, testes negativos, headers, audit e threat model | revisão AppSec independente | `bloqueado` para high/critical explorável |
| AC-090–095 | testes forçando loading/import/error/404, screenshots e checklist assinado | browser/integration + revisão manual | `corrigir` ou `bloqueado` |

Todo registro deve conter: comando/roteiro, data, ambiente, commit ou hash do
conteúdo, resultado, arquivo de saída resumido, limitações, autor e revisor.
Capturas não substituem teste semântico; logs textuais não substituem inspeção
visual quando a UI é o objeto.

## 6. Estratégia de testes

### 6.1 Unidade

Cobrir lógica determinística e rápida:

- schema e normalização do formulário, limites e mensagens por idioma;
- seleção de locale, dicionários e equivalência de rotas;
- seleção dos modos completo/leve/estático, incluindo reduced motion, ausência
  de WebGL e heurística explicitamente documentada;
- geração de metadata, alternates e JSON-LD;
- parsing/ordenação/validação do frontmatter MDX;
- utilitários que sanitizem dados de log e IDs de correlação.

Evitar snapshot amplo de markup. Preferir assertions de comportamento e dados.

### 6.2 Integração

- renderização servidor das duas homepages;
- handler/server action do formulário com casos válidos, inválidos, campos
  extras, tamanhos extremos e erro interno simulado;
- geração de sitemap/robots/feed e consistência com rotas reais;
- import e renderização de MDX permitido;
- metadata/JSON-LD por locale;
- error boundary, loading e not-found sem vazamento de detalhe.

### 6.3 Navegador end-to-end

Executar, no mínimo, Chromium, Firefox e WebKit em viewport desktop e mobile:

1. abrir `/pt-br` e `/en` diretamente;
2. navegar por skip link e menu somente por teclado;
3. alternar idioma e usar voltar/avançar;
4. acionar CTA do hero e chegar ao formulário com foco adequado;
5. provocar validações de cada campo e corrigir erros;
6. simular envio válido, erro interno e repetição rápida;
7. provar ausência de request externo no fluxo;
8. verificar links, anchors, 404 e recuperação de erro;
9. testar fallback da cena por falha de WebGL/import;
10. coletar erros de console, requests falhos e hydration warnings.

Falha intermitente deve ser investigada; repetição até “ficar verde” não é passe.

### 6.4 Acessibilidade manual e automatizada

- axe equivalente em PT-BR, EN e estados do formulário;
- sequência completa por teclado em 320 px e desktop;
- VoiceOver + Safari para navegação, locale, CTA, formulário, erros e sucesso;
- contraste de texto, foco e estados nos fundos Carbon/Graphite/Cloud;
- zoom 200%, reflow 400%, tamanho de toque e orientação;
- árvore acessível sem canvas decorativo exposto como ruído;
- `prefers-reduced-motion`, `forced-colors` quando suportado e conteúdo sem CSS.

Automação ajuda a encontrar problemas, mas não substitui teclado e leitor de tela.

### 6.5 Responsividade e evidência visual

Capturar página inteira e recortes do hero/formulário em 320×568, 375×812,
768×1024, 1024×768 e 1440×900, em PT-BR e EN. Comparar:

- overflow, truncamento e sobreposição;
- quebra de headline e CTA;
- ordem de leitura e hierarquia;
- canvas/fallback e espaço reservado;
- navegação expandida/compacta;
- mensagens longas em inglês e estados de erro.

Baseline visual só é válido depois de revisão humana da primeira versão. Mudanças
deliberadas exigem nova aprovação, não atualização automática do snapshot.

### 6.6 Movimento reduzido e capacidade

- emular `reduce` antes do carregamento e durante uma sessão nova;
- confirmar que GSAP/Three não iniciam trabalho intenso no modo estático;
- forçar WebGL indisponível e falha do chunk da cena;
- simular baixa capacidade/rede e verificar seleção leve/estática;
- rolar, selecionar texto, usar teclado, touch e histórico durante a cena;
- confirmar pausa fora da viewport e retomada sem salto.

### 6.7 SEO técnico

- inspeção do HTML obtido sem hidratação;
- teste de `title`, description, canonical, alternates, OG e locale;
- reciprocidade PT-BR/EN/x-default;
- parse de sitemap, robots, feed e JSON-LD;
- crawler local para status, links e anchors;
- checagem de que preview é `noindex` e produção depende de origem aprovada;
- comparação de JSON-LD com texto realmente visível.

### 6.8 Performance

Usar build de produção local, perfil mobile com CPU/rede limitadas e cache frio.
Realizar ao menos três execuções por rota/modo, guardar todas e reportar mediana
e pior amostra. LCP/CLS podem ser medidos sinteticamente; INP exige interação e
não deve ser substituído silenciosamente por Lighthouse. Quando só TBT estiver
disponível, rotular como proxy. p75 real exige dados de campo futuros.

Coletar waterfall, cobertura JS, long tasks, layout shifts e peso por chunk.
Comparar completo, leve, estático, reduced motion e JS desativado.

### 6.9 Segurança e privacidade

Threat model mínimo:

- **ativos:** conteúdo, disponibilidade, dados digitados, integridade da marca;
- **entradas:** URL/locale, MDX versionado, campos do formulário, headers;
- **fronteiras:** navegador↔Next server; conteúdo versionado↔renderer; import
  dinâmico↔fallback;
- **ameaças:** XSS/MDX ativo, injection/reflexão, abuso/DoS do formulário, PII em
  logs/storage/URL, dependência comprometida, segredo no bundle, clickjacking e
  headers permissivos.

Executar testes negativos somente no ambiente local/privado autorizado. Busca de
segredo deve usar padrões sem imprimir valores completos. Evidência deve redigir
payloads com PII. Achado high/critical, segredo válido ou transmissão externa
inesperada bloqueia.

## 7. Orçamento de performance

Valores abaixo são limites iniciais de engenharia, não resultados medidos:

| Dimensão | Orçamento v1 | Observação |
|---|---:|---|
| LCP mobile sintético | ≤ 2,5 s | meta; p75 de campo permanece desconhecido |
| INP | ≤ 200 ms | medir por interação quando possível; TBT é apenas proxy |
| CLS | ≤ 0,10 | incluir fonte, canvas e hidratação |
| HTML + CSS crítico comprimido | ≤ 100 KB | por homepage, sem conteúdo duplicado |
| JS inicial comprimido, sem cena | ≤ 130 KB | rota deve ser útil antes de GSAP/R3F |
| chunk da cena comprimido | ≤ 350 KB | carregado sob demanda; justificar desvio |
| imagem/arte fallback inicial | ≤ 120 KB | dimensões reservadas e formato moderno |
| fontes transferidas no primeiro acesso | ≤ 160 KB | somente pesos/eixos usados; fallback estável |
| requests antes do conteúdo útil | ≤ 20 | nenhuma origem de terceiros necessária |
| long task no caminho crítico | nenhuma > 200 ms | investigar qualquer tarefa > 50 ms |
| terceiros | 0 KB | até aprovação explícita |

Se a stack real tornar um limite inviável, o executor registra medição, causa,
alternativas e impacto. Mudar o orçamento exige decisão versionada; não se altera
o limite apenas para fazer a entrega passar.

## 8. Estados obrigatórios de loading e erro

| Superfície | Loading | Erro | Recuperação/fallback |
|---|---|---|---|
| rota/segmento | skeleton ou indicador somente se perceptível; espaço estável | mensagem localizada sem detalhe interno | tentar novamente e voltar à homepage |
| Severius Signal | arte estática já visível; carregamento fora do caminho crítico | nunca derruba a página | fallback estático e conteúdo HTML |
| MDX/insight | estrutura editorial estável | 404 para slug ausente; erro seguro para falha real | voltar a Insights |
| formulário | botão informa envio e evita duplicação; campos continuam legíveis | validação inline/resumo ou erro inesperado genérico | foco no erro e nova tentativa |
| locale | troca com navegação padrão, sem tela vazia | equivalente ausente cai para índice do locale | link de retorno explícito |

Mensagens não podem prometer contato, envio ou armazenamento que não ocorreram.
O “sucesso” desta fatia significa apenas **validação local concluída e nenhum dado
transmitido**.

## 9. Checklist de preview privado

### 9.1 Antes de iniciar

- [ ] commit/hash e spec v1 registrados;
- [ ] dependências/lockfile instaláveis de forma reproduzível;
- [ ] versão do Next e APIs conferidas na documentação local;
- [ ] nenhuma mudança alheia sobrescrita;
- [ ] configuração não contém segredo nem origem pública inventada.

### 9.2 Qualidade automatizada

- [ ] lint passa;
- [ ] typecheck passa;
- [ ] testes unitários e de integração passam;
- [ ] build de produção passa;
- [ ] E2E nas rotas/fluxos críticos passa;
- [ ] teste de links/metadata/JSON-LD passa;
- [ ] nenhum erro de console/hidratação relevante.

### 9.3 Revisão humana independente

- [ ] copy, claims e rótulo Severius Labs revisados;
- [ ] screenshots em todos os breakpoints revisadas;
- [ ] teclado e foco testados;
- [ ] VoiceOver + Safari testado;
- [ ] reduced motion, WebGL-off e JS-off testados;
- [ ] formulário e mensagens revisados em PT-BR e EN;
- [ ] nenhum autor é seu único aprovador.

### 9.4 Performance, SEO e segurança

- [ ] orçamento medido com ambiente e amostras registrados;
- [ ] canonical/hreflang testado com origem de teste e pendência real explícita;
- [ ] preview marcado `noindex, nofollow`;
- [ ] secret scan, bundle/storage/log review e testes negativos registrados;
- [ ] nenhuma request externa ou PII em evidência;
- [ ] headers verificados;
- [ ] vulnerabilidades de dependência triadas;
- [ ] risco residual documentado.

### 9.5 Handoff

- [ ] `EVIDENCE_BUNDLE` liga cada critério ao artefato e teste;
- [ ] itens não verificados aparecem como pendentes, não como passe;
- [ ] decisão do validador é `aprovado`, `corrigir`, `escalar` ou `bloqueado`;
- [ ] preview continua privado e sem deploy público;
- [ ] aprovação técnica está separada de aprovação de conteúdo/publicação.

## 10. Regras de validação independente

1. O executor entrega a versão da spec, arquivos alterados, testes, instruções de
   reprodução, limitações e riscos. O validador não reconstrói uma justificativa
   ausente para fazê-lo passar.
2. O validador executa novamente uma amostra representativa, incluindo todos os
   gates críticos: build, CTA/formulário, teclado, idiomas, fallback, SEO e
   segurança.
3. Evidência é vinculada a IDs `AC-*`; resumo sem output observável não vale.
4. Screenshot prova aparência, não semântica, rede, foco ou segurança. Cada tipo
   de claim usa evidência compatível.
5. Teste automatizado aprovado pelo próprio autor requer revisão separada de
   adequação e, quando crítico, reprodução manual.
6. Critério não testado recebe `não verificado`; não recebe “provavelmente passa”.
7. Resultado depende de commit/hash. Mudança posterior invalida as evidências
   afetadas e exige reteste proporcional.
8. Flaky test é falha até causa e correção; não se oculta com retries ilimitados.
9. Supressões de lint/a11y/security precisam de motivo estreito e revisão.
10. Evidências excluem segredos, tokens, logs completos, dados pessoais e
    conteúdo privado desnecessário.

### 10.1 Decisões permitidas

- **`aprovado`:** todos os critérios aplicáveis estão demonstrados e não há
  falha bloqueante; para esta etapa significa somente preview privado.
- **`corrigir`:** discrepância objetiva pode ser resolvida sem mudar regra,
  arquitetura, escopo ou risco aceito; retorna ao executor com `AC-*` e prova.
- **`escalar`:** resolver exige regra/claim/origem ausente, mudança arquitetural,
  exceção de política, novo custo/privacidade ou aceitação humana de risco.
- **`bloqueado`:** falta evidência essencial ou há falha crítica, segredo, PII,
  transmissão externa inesperada, XSS/injection explorável, barreira de acesso
  crítica ou build/jornada principal quebrados.

### 10.2 Severidade de defeitos

- **S0 bloqueante:** exposição de segredo/PII, execução de script não confiável,
  envio externo não autorizado, perda completa do CTA/formulário, conteúdo
  enganoso, barreira crítica de acessibilidade ou aplicação indisponível.
- **S1 alta:** idioma/SEO principal incorreto, teclado impedido, fallback ausente,
  erro persistente de runtime, meta de performance materialmente excedida.
- **S2 média:** defeito localizado com workaround, inconsistência visual ou copy
  ambígua sem claim enganoso.
- **S3 baixa:** polimento sem impacto funcional significativo.

Preview exige zero S0/S1 abertos. S2/S3 precisam de dono, impacto e decisão
explícita. Release público exige novo gate porque domínio, destino do formulário,
telemetria, operação e autorização não fazem parte desta validação local.

## 11. Modelo de `EVIDENCE_BUNDLE`

```text
EVIDENCE_BUNDLE
spec: QA-EVIDENCE-PLAN v1.0
revision: <commit/hash ou snapshot identificável>
task: <identificador e título>
author: <agente/papel executor>
reviewer: <agente/papel independente>
criteria: [AC-...]
artifacts:
  - <arquivo/rota/componente>
automated_checks:
  - command: <comando reproduzível>
    result: pass|fail|not-run
    evidence: <arquivo/trecho minimizado>
runtime_checks:
  - environment: <browser/viewport/rede/config>
    steps: <passos>
    observed: <resultado observável>
visual_evidence:
  - <captura ligada ao critério>
accessibility_performance_security:
  - <checagem, resultado e limitação>
limitations:
  - <não verificado/fora de escopo>
residual_risks:
  - <risco, severidade, dono>
validator_decision: aprovado|corrigir|escalar|bloqueado
```

## 12. Restrições atuais do ambiente e estado da evidência

- O diretório foi inspecionado durante trabalho paralelo; no snapshot desta spec,
  havia `package.json` com scripts declarados, mas nenhum resultado de instalação,
  build, teste ou navegador foi fornecido a este validador.
- Não foi confirmado nesta etapa um preview em execução, browser controlado,
  dispositivo móvel físico, VoiceOver, versão instalada do Next, lockfile ou
  conteúdo implementado. Esses itens permanecem **não verificados**.
- Sem dados de campo, não é possível afirmar p75 de LCP/INP/CLS. Medições futuras
  locais serão sintéticas e deverão ser rotuladas assim.
- Sem domínio aprovado, canonical/hreflang podem ser testados com origem reservada
  (`example.invalid`) e configuração reproduzível, mas o gate de produção fica
  pendente.
- Sem destino externo aprovado, o formulário não pode transmitir nem persistir
  PII. “Sucesso” é somente validação local.
- Sem serviço de alertas/telemetria aprovado, observabilidade ponta a ponta não
  pode ser declarada validada para produção.
- Nenhum resultado de teste é declarado neste documento. Todos os checkboxes e
  critérios começam pendentes até a coleta de evidência correspondente.

## 13. Gate inicial do validador

**Decisão atual: `bloqueado` para afirmar conclusão; `pronto` para iniciar a
execução de QA após a implementação.**

Motivo: a spec e a matriz estão definidas, porém ainda não existem neste pacote
resultados observáveis de build, runtime, acessibilidade, performance, SEO ou
segurança. Isso é esperado nesta etapa e não representa reprovação antecipada do
produto. Quando o executor entregar os bundles, discrepâncias objetivas retornam
para correção; somente exceções materiais seguem para governança ou aprovação
humana.
