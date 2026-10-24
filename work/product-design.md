# Severius — brief de produto, experiência e sistema visual v1

Status: especificação de design para a primeira fatia funcional  
Versão: `PD-001 v1.0`  
Fonte editorial: PT-BR; inglês é adaptação editorial  
Responsáveis desta etapa: Product/Discovery, Brand & Web Design, Product Design e UX Writing  
Próximo handoff: Frontend → QA/AppSec → Evidence Validator  

## 1. Brief de uma página

### Resultado esperado

Criar uma homepage institucional bilíngue que ajude fundadores, líderes de produto e empresas com necessidade de criar ou modernizar produtos, sistemas e operações digitais a entender:

1. o que a Severius faz;
2. como um projeto começa e evolui;
3. por que o processo é confiável mesmo sem provas comerciais publicáveis nesta fase;
4. como solicitar um diagnóstico sem que seus dados sejam enviados nesta primeira versão.

O resultado observável da primeira fatia é a compreensão e a intenção de iniciar o formulário de diagnóstico. A versão não promete geração de demanda nem mede conversão real antes de existir coleta aprovada.

### Classificação das informações

#### Fatos aprovados

- A marca pública é **Severius**.
- A Severius se posiciona como consultoria de tecnologia e estúdio de software AI-native.
- Público inicial: fundadores, líderes de produto e empresas que precisam criar ou modernizar produtos, sistemas e operações digitais.
- Promessa institucional: **“Transformamos ideias e operações em software seguro, útil e preparado para evoluir.”**
- CTA principal: **“Solicitar diagnóstico”**.
- A oferta de entrada é um diagnóstico de tecnologia e definição do projeto.
- A Severius organiza 16 capacidades em **Definir, Construir, Conectar e Evoluir**.
- PT-BR é a fonte editorial; inglês será adaptado, não traduzido literalmente.
- A primeira identidade usa um wordmark tipográfico e o conceito “Campo de Conexões”.
- A cena principal se chama `Severius Signal` e possui modos completo, leve e estático.
- Não há casos, clientes, números, depoimentos, domínio, e-mail ou resultados autorizados para publicação.
- Demonstrações sem cliente real são identificadas como `Severius Labs`.
- O formulário não transmite dados para serviço externo nesta versão.
- Projetos são executados por células de agentes especializados sob direção e aprovações humanas; agentes são papéis digitais, não funcionários ou representantes legais.
- Publicação, domínio, analytics, serviço pago e coleta de dados pessoais dependem de autorização explícita.

#### Inferências de design, sujeitas à validação

- A principal ansiedade do público é reduzir incerteza antes de investir em software: clareza de problema, escopo, risco e caminho de execução.
- Demonstrar método, critérios e artefatos é uma forma honesta de construir confiança enquanto não existem casos autorizados.
- A amplitude das 16 capacidades é mais compreensível quando apresentada como uma jornada, não como um catálogo de serviços equivalentes.
- O CTA deve levar a uma seção de formulário na própria página, preservando contexto e reduzindo compromisso inicial.
- O idioma inicial pode ser inferido pela rota, nunca por localização, e o seletor deve preservar a página equivalente.
- A direção visual pode alternar entre campo escuro e folha clara sem dividir a marca em duas personalidades se a espinha de conexão mantiver continuidade.

#### Hipóteses a medir ou confirmar depois

- “Solicitar diagnóstico” será uma ação suficientemente clara e desejável para o público inicial.
- Explicar “o que acontece depois” aumentará a disposição de iniciar o formulário.
- A narrativa visual `sinais → rotas → sistemas → impacto` ajudará a pessoa a entender a proposta sem competir com o conteúdo.
- Três demonstrações conceituais darão materialidade às capacidades sem serem confundidas com clientes, desde que o rótulo e a explicação apareçam antes dos títulos.
- A arquitetura de homepage será suficiente para o piloto; páginas profundas de capacidades devem nascer apenas com evidência editorial/comercial.
- A métrica primária futura poderá ser “pedido de diagnóstico válido”, mas depende de definição do canal, consentimento, destino e operação do lead.

### Problema, oferta e ação

- **Problema que a página ajuda a resolver:** a dificuldade de transformar uma ideia ou operação fragmentada em um projeto de software claro, seguro e evolutivo.
- **Oferta de entrada:** diagnóstico de tecnologia e definição do projeto.
- **Promessa:** “Transformamos ideias e operações em software seguro, útil e preparado para evoluir.”
- **Ação principal:** solicitar diagnóstico.
- **Ação desta primeira versão local:** preencher e validar o formulário; ao concluir, explicar que o envio ainda não está habilitado e oferecer a opção de copiar o resumo preenchido localmente, sem transmissão. A cópia é ação explícita da pessoa e não pode incluir campo oculto.
- **Prova disponível:** método, critérios, demonstrações próprias e transparência sobre limitações — sem clientes, estatísticas ou resultados inventados.

### Não escopo

- Deploy, domínio, e-mail, CRM, analytics, envio de formulário ou serviço externo.
- Logos de clientes, depoimentos, métricas de impacto, certificações ou claims não documentados.
- Páginas individuais para todas as 16 capacidades.
- CMS, autenticação, persistência, área do cliente, orçamento automático ou agendamento.
- Personalização baseada em rastreamento.

