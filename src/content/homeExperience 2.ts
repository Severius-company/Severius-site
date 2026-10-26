import type { Locale } from '@/lib/i18n'

export type ExperienceCopy = {
  loader: string
  hero: { eyebrow: string; title: string; body: string; primary: string; secondary: string; signal: string }
  manifesto: { eyebrow: string; title: string; body: string; notes: string[] }
  services: {
    eyebrow: string
    title: string
    body: string
    menuLabel: string
    menuDescription: string
    items: { id: string; number: string; title: string; body: string; tags: string[] }[]
  }
  pipeline: {
    eyebrow: string
    title: string
    body: string
    demo: string
    instruction: string
    moveTo: string
    columns: string[]
    items: { id: string; title: string; meta: string; column: number }[]
  }
  work: { eyebrow: string; title: string; disclaimer: string; all: string }
  method: {
    eyebrow: string
    title: string
    body: string
    steps: { number: string; title: string; body: string; output: string }[]
  }
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] }
}

const pt: ExperienceCopy = {
  loader: 'Preparando a experiência Severius',
  hero: {
    eyebrow: 'Fábrica de software · SaaS · CRM · IA',
    title: 'Tecnologia que desenrola operações complexas.',
    body: 'Projetamos, construímos e evoluímos produtos digitais que conectam estratégia, software e crescimento — do primeiro fluxo à escala.',
    primary: 'Começar um projeto',
    secondary: 'Explorar capacidades',
    signal: 'Disponível para novos desafios',
  },
  manifesto: {
    eyebrow: 'Não entregamos só telas',
    title: 'Entramos no problema, organizamos o caos e transformamos processos em software útil.',
    body: 'A Severius une produto, engenharia e operação para criar sistemas que as pessoas entendem, adotam e conseguem evoluir.',
    notes: ['Estratégia antes do código', 'Interfaces que explicam o processo', 'Arquitetura preparada para continuar'],
  },
  services: {
    eyebrow: 'O que colocamos em movimento',
    title: 'Capacidades que trabalham juntas.',
    body: 'Cada frente pode começar pequena e crescer com o produto. A corda visual representa esse fluxo contínuo entre negócio, experiência e engenharia.',
    menuLabel: 'Capacidades',
    menuDescription: 'Da descoberta à operação, construímos a camada digital que o seu negócio precisa.',
    items: [
      { id: 'software', number: '01', title: 'Software sob medida', body: 'Plataformas web e mobile alinhadas ao processo real da sua operação.', tags: ['Web apps', 'Mobile', 'Portais'] },
      { id: 'saas', number: '02', title: 'Produtos SaaS', body: 'Da validação ao lançamento, com arquitetura, billing e evolução orientada por uso.', tags: ['MVP', 'Produto', 'Escala'] },
      { id: 'crm', number: '03', title: 'CRM & automação', body: 'Fluxos comerciais e operacionais integrados para reduzir trabalho repetitivo.', tags: ['Pipeline', 'Integrações', 'Dados'] },
      { id: 'ai', number: '04', title: 'IA aplicada', body: 'Agentes, copilotos e automações com contexto, governança e impacto mensurável.', tags: ['Agentes', 'RAG', 'Workflows'] },
    ],
  },
  pipeline: {
    eyebrow: 'Software que dá para sentir',
    title: 'Um pipeline vivo, antes mesmo da primeira reunião.',
    body: 'Interfaces devem tornar o trabalho claro. Mova os cards e experimente um fluxo operacional simplificado.',
    demo: 'Demonstração interativa — dados e oportunidades são fictícios.',
    instruction: 'Arraste com o ponteiro ou use os botões para mover uma oportunidade.',
    moveTo: 'Mover {item} para {column}',
    columns: ['Entrada', 'Em descoberta', 'Em construção'],
    items: [
      { id: 'atlas', title: 'Portal Atlas', meta: 'Integração · prioridade alta', column: 0 },
      { id: 'nexus', title: 'CRM Nexus', meta: 'Automação · diagnóstico', column: 0 },
      { id: 'orbit', title: 'SaaS Orbit', meta: 'Produto · sprint 02', column: 1 },
      { id: 'pulse', title: 'Copiloto Pulse', meta: 'IA · protótipo', column: 2 },
    ],
  },
  work: {
    eyebrow: 'Projetos selecionados',
    title: 'Referências demonstrativas',
    disclaimer: 'Os projetos abaixo são conceitos demonstrativos para apresentar possibilidades de produto e interface. Não representam clientes ou resultados comerciais da Severius.',
    all: 'Ver todas as referências',
  },
  method: {
    eyebrow: 'Como construímos',
    title: 'Método sem caixa-preta.',
    body: 'Decisões visíveis, ciclos curtos e conhecimento que fica com o seu time.',
    steps: [
      { number: '01', title: 'Imersão', body: 'Mapeamos contexto, riscos, dados e o trabalho que o software precisa destravar.', output: 'Saída: mapa de oportunidade' },
      { number: '02', title: 'Direção', body: 'Priorizamos fluxos, prototipamos hipóteses e definimos critérios objetivos de sucesso.', output: 'Saída: protótipo validável' },
      { number: '03', title: 'Construção', body: 'Design e engenharia avançam juntos, com entregas verificáveis em cada ciclo.', output: 'Saída: produto operacional' },
      { number: '04', title: 'Evolução', body: 'Medimos uso, removemos atrito e ampliamos o produto com segurança.', output: 'Saída: roadmap vivo' },
    ],
  },
  faq: {
    eyebrow: 'Perguntas frequentes',
    title: 'Antes de começarmos.',
    items: [
      { q: 'A Severius trabalha com produtos que já existem?', a: 'Sim. Podemos entrar para diagnosticar, redesenhar, modernizar a arquitetura ou assumir uma frente específica de evolução.' },
      { q: 'É possível começar por um MVP?', a: 'Sim. Estruturamos o menor recorte capaz de validar valor real, preservando um caminho técnico saudável para as próximas versões.' },
      { q: 'Vocês integram CRMs e ferramentas atuais?', a: 'Sim. Mapeamos sistemas, APIs, dados e regras de negócio para evitar retrabalho e construir integrações observáveis.' },
      { q: 'Como funciona a comunicação durante o projeto?', a: 'Com cadência combinada, demonstrações frequentes e decisões registradas. Você acompanha riscos, progresso e próximos passos.' },
    ],
  },
}