## 2. Princípios de experiência e voz

1. **Clareza antes do efeito.** Conteúdo e CTA existem em HTML e funcionam sem canvas ou JavaScript.
2. **A conexão tem consequência.** Linhas, nós e transições só aparecem quando representam relação, dependência, decisão ou progresso.
3. **Amplitude com uma entrada.** As capacidades mostram alcance; o diagnóstico continua sendo a porta principal.
4. **Confiança por transparência.** Nomear hipótese, limitação e demonstração é parte da marca.
5. **Tecnologia com direção humana.** A linguagem descreve células digitais e aprovações humanas sem antropomorfizar agentes.
6. **Editorial, não promocional.** Frases diretas, verbos ativos, sentence case, poucos adjetivos e nenhuma urgência artificial.
7. **Um gesto expressivo.** O Signal concentra movimento e ousadia; os demais módulos são calmos e legíveis.

## 3. Arquitetura da informação

### Rotas da primeira fatia

```text
/pt-br
  #inicio
  #como-ajudamos
  #capacidades
  #processo
  #labs
  #insights
  #diagnostico
/en
  equivalent anchors translated only in accessible labels, not in fragment URLs
/pt-br/insights/como-tirar-uma-ideia-do-campo-da-incerteza
/en/insights/from-uncertainty-to-a-buildable-software-project
```

Os artigos iniciais podem nascer em MDX. A homepage mostra três pautas editoriais, mas apenas a pauta implementada deve ser um link; itens ainda não publicados recebem “Em preparação / In development” e não usam links vazios.

### Hierarquia da homepage

1. **Header:** wordmark, navegação, idioma e CTA.
2. **Hero / Signal:** promessa, apoio, CTA e narrativa em quatro estados.
3. **Como ajudamos:** explicação curta e transformação `fricção → sistema`.
4. **Capacidades:** quatro grupos conectados, com 16 capacidades.
5. **Processo:** Mapear, Desenhar, Construir e Evoluir.
6. **Severius Labs:** demonstrações conceituais, claramente rotuladas.
7. **Insights:** conteúdo inicial e pauta editorial.
8. **Diagnóstico:** expectativa, formulário local e estado de indisponibilidade de envio.
9. **Footer:** navegação, idiomas, declaração institucional e ressalva de não publicação.

## 4. Wireframes

### Desktop — grade assimétrica de 12 colunas

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Severius       Trabalho  Capacidades  Processo  Insights   PT/EN   [CTA]│
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Transformamos ideias e                ·       ·                         │
│  operações em software                    ╲  ──●──  Severius Signal     │
│  seguro, útil e preparado              ·──╲──·                           │
│  para evoluir.                     [estado: sinais → impacto]             │
│  Apoio curto                                                            │
│  [Solicitar diagnóstico]  Como trabalhamos                              │
│                                                                          │
├──────────────────────────── espinha ─────────────────────────────────────┤
│  FRICÇÃO (3–5 cols)         │       SISTEMA (6–7 cols)                  │
│  sinais sem relação         │       decisões + produto + evolução       │
│                             │                                             │
│  contexto ── critério ── incremento ── evidência                         │
├──────────────────────────────────────────────────────────────────────────┤
│  Capacidades                        [Definir]                             │
│  um campo, não 16 cartões      ─────[Construir]─────                     │
│                                      [Conectar]                          │
│                                 ─────[Evoluir]                           │
├──────────────────────────────────────────────────────────────────────────┤
│  1 Mapear ───── 2 Desenhar ───── 3 Construir ───── 4 Evoluir            │
│  etapas sequenciais; artefato e critério em cada uma                     │
├──────────────────────────────────────────────────────────────────────────┤
│  Severius Labs [rótulo persistente]                                      │
│  demonstração dominante (7 cols)    duas notas empilhadas (4 cols)       │
├──────────────────────────────────────────────────────────────────────────┤
│  Insights: título editorial grande   pauta/data/status                    │
├──────────────────────────────────────────────────────────────────────────┤
│  Solicitar diagnóstico              │ formulário curto                    │
│  O que acontece depois              │ nome / contato / contexto / consent.│
│                                     │ [Preparar solicitação]               │
└──────────────────────────────────────────────────────────────────────────┘
```

Alinhamento: títulos e corpo à esquerda. Centralização apenas no núcleo do Signal, nunca para blocos de leitura. A espinha ocupa uma coluna e pode desviar para conectar títulos e estados; não deve atravessar texto.

### Mobile — uma coluna, sinal como panorama

```text
┌──────────────────────────────┐
│ Severius        Menu   PT/EN │
│                              │
│ Transformamos ideias e       │
│ operações em software…       │
│ apoio                        │
│ [Solicitar diagnóstico]      │
│                              │
│  ·  ──●── ·                 │
│ [Signal 16:10, não pinado]   │
│ Sinais  Rotas  Sistemas  …   │
├──────────────────────────────┤
│ Da fricção ao sistema        │
│ fluxo vertical               │
├──────────────────────────────┤
│ Capacidades                  │
│ Definir        4 itens       │
│ Construir      4 itens       │
│ Conectar       4 itens       │
│ Evoluir        4 itens       │
├──────────────────────────────┤
│ Mapear → Desenhar →          │
│ Construir → Evoluir          │
├──────────────────────────────┤
│ Severius Labs                │
│ demonstrações, uma por vez   │
├──────────────────────────────┤
│ Insights                     │
├──────────────────────────────┤
│ Diagnóstico + formulário     │
└──────────────────────────────┘
```

No mobile não há pinagem. A navegação aberta ocupa uma camada controlada, retém foco apenas enquanto estiver aberta e fecha por `Esc`, botão explícito, seleção ou retorno do foco.

## 5. Copy completa — PT-BR

### Metadados

- **Title:** Severius — software seguro, útil e preparado para evoluir
- **Description:** Consultoria de tecnologia e estúdio de software AI-native para criar e modernizar produtos, sistemas e operações digitais.
- **OG title:** Severius — da ideia ao software que evolui
- **OG description:** Estratégia, design, engenharia e segurança conectados em projetos de software com direção clara.

### Navegação

- Marca: **Severius**
- Trabalho
- Capacidades
- Processo
- Insights
- Seletor: **Idioma: Português. Alterar para inglês**
- CTA: **Solicitar diagnóstico**
- Menu mobile: **Abrir menu** / **Fechar menu**
- Skip link: **Ir para o conteúdo**

### Hero

**H1**  
Transformamos ideias e operações em software seguro, útil e preparado para evoluir.

**Apoio**  
Estratégia, design, engenharia e segurança trabalhando como um só sistema — do diagnóstico ao próximo incremento útil.

**CTA primário**  
Solicitar diagnóstico

**Link secundário**  
Entender como trabalhamos

**Rótulo acessível do Signal**  
Visualização abstrata do método Severius: sinais dispersos se conectam em rotas, sistemas e impacto.

**Estados visíveis da narrativa**

- Sinais — Contexto ainda fragmentado.
- Rotas — Decisões ganham direção.
- Sistemas — Produto, dados e operação trabalham juntos.
- Impacto — O sistema aprende e evolui com evidência.

### Como ajudamos / Da fricção ao sistema

**H2**  
Software começa com uma decisão bem definida.

**Texto**  
Antes de escolher ferramentas, conectamos o problema, o resultado esperado, os riscos e a forma de verificar o avanço. Isso transforma uma demanda ampla em um projeto que pode ser entendido, construído e melhorado.

**Fluxo**

- **Contexto:** o que precisa mudar e para quem.
- **Critério:** como reconhecer uma entrega útil.
- **Incremento:** a menor solução capaz de gerar aprendizado confiável.
- **Evidência:** testes, observação e decisões registradas.

**Nota factual**  
A Severius usa células de agentes especializados para executar o trabalho. O fundador mantém a direção, aprova decisões críticas e responde pelo relacionamento com o cliente.

### Capacidades

**H2**  
Quatro movimentos, as capacidades certas para cada projeto.

**Apoio**  
Nem todo projeto precisa de tudo. A célula é formada a partir do problema, do risco e do resultado esperado.

**Definir**  
Dar forma ao problema antes de ampliar a solução.

- Estratégia de IA e software
- Descoberta de produto
- Pesquisa de experiência e service design
- Arquitetura de solução

**Construir**  
Entregar produtos digitais com escopo e critérios explícitos.

- Sites e landing pages
- Aplicações web
- Produtos SaaS
- Plataformas e ferramentas internas

**Conectar**  
Fazer sistemas, dados e fluxos trabalharem em conjunto.

- Agentes e copilotos de IA
- Automação de fluxos
- Busca semântica, RAG e bases de conhecimento
- APIs, integrações e dados

**Evoluir**  
Observar o uso, reduzir riscos e melhorar o que importa.

- Analytics e experimentação
- CRO, SEO, GEO e AEO
- Segurança, privacidade e observabilidade
- Operação e melhoria contínua de produto

**CTA contextual**  
Começar pelo diagnóstico

### Processo

**H2**  
Do contexto ao próximo incremento útil.

**1. Mapear**  
Entender o contexto, as pessoas envolvidas, o risco, as evidências disponíveis e o objetivo.  
**Saída:** brief e hipóteses explícitas.

**2. Desenhar**  
Alinhar experiência, arquitetura, escopo e critérios de sucesso antes de multiplicar decisões.  
**Saída:** solução proposta e critérios de aceite.

**3. Construir**  
Entregar em fatias verificáveis, com revisão independente de qualidade e segurança.  
**Saída:** incremento funcional e pacote de evidências.

**4. Evoluir**  
Observar o uso, comparar resultado e hipótese e decidir o que manter, ajustar ou encerrar.  
**Saída:** aprendizado e próxima decisão.

**Nota**  
Aprovação técnica não substitui aprovação comercial, de risco ou de publicação.

### Severius Labs

**Rótulo**  
Severius Labs — demonstrações conceituais, não projetos de clientes

**H2**  
Explorações para tornar decisões técnicas visíveis.

**Apoio**  
Estes cenários demonstram raciocínio, interação e arquitetura. Não representam contratos, clientes ou resultados obtidos.

**Demonstração 1 — Pulso operacional**  
Um protótipo de painel que transforma eventos dispersos de uma operação em sinais priorizados, com origem e contexto preservados.  
**Explora:** integração de dados, interface operacional e observabilidade.  
**Status:** conceito em desenvolvimento.

**Demonstração 2 — Brief vivo**  
Uma exploração de como requisitos, decisões e evidências podem permanecer ligados durante um projeto de software.  
**Explora:** produto, governança leve e colaboração com IA.  
**Status:** conceito em desenvolvimento.

**Demonstração 3 — Conhecimento com fonte**  
Um fluxo de busca assistida que mantém a origem da informação visível e sinaliza quando não há evidência suficiente.  
**Explora:** RAG, experiência de IA e guardrails.  
**Status:** conceito em desenvolvimento.

### Insights

**H2**  
Decisões de produto e tecnologia, explicadas com contexto.

**Artigo inicial implementável**  
Como tirar uma ideia do campo da incerteza  
Um roteiro para transformar uma intenção ampla em problema, critério e primeiro incremento verificável.  
**Tema:** Produto e estratégia  
**CTA:** Ler insight

**Pauta 2**  
O que precisa existir antes de adicionar IA a uma operação  
Dados, responsabilidade, fallback e avaliação antes do modelo.  
**Status:** Em preparação

**Pauta 3**  
Segurança como parte da definição de produto  
Como riscos e critérios de aceite mudam uma solução antes do código.  
**Status:** Em preparação

### Diagnóstico e formulário

**H2**  
Comece com o contexto, não com uma lista de funcionalidades.

**Texto**  
Conte o que precisa mudar, onde existe atrito e o que seria um resultado útil. O primeiro passo é organizar o cenário e verificar se um diagnóstico da Severius faz sentido.

**O que acontece depois**

1. A Severius lê o contexto e identifica as principais perguntas.
2. Se houver aderência, o próximo passo e o escopo do diagnóstico são alinhados.
3. Nenhum projeto, prazo ou investimento é assumido sem aprovação explícita.

**Aviso da versão local**  
O envio ainda não está habilitado. Nesta prévia, seus dados permanecem no navegador e são descartados ao recarregar a página. Depois de validar os campos, você poderá copiar um resumo para usar no canal aprovado futuramente.

**Campos**

- Nome — obrigatório; ajuda a personalizar o retorno.
- Como podemos responder? — obrigatório; placeholder: `seu e-mail ou outro canal que você prefira`.
- Contexto — obrigatório; prompt: `O que você quer criar ou modernizar? Onde está o principal atrito?`.
- Momento do projeto — opcional: Explorando / Definindo / Pronto para começar / Em andamento.
- Consentimento local — obrigatório: `Entendo que esta prévia não envia meus dados. Quero preparar um resumo local da solicitação.`

**Botão**  
Preparar solicitação

**Ajuda de privacidade**  
Não inclua senhas, chaves, dados de cartão, documentos pessoais ou informações confidenciais de clientes.

**Sucesso local**  
Resumo preparado. Nada foi enviado. Revise o conteúdo antes de copiá-lo.

**Ações no sucesso**  
Copiar resumo / Editar respostas

**Confirmação de cópia**  
Resumo copiado para a área de transferência.

**Erro geral**  
Revise os campos indicados para preparar a solicitação.

**Erros de campo**

- Nome: Informe como devemos chamar você.
- Contato: Informe um canal de resposta válido, com no máximo 160 caracteres.
- Contexto vazio: Conte, em poucas palavras, o que você quer criar ou modernizar.
- Contexto longo: Resuma o contexto em até 1.500 caracteres.
- Consentimento: Confirme que entendeu como esta prévia trata os dados.
- Falha ao copiar: Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.

**Estado de processamento**  
Preparando resumo…

### Estados globais

- Carregamento do Signal: **Preparando visualização. O conteúdo já está disponível abaixo.**
- Falha do Signal: **A visualização interativa não está disponível. Esta versão estática apresenta a mesma narrativa.**
- Erro de página: **Não foi possível carregar esta página. Tente novamente.** / **Tentar novamente**
- Conteúdo não encontrado: **Esta página não foi encontrada.** / **Voltar ao início**

### Footer

**Severius**  
Consultoria de tecnologia e estúdio de software AI-native.

Transformamos ideias e operações em software seguro, útil e preparado para evoluir.

Links: Trabalho · Capacidades · Processo · Insights · Solicitar diagnóstico · English

**Nota**  
Esta é uma prévia privada. Nenhum formulário envia dados e nenhuma relação comercial é criada por esta página.

## 6. Full copy — English adaptation

The English version keeps the meaning and restraint of the source while using vocabulary natural to product and technology leaders.

### Metadata

- **Title:** Severius — secure, useful software built to evolve
- **Description:** An AI-native technology consultancy and software studio for building and modernizing digital products, systems and operations.
- **OG title:** Severius — from a promising idea to software that evolves
- **OG description:** Strategy, design, engineering and security connected through a clear software delivery process.

### Navigation

- Work
- Capabilities
- Process
- Insights
- Language control: **Language: English. Switch to Portuguese**
- CTA: **Request a diagnostic**
- Mobile: **Open menu** / **Close menu**
- Skip link: **Skip to content**

### Hero

**H1**  
We turn ideas and operations into secure, useful software built to evolve.

**Supporting copy**  
Strategy, design, engineering and security working as one system — from the initial diagnostic to the next useful release.

**Primary CTA:** Request a diagnostic  
**Secondary link:** See how we work

**Accessible Signal label**  
An abstract view of the Severius method: scattered signals connect into routes, systems and measurable impact.

- Signals — The context is still fragmented.
- Routes — Decisions gain direction.
- Systems — Product, data and operations work together.
- Impact — The system learns and evolves through evidence.

### How we help / From friction to a working system

**H2**  
Software starts with a well-defined decision.

**Body**  
Before choosing tools, we connect the problem, the desired outcome, the risks and the way progress will be verified. This turns a broad request into a project that can be understood, built and improved.

- **Context:** what needs to change and for whom.
- **Criteria:** how we will recognize a useful outcome.
- **Increment:** the smallest solution that can produce reliable learning.
- **Evidence:** tests, observation and recorded decisions.

**Factual note**  
Severius uses specialist agent teams to execute the work. The founder provides direction, approves critical decisions and remains accountable for the client relationship.

### Capabilities

**H2**  
Four movements, with the right capabilities for each project.

**Supporting copy**  
Not every project needs everything. Each team is shaped by the problem, risk and intended outcome.

**Define** — Shape the problem before expanding the solution.

- AI and software strategy
- Product discovery
- Experience research and service design
- Solution architecture

**Build** — Deliver digital products with explicit scope and acceptance criteria.

- Websites and landing pages
- Web applications
- SaaS products
- Platforms and internal tools

**Connect** — Make systems, data and workflows operate together.

- AI agents and copilots
- Workflow automation
- Semantic search, RAG and knowledge bases
- APIs, integrations and data

**Evolve** — Observe usage, reduce risk and improve what matters.

- Analytics and experimentation
- CRO, SEO, GEO and AEO
- Security, privacy and observability
- Product operations and continuous improvement

**Contextual CTA:** Start with a diagnostic

### Process

**H2**  
From context to the next useful release.

**1. Map**  
Understand the context, the people involved, the risks, the available evidence and the intended outcome.  
**Output:** a brief with explicit assumptions.

**2. Design**  
Align the experience, architecture, scope and success criteria before multiplying decisions.  
**Output:** a proposed solution and acceptance criteria.

**3. Build**  
Deliver verifiable slices, with independent quality and security review.  
**Output:** a working increment and evidence bundle.

**4. Evolve**  
Observe usage, compare outcomes with assumptions, and decide what to keep, adjust or stop.  
**Output:** learning and a next decision.

**Note**  
Technical approval does not replace commercial, risk or publication approval.

### Severius Labs

**Label**  
Severius Labs — conceptual demonstrations, not client work

**H2**  
Explorations that make technical decisions visible.

**Supporting copy**  
These scenarios demonstrate reasoning, interaction and architecture. They do not represent contracts, clients or achieved results.

**Operational pulse**  
A dashboard concept that turns scattered operational events into prioritized signals while preserving their source and context.  
**Explores:** data integration, operational interfaces and observability.  
**Status:** concept in development.

**Living brief**  
An exploration of how requirements, decisions and evidence can stay connected throughout a software project.  
**Explores:** product, lightweight governance and AI collaboration.  
**Status:** concept in development.

**Source-aware knowledge**  
An assisted search flow that keeps information sources visible and signals when evidence is insufficient.  
**Explores:** RAG, AI experience and guardrails.  
**Status:** concept in development.

### Insights

**H2**  
Product and technology decisions, explained in context.

**Initial article**  
From uncertainty to a buildable software project  
A practical path from a broad intention to a defined problem, clear criteria and a first verifiable release.  
**Topic:** Product and strategy  
**CTA:** Read the insight

**Planned topic 2**  
What needs to be in place before adding AI to an operation  
Data, accountability, fallbacks and evaluation before the model.  
**Status:** In development

**Planned topic 3**  
Security as a product definition practice  
How risk and acceptance criteria shape a solution before code.  
**Status:** In development

### Diagnostic and form

**H2**  
Start with the context, not a feature list.

**Body**  
Tell us what needs to change, where the friction is and what a useful outcome would look like. The first step is to organize the situation and determine whether a Severius diagnostic is a good fit.

**What happens next**

1. Severius reviews the context and identifies the main questions.
2. If there is a fit, we align on the next step and the scope of the diagnostic.
3. No project, timeline or investment is assumed without explicit approval.

**Local preview notice**  
Submission is not enabled yet. In this preview, your data stays in the browser and is discarded when the page reloads. Once the fields are valid, you can copy a summary to use through an approved channel in the future.

**Fields**

- Name — required; helps us address you properly.
- How can we reply? — required; placeholder: `your email or another channel you prefer`.
- Context — required; prompt: `What do you want to build or modernize? Where is the main friction?`.
- Project stage — optional: Exploring / Defining / Ready to start / In progress.
- Local consent — required: `I understand that this preview does not send my data. I want to prepare a local summary of my request.`

**Button:** Prepare request

**Privacy help**  
Do not include passwords, keys, payment card data, personal documents or confidential client information.

**Local success**  
Summary prepared. Nothing was sent. Review the content before copying it.

**Actions:** Copy summary / Edit answers  
**Copy confirmation:** Summary copied to the clipboard.  
**General error:** Review the indicated fields to prepare your request.  
**Processing:** Preparing summary…

**Field errors**

- Name: Tell us what we should call you.
- Contact: Enter a valid reply channel using no more than 160 characters.
- Empty context: Briefly describe what you want to build or modernize.
- Long context: Keep the context to 1,500 characters or fewer.
- Consent: Confirm that you understand how this preview handles your data.
- Clipboard: Automatic copying was not available. Select the text and copy it manually.

### Global states and footer

- Signal loading: **Preparing the visualization. The content is already available below.**
- Signal fallback: **The interactive visualization is unavailable. This static version presents the same story.**
- Page error: **This page could not be loaded. Try again.** / **Try again**
- Not found: **This page could not be found.** / **Back to home**

**Footer**  
Severius  
An AI-native technology consultancy and software studio.  
We turn ideas and operations into secure, useful software built to evolve.  
Links: Work · Capabilities · Process · Insights · Request a diagnostic · Português

**Note**  
This is a private preview. No form data is sent, and this page does not create a commercial relationship.

## 7. Sistema visual e tokens

### Cores

| Token | Valor | Papel |
|---|---:|---|
| `carbon` | `#0D1012` | campo principal, hero e rodapé |
| `graphite` | `#191E22` | profundidade e superfícies escuras |
| `cloud` | `#EDF1F3` | fundo editorial e texto em campo escuro |
| `ink` | `#151A1D` | texto em fundo claro; evita usar Carbon como decoração |
| `ion` | `#70C7FF` | foco, conexão ativa, link e sinal informativo |
| `copper` | `#E08B5B` | origem humana, ponto de decisão e aviso não crítico |
| `danger` | `#C94A4A` | erro textual/ícone; sempre acompanhado de mensagem |
| `muted-dark` | `#A9B3B8` | texto secundário no escuro, sujeito a validação AA |
| `muted-light` | `#526068` | texto secundário no claro, sujeito a validação AA |