const en: ExperienceCopy = {
  loader: 'Preparing the Severius experience',
  hero: {
    eyebrow: 'Software factory · SaaS · CRM · AI',
    title: 'Technology that untangles complex operations.',
    body: 'We design, build and evolve digital products connecting strategy, software and growth — from the first workflow to scale.',
    primary: 'Start a project', secondary: 'Explore capabilities', signal: 'Available for new challenges',
  },
  manifesto: {
    eyebrow: 'We deliver more than screens',
    title: 'We enter the problem, organise the chaos and turn processes into useful software.',
    body: 'Severius brings product, engineering and operations together to build systems people understand, adopt and can keep evolving.',
    notes: ['Strategy before code', 'Interfaces that explain the process', 'Architecture built to continue'],
  },
  services: {
    eyebrow: 'What we set in motion', title: 'Capabilities that work together.',
    body: 'Each stream can start small and grow with the product. The visual rope represents the continuous flow between business, experience and engineering.',
    menuLabel: 'Capabilities', menuDescription: 'From discovery to operations, we build the digital layer your business needs.',
    items: [
      { id: 'software', number: '01', title: 'Custom software', body: 'Web and mobile platforms aligned with how your operation actually works.', tags: ['Web apps', 'Mobile', 'Portals'] },
      { id: 'saas', number: '02', title: 'SaaS products', body: 'From validation to launch, with architecture, billing and usage-led evolution.', tags: ['MVP', 'Product', 'Scale'] },
      { id: 'crm', number: '03', title: 'CRM & automation', body: 'Connected sales and operational flows that reduce repetitive work.', tags: ['Pipeline', 'Integrations', 'Data'] },
      { id: 'ai', number: '04', title: 'Applied AI', body: 'Agents, copilots and automation with context, governance and measurable impact.', tags: ['Agents', 'RAG', 'Workflows'] },
    ],
  },
  pipeline: {
    eyebrow: 'Software you can feel', title: 'A living pipeline, before the first meeting.',
    body: 'Interfaces should make work clear. Move the cards and try a simplified operational flow.',
    demo: 'Interactive demonstration — all opportunities and data are fictional.',
    instruction: 'Drag with a pointer or use the buttons to move an opportunity.',
    moveTo: 'Move {item} to {column}',
    columns: ['Inbox', 'Discovery', 'In progress'],
    items: [
      { id: 'atlas', title: 'Atlas Portal', meta: 'Integration · high priority', column: 0 },
      { id: 'nexus', title: 'Nexus CRM', meta: 'Automation · diagnosis', column: 0 },
      { id: 'orbit', title: 'Orbit SaaS', meta: 'Product · sprint 02', column: 1 },
      { id: 'pulse', title: 'Pulse Copilot', meta: 'AI · prototype', column: 2 },
    ],
  },
  work: { eyebrow: 'Selected projects', title: 'Demonstration references', disclaimer: 'The projects below are demonstration concepts showing product and interface possibilities. They do not represent Severius clients or commercial outcomes.', all: 'See all references' },
  method: {
    eyebrow: 'How we build', title: 'A method without a black box.', body: 'Visible decisions, short cycles and knowledge that stays with your team.',
    steps: [
      { number: '01', title: 'Immersion', body: 'We map context, risks, data and the work software needs to unlock.', output: 'Output: opportunity map' },
      { number: '02', title: 'Direction', body: 'We prioritise flows, prototype hypotheses and define objective success criteria.', output: 'Output: testable prototype' },
      { number: '03', title: 'Build', body: 'Design and engineering move together, with verifiable deliveries every cycle.', output: 'Output: operational product' },
      { number: '04', title: 'Evolution', body: 'We measure usage, remove friction and expand the product safely.', output: 'Output: living roadmap' },
    ],
  },
  faq: {
    eyebrow: 'Frequently asked questions', title: 'Before we begin.',
    items: [
      { q: 'Does Severius work with existing products?', a: 'Yes. We can diagnose, redesign, modernise the architecture or take ownership of a specific evolution stream.' },
      { q: 'Can we start with an MVP?', a: 'Yes. We shape the smallest scope able to validate real value while preserving a healthy technical path for future versions.' },
      { q: 'Do you integrate current CRMs and tools?', a: 'Yes. We map systems, APIs, data and business rules to avoid rework and build observable integrations.' },
      { q: 'How does communication work during a project?', a: 'Through an agreed cadence, frequent demos and recorded decisions. You can follow risks, progress and next steps.' },
    ],
  },
}

export function getExperienceCopy(locale: Locale): ExperienceCopy {
  return locale === 'pt-br' ? pt : en
}