Ion e Copper nunca viram fundos grandes nem gradientes decorativos. No Signal, Ion representa relação que ganhou clareza; Copper marca origem, decisão humana ou exceção. O foco usa `2px ion + 3px carbon/cloud` para permanecer visível nos dois campos.

### Tipografia

- **Família principal:** Recursive Variable local, condicionada à confirmação de licença e arquivos. Fallback: `Arial Variable`, `Arial`, sans-serif.
- **Corpo:** eixo casual baixo, mono 0, peso 400–500; aparência editorial, não terminal.
- **Display:** peso 520–650, `CASL` moderado, largura normal; sem colorir uma palavra isolada.
- **Dados/rótulos funcionais:** a mesma Recursive com `MONO` discreto apenas para estados do Signal e metadados reais; não usar caixa alta rastreada.
- **Escala fluida:** `step--1 0.875rem`; `step-0 1rem`; `step-1 clamp(1.2rem,1.4vw,1.38rem)`; `step-2 clamp(1.5rem,2.4vw,2.1rem)`; `step-3 clamp(2rem,4vw,3.6rem)`; `step-4 clamp(2.75rem,7vw,6.8rem)`.
- Corpo: line-height `1.55–1.7`, medida ideal `62–72ch`. Hero: `0.92–1.02`, máximo aproximado de 13–15 caracteres por linha no desktop.

### Espaço, grade e forma

- Unidade: `4px`; sequência principal `4, 8, 12, 16, 24, 32, 48, 72, 104, 144`.
- Container: `min(100% - 32px, 1440px)`; desktop com 12 colunas e gutters de `24–32px`; tablet 8; mobile 4.
- Ritmo de seção: `clamp(72px, 11vw, 168px)`.
- Raio: `0` para divisores/diagramas; `8px` para campos e controles; `16px` apenas para viewport do Signal quando necessário. Não aplicar um raio universal.
- Borda: `1px` com contraste funcional; linhas do campo usam opacidade baixa e nunca substituem separação semântica.
- Sombra: nenhuma no sistema base. Profundidade do Signal vem de escala, luminosidade e sobreposição controlada.
- Alvo mínimo: `44 × 44px`; controles principais `48px` de altura.

### Movimento

- Durações de UI: `120ms` imediato, `220ms` padrão, `420ms` transição narrativa curta.
- Easing de UI: `cubic-bezier(.2,.8,.2,1)`; a cena pode usar interpolação física suave, sem overshoot ornamental.
- Um único momento coreografado: os quatro estados do Signal durante o primeiro trecho da página.
- Nada entra com o padrão repetitivo fade-and-slide em todas as seções. Conteúdo pode simplesmente estar presente; mudanças de estado respondem a scroll ou ação.
- `prefers-reduced-motion` elimina interpolação espacial, pinagem e paralaxe; feedback funcional pode usar mudança instantânea ou opacidade curta até `120ms`.

## 8. Severius Signal — especificação conceitual

### Gramática visual

- **Sinal:** ponto com pulso único e halo curto; representa uma observação ainda sem relação.
- **Rota:** segmento que nasce somente entre sinais associados; não é uma malha aleatória.
- **Nó:** decisão, dependência ou interface entre sistemas.
- **Módulo:** pequena região delimitada por três ou mais relações estáveis; representa produto/processo.
- **Traço humano:** ponto Copper que não é absorvido pela rede; ele muda o caminho e permanece identificável.
- **Forma final:** duas correntes complementares sugerem um “S” sem desenhar logotipo literal. A forma nunca deve parecer globo, cérebro, átomo ou túnel de partículas.

### Progressão narrativa

1. **Sinais (0–25%)** — 18–28 pontos ocupam o campo de forma assimétrica. Três pulsos chamam atenção para informações desconectadas; a câmera está quase estática.
2. **Rotas (25–50%)** — relações aparecem por proximidade semântica predeterminada, não por ruído procedural. Linhas incompletas se resolvem; algumas rotas são descartadas.
3. **Sistemas (50–75%)** — grupos ganham limites tênues, trocam pequenos pacotes de luz e deixam explícito que conexão inclui interfaces, não fusão.
4. **Impacto (75–100%)** — a rede se estabiliza em duas curvas que sugerem “S”; o ponto Copper atravessa o centro e a energia se distribui. O CTA permanece fora do canvas, em HTML.

Cada estado atualiza uma legenda curta com `aria-live="off"`; a descrição completa é texto HTML vizinho. A cena é decorativa para tecnologia assistiva (`aria-hidden="true"`) quando a narrativa equivalente estiver presente.

### Modo completo

- Condições: viewport ampla, WebGL disponível, movimento não reduzido, capacidade adequada e página visível.
- 60–90 sinais, linhas com espessura constante em tela, DPR limitado, sem pós-processamento pesado.
- Progressão ligada ao scroll nativo por trecho curto; no máximo uma pinagem de aproximadamente `120–160vh` no desktop.
- Ponteiro cria uma leve alteração de campo, nunca bloqueia clique nem exige interação.
- Pausa fora da viewport e quando `document.visibilityState !== visible`.

### Modo leve

- Condições: mobile, economia de dados/capacidade, canvas com desempenho insuficiente ou escolha heurística conservadora.
- 20–36 sinais, geometrias simples, sem sombra, bloom, física ou interação com ponteiro.
- Quatro composições predefinidas interpoladas por transformações baratas; DPR máximo inferior ao modo completo.
- Sem pinagem no mobile; o panorama mostra o estado correspondente ao trecho atual e o conteúdo avança normalmente.

### Modo estático

- Condições: `prefers-reduced-motion`, WebGL indisponível, JavaScript ausente, erro de carregamento ou impressão.
- SVG original com as quatro fases organizadas como um diagrama contínuo da esquerda para a direita no desktop e de cima para baixo no mobile.
- Sem animação automática. Ion identifica relações consolidadas; Copper indica decisão humana.
- Inclui título e legenda HTML. Não é uma captura opaca do canvas e mantém contraste em high-contrast/forced-colors por meio de traços e padrões, não apenas cor.

### Seleção e fallback

```text
HTML + SVG estático são renderizados primeiro
        ↓
movimento reduzido ou sem JS/WebGL? ── sim → estático
        │ não
mobile/capacidade conservadora? ────── sim → leve
        │ não
carregar ilha 3D sob demanda ─────────────→ completo
        │ falha/queda sustentada de FPS
        └─────────────────────────────────→ leve → estático
```

O canvas ocupa uma caixa com dimensões reservadas para evitar CLS. A troca entre modos preserva o estado narrativo e nunca remove o texto ou o CTA.

## 9. Autocrítica de originalidade

### O que inicialmente parecia genérico

- Fundo quase preto com azul luminoso poderia repetir o padrão “SaaS de IA com neon”.
- Quatro grupos de capacidade poderiam virar quatro cartões idênticos.
- Uma rede de partículas poderia parecer globo, cérebro ou constelação genérica.
- O uso de labels mono e números `01/02/03/04` em toda a página seria um clichê de portfólio tecnológico.
- Uma alternância dark/light com títulos enormes poderia se aproximar de templates editoriais sem relação com a operação.

### Revisões feitas

- **Cor com semântica:** Ion não é glow decorativo; marca relação esclarecida. Copper é decisão humana/exceção. Ambos aparecem em pequenos sinais.
- **Capacidades como campo:** os grupos ocupam posições distintas ao redor de uma espinha, com itens em listas editoriais, não cards repetidos.
- **Rede com regra:** conexões nascem de relações definidas e algumas rotas são conscientemente descartadas. A forma final apenas sugere o “S”.
- **Numeração restrita:** números aparecem somente no processo, porque ali existe sequência real. Estados do Signal usam nomes.
- **Espinha funcional:** o eixo muda de posição para ligar causa, decisão, execução e evidência; não é decoração contínua por toda a página.
- **Sem acessórios excedentes:** foram removidos glassmorphism, gradientes amplos, shadows, ícones de estoque, setas automáticas em links e animações de entrada por seção.

### Teste de especificidade

Se a marca fosse trocada por outra consultoria, a combinação `sinais que viram rotas → módulos que trocam dados → traço humano que define impacto`, junto da evidência ligada à spec, deixaria de fazer sentido sem reescrita. Isso ancora a direção no modelo operacional da Severius, não apenas no setor de tecnologia.

## 10. Critérios de aceite observáveis

| ID | Critério | Evidência esperada no handoff |
|---|---|---|
| PD-01 | Promessa aprovada e CTA único aparecem com maior hierarquia no primeiro viewport e no encerramento. | Capturas desktop/mobile e inspeção do HTML. |
| PD-02 | Nenhuma prova, cliente, número, domínio, e-mail ou resultado foi inventado. | Revisão de conteúdo por busca e Evidence Validator. |
| PD-03 | Severius Labs é identificado como demonstração conceitual antes de qualquer cenário. | Captura e leitura por tecnologia assistiva. |
| PD-04 | As 16 capacidades aparecem nos quatro grupos corretos, sem virar 16 promessas independentes. | Teste de conteúdo e inspeção visual. |
| PD-05 | A página é compreensível e acionável sem JS, WebGL ou canvas. | Execução com JS desativado e screenshot do fallback. |
| PD-06 | Signal possui modos completo, leve e estático, e preserva a mesma narrativa. | Teste forçado de cada modo e capturas comparáveis. |
| PD-07 | `prefers-reduced-motion` remove pinagem e movimento espacial. | Teste de mídia e gravação curta/captura. |
| PD-08 | Rolagem, teclado, toque, seleção de texto, histórico e botão voltar permanecem nativos. | Teste manual reproduzível em desktop/mobile. |
| PD-09 | Navegação, heading order, foco, contraste, reflow e formulário atendem WCAG 2.2 AA no escopo. | Axe/checagem manual, teclado e leitor de tela. |
| PD-10 | Formulário valida com mensagens específicas, não transmite dados e afirma isso antes da ação. | Inspeção de rede, teste dos estados e código. |
| PD-11 | PT-BR e EN têm copy e metadados adaptados, com seletor equivalente. | Comparação de rotas, hreflang e metadata. |
| PD-12 | Conteúdo crítico/CTA não depende da cena e a caixa do canvas não causa deslocamento. | Lighthouse/trace e medição de CLS. |
| PD-13 | O método apresenta autor, revisor/evidência e aprovação humana sem tratar agentes como funcionários. | Revisão editorial independente. |
| PD-14 | Pautas não publicadas não parecem links funcionais. | Teste de links e inspeção de estados. |

## 11. Riscos e decisões abertas

| Risco/decisão | Impacto | Tratamento nesta fatia | Dono futuro |
|---|---|---|---|
| Canal real de diagnóstico indefinido | Impede envio e operação do lead | Formulário local sem transmissão; copy explícita | Fundador |
| Provas reais ainda não autorizadas | Pode reduzir confiança | Método, Labs e transparência; nunca simular caso | Fundador + conteúdo |
| Licença/arquivos da Recursive não confirmados | Pode mudar ritmo tipográfico | Confirmar antes do build; fallback definido | Frontend/Design |
| WebGL pode elevar LCP, uso de energia e falhas | Afeta experiência e metas | Progressive enhancement, orçamento e fallback | Frontend/QA |
| Linguagem ampla para três perfis iniciais | Pode reduzir especificidade | Uma dor comum e entrada única; testar depois | Product |
| “AI-native” pode sugerir automação sem responsabilidade | Risco de interpretação | Explicar células digitais + direção humana | UX Writing |
| Copiar resumo usa clipboard do dispositivo | Pode expor conteúdo por ação do usuário | Consentimento explícito e aviso para não inserir segredos | AppSec/Product |
| Métrica primária não operacional nesta prévia | Não há evidência de conversão | Definir plano, mas não coletar nem afirmar resultado | Product/Growth |
| Slugs/âncoras equivalentes no seletor | Links podem quebrar ao expandir conteúdo | Mapa explícito por locale | Frontend |
| Copy em inglês precisa de revisão nativa conforme mercado | Nuance pode não corresponder ao primeiro mercado externo | Tratar como adaptação v1 e revisar antes de publicação | Localization humano |

### Decisões que exigem aprovação antes de produção, não antes do preview local

- domínio, e-mail e canal de resposta;
- finalidade, base, retenção, acesso e descarte dos dados do formulário;
- serviço de envio/CRM e fornecedores;
- provas reais autorizadas;
- analytics, consentimento e métrica operacional;
- arquivos/licença definitiva da fonte;
- conteúdo final e autorização específica de publicação.

## 12. Handoff e pacote de evidências desta etapa

- **Spec usada:** `PD-001 v1.0`, baseada em `AGENTS.md`, docs `00`, `02`, `03`, `08`, `10`, `11`, `12` e `PROMPT-MESTRE`.
- **Artefato:** `work/product-design.md`.
- **Critérios cobertos nesta etapa:** arquitetura, copy PT-BR/EN, estados de UI, formulário local, tokens, Signal nos três modos, originalidade, riscos e critérios de aceite.
- **Limitações:** não houve protótipo visual em runtime, teste de contraste computado, leitor de tela ou teste de usabilidade; essas evidências dependem da implementação.
- **Hipóteses abertas:** clareza do CTA, entendimento da amplitude, valor das demonstrações e aderência da adaptação inglesa.
- **Revisão independente pendente:** Evidence Validator deve comparar a implementação e o conteúdo renderizado com `PD-01` a `PD-14`.
- **Próximo responsável:** Frontend, com Brand/Product disponíveis para revisão visual; QA e AppSec revisam de forma independente.
- **Aprovação humana pendente:** conteúdo, fonte final e qualquer publicação/coleta real.

