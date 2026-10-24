# Plano de segurança, privacidade e observabilidade — Severius Website

**Documento:** SEC-PLAN-001  
**Versão:** 1.0  
**Data:** 2026-09-19  
**Escopo:** primeira fatia funcional do site institucional bilíngue  
**Perfil:** Next.js App Router + TypeScript; conteúdo local/MDX; formulário demonstrativo sem transmissão  
**Fontes de verdade:** `AGENTS.md`; `docs/08-SEGURANCA-E-CIBERSEGURANCA.md`; `docs/10-SITE-SEVERIUS-CONCEITO.md`; `docs/11-PROMPT-SITE-SEVERIUS.md`; `docs/12-ORQUESTRACAO-GOVERNANCA-E-EVIDENCIAS.md`; `docs/PROMPT-MESTRE.md`  
**Papéis:** Application Security e Cybersecurity/Observability  

## 1. Decisão executiva e limites

O desenho está **aprovado para implementação local, com condições**. A publicação permanece **bloqueada** até que os controles marcados como “agora” sejam implementados e demonstrados por evidências independentes. Isso não é uma aprovação de release: ainda não existe código ou runtime para revisar.

Nesta fatia, o formulário é uma demonstração de interface: pode validar e normalizar no navegador, mas **não envia, persiste, copia, registra nem apresenta como recebido** qualquer dado. Validação no cliente melhora a experiência, porém não constitui fronteira de segurança. No momento em que houver envio, um backend aprovado, validação server-side, proteção contra abuso, política de privacidade e observabilidade mínima tornam-se bloqueantes.

Não fazem parte do escopo atual: autenticação, contas, sessão, banco, upload, APIs de negócio, CRM, e-mail, analytics de terceiros, pagamentos, webhooks, CMS remoto, domínio, deploy e coleta real de leads. A adição de qualquer item reabre o threat model e o gate afetado.

## 2. Fatos, hipóteses e decisões

### Fatos

- O conteúdo essencial e o CTA devem funcionar sem WebGL e sem JavaScript.
- O site terá `/pt-br` e `/en`, conteúdo MDX versionado e uma cena cliente progressiva.
- Não há serviço externo aprovado para o formulário ou para analytics.
- Não podem existir segredos, claims inventados, dados privados de clientes ou mídia remota copiada.

### Hipóteses a validar na implementação

- Todo MDX será conteúdo confiável, revisado e versionado no repositório; não haverá MDX fornecido por visitante.
- Fontes, imagens e demais assets serão locais e terão licença registrada.
- A primeira entrega será executada em preview local/privado, sem indexação pública.
- Os únicos campos previstos são nome, e-mail profissional, contexto breve e consentimento/ciência; organização e telefone não serão pedidos sem necessidade demonstrada.

### Invariantes

- O formulário local não pode realizar `fetch`, Server Action, navegação com query string, `mailto:`, beacon, pixel ou gravação em cookie, Web Storage/IndexedDB.
- Valores de campos nunca entram em URL, logs, analytics, erros, JSON-LD, DOM via HTML cru ou evidência de teste.
- Nenhum segredo usa prefixo público ou é incluído no bundle; nesta fatia, a expectativa é **zero segredo**.
- Um estado visual de sucesso deve dizer claramente que os dados **não foram enviados** e orientar que o canal de contato ainda será configurado; não simular lead recebido.

## 3. Modelo de ameaças proporcional

### Ativos

1. Confiança e integridade da marca Severius.
2. Navegação e conteúdo bilíngue verdadeiro.
3. Disponibilidade e desempenho do site, inclusive em dispositivo limitado.
4. Dados que a pessoa digita no formulário, mesmo sem envio.
5. Código-fonte, bundle, dependências, pipeline e artefatos de build.
6. Futuras configurações de domínio, analytics, contato e deploy — ainda inexistentes.

### Atores

- visitante legítimo;
- bot ou agente automatizado;
- atacante remoto tentando injeção, supply-chain compromise, clickjacking ou exaustão de recursos;
- colaborador com acesso ao repositório;
- dependência, asset ou script comprometido;
- indexador/crawler, que não deve receber dados privados nem conteúdo de preview.

### Fronteiras de confiança e fluxo atual

```text
Arquivos confiáveis do repositório (TS/MDX/assets)
        │ build controlado
        ▼
HTML/CSS/JS servido pelo Next.js ───► navegador não confiável
                                          │
                                          ├─ cena WebGL local, sem dados
                                          └─ campos digitados
                                               │ validação local
                                               └─ estado efêmero, sem transmissão/persistência
```

O navegador e qualquer valor digitado são não confiáveis. O repositório/MDX é confiável apenas após revisão. Não existe hoje uma fronteira servidor-dados de negócio. Se um endpoint for adicionado, ele será uma nova fronteira e exigirá novo gate.

### Ameaças prioritárias e resposta

| ID | Ameaça/abuso | Impacto | Aplicável agora | Controle esperado |
|---|---|---:|---|---|
| T01 | XSS por campos, MDX, metadados ou JSON-LD | Alto | Sim | React escaping; proibir HTML cru não sanitizado; MDX confiável; serialização segura de JSON-LD; testes com caracteres hostis |
| T02 | Dependência ou script de terceiro comprometido | Alto | Sim | assets locais; lockfile; dependências mínimas/pinadas; revisão de scripts/licenças; CSP; scanner e triagem |
| T03 | Segredo ou dado privado no código/bundle/source map | Alto | Sim | expectativa zero segredo; varredura de fonte, histórico disponível e build; source maps não públicos por padrão |
| T04 | Formulário transmite/persiste dados por engano | Alto | Sim | teste de rede e storage; sem `action`, Server Action, beacon, analytics ou URL com campos |
| T05 | Clickjacking ou incorporação maliciosa | Médio | Sim | `frame-ancestors 'none'` e `X-Frame-Options: DENY` enquanto não houver embedding aprovado |
| T06 | WebGL/animação exaure CPU/GPU/bateria | Médio | Sim | modos completo/leve/estático, DPR e partículas limitados, pausa fora da viewport, reduced motion, recuperação de contexto |
| T07 | Redirecionamento/path/locale inesperado | Médio | Sim | allowlist estrita `pt-br|en`; URLs internas construídas, não concatenadas de entrada livre |
| T08 | Injeção de log/telemetria ou vazamento de PII | Alto | Parcial | sem telemetria de lead agora; console sem valores; esquema allowlist futuro |
| T09 | Bot/spam/DoS do endpoint de contato | Médio/Alto | Não há endpoint | gate obrigatório quando backend existir: limites, rate limit e mitigação adaptativa |
| T10 | CSRF, IDOR/BOLA, abuso de sessão | Alto | Não aplicável hoje | reavaliar se houver sessão, dados persistidos, área privada ou mutação server-side |
| T11 | SSRF, SQL/NoSQL/command injection, upload/traversal | Alto | Não aplicável hoje | reavaliar com fetch server-side, banco, shell, upload ou paths de usuário |
| T12 | Coleta opaca, retenção indefinida ou consentimento inválido | Alto | Sem coleta agora | disclosure explícito agora; inventário, base/finalidade, retenção e descarte antes da coleta |
| T13 | Preview privado indexado ou acessível por engano | Médio | Sim | `noindex` no preview; acesso restrito no provedor futuro; nenhum dado real no preview |

## 4. Requisitos bloqueantes para a implementação atual

### 4.1 Entrada, normalização e renderização

- Definir um schema único compartilhado pela interface. O schema atual é de UX; quando houver backend, o servidor deve executar sua própria validação e ser a autoridade.
- Aplicar limite antes de qualquer processamento e em unidades previsíveis. Baseline a confirmar com UX: `name` 1–100, `email` 3–254, `organization` 0–120, `context` 1–1500 caracteres.
- Normalizar somente o necessário: remover espaços nas extremidades; converter CRLF/CR em LF no texto; converter o domínio do e-mail para minúsculas. Não alterar silenciosamente nome, parte local do e-mail ou texto livre.
- Rejeitar NUL e caracteres de controle, exceto LF/TAB permitidos em texto multilinha. Não tentar “limpar” payload com substituições frágeis.
- E-mail recebe validação pragmática de formato e comprimento, não uma regex excessivamente restritiva. Não fazer verificação remota nesta fase.
- Usar allowlist para locale e para qualquer enum. Campo desconhecido não deve ganhar comportamento.
- Renderizar valores apenas como texto escapado. É proibido `dangerouslySetInnerHTML` com entrada, inserção em atributos de evento, CSS, URL, `<script>` ou shader source.
- JSON-LD deve ser construído apenas de conteúdo editorial controlado e serializado com escape de `<` (por exemplo, substituição por `\\u003c`) para impedir fechamento de `<script>`.
- MDX aceita somente arquivos versionados/revisados e uma allowlist de componentes. HTML arbitrário e execução/import dinâmico originado em conteúdo não são permitidos.
- Mensagens de erro são genéricas, úteis e acessíveis; não exibem stack, configuração, conteúdo refletido ou detalhes internos.

### 4.2 Comportamento do formulário local

- Interceptar `submit`, validar e exibir apenas um estado demonstrativo: “Validação concluída; nenhum dado foi enviado”.
- Limpar o estado sensível ao sair da página e oferecer ação explícita para limpar os campos.
- Não preencher automaticamente dados reais em testes ou screenshots. Fixtures devem ser claramente sintéticas.
- Não armazenar rascunho. Se isso for proposto no futuro, será decisão de privacidade separada com prazo e exclusão.
- O teste de aceitação deve provar **zero requests adicionais** e **zero alterações** em cookies, Local Storage, Session Storage e IndexedDB durante preenchimento e submit.

### 4.3 Política de conteúdo e headers

Aplicar no preview de produção (não inferir segurança a partir do dev server):

- `Content-Security-Policy`: baseline de menor privilégio, validada no navegador e ajustada ao build real.
  - `default-src 'self'`
  - `base-uri 'self'`
  - `object-src 'none'`
  - `frame-ancestors 'none'`
  - `form-action 'self'` (o formulário atual não tem destino)
  - `img-src 'self' data: blob:` apenas se os assets realmente exigirem `data:`/`blob:`
  - `font-src 'self'`
  - `connect-src 'self'`; nenhuma origem de analytics/API nesta fase
  - `worker-src 'self' blob:` somente se confirmado necessário
  - `style-src` e `script-src` sem curingas; exceções devem ser justificadas pelo build
- Para App Router, não adotar cegamente `'unsafe-inline'` em scripts. Testar a versão instalada e escolher nonce por resposta quando houver renderização dinâmica, ou hashes suportados pelo pipeline estático. `'unsafe-eval'` pode existir apenas no desenvolvimento local, nunca no preview/release.
- `style-src 'unsafe-inline'`, se indispensável ao framework/runtime, deve ser exceção registrada e não autoriza HTML/estilos vindos de visitante.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY` como defesa legada adicional.
- `Permissions-Policy` negando recursos não usados, no mínimo câmera, microfone, geolocalização, pagamento e USB.
- `Cross-Origin-Opener-Policy: same-origin` e política de recursos compatível com assets locais, depois de testar preview e links externos.
- `Strict-Transport-Security` somente em produção HTTPS, após domínio/subdomínios estarem corretos; `includeSubDomains`/preload exigem decisão separada.
- `Cache-Control`: HTML e configurações mutáveis com revalidação adequada; assets com hash podem ser imutáveis; nenhuma futura resposta de formulário deve ser cacheada.
- Não habilitar CORS sem uma API e consumidor aprovados. Não adicionar CSP reporting externo sem aprovação de coleta.

### 4.4 Segredos e configuração

- Nenhum segredo é necessário agora. Variáveis `NEXT_PUBLIC_*` podem conter apenas identificadores deliberadamente públicos, nunca tokens privilegiados.
- Arquivos `.env*` reais não entram no Git; exemplo documenta somente nomes e valores fictícios.
- Scanner deve cobrir fonte e build. Achado suspeito não é copiado para o relatório; confirmar e rotacionar se for credencial válida.
- Não expor source maps ao público por padrão. Se forem enviados a um serviço futuro, isso exige provedor aprovado, acesso restrito e revisão de conteúdo.

### 4.5 Dependências e supply chain

- Confirmar versões instaladas e usar APIs da documentação local do Next.js.
- Manter apenas dependências justificadas: Next/React/TypeScript; GSAP e React Three Fiber/Three exclusivamente para a cena; pipeline MDX mínimo; bibliotecas de validação ou teste somente se reduzirem risco/custo real.
- Commitar lockfile; usar instalação reproduzível no CI futuro; não atualizar versões silenciosamente durante o gate.
- Revisar licença, manutenção, tamanho, scripts de instalação e árvore transitiva de cada nova dependência.
- Executar auditoria de vulnerabilidades e avaliar explorabilidade/caminho alcançável. Ausência de alertas não equivale a aprovação.
- Executar o scanner de segurança do Growth Studio na fonte e novamente com artefatos de build. Triagem humana continua obrigatória.
- Produzir inventário/SBOM quando a ferramenta instalada suportar, sem instalar serviço externo apenas para isso.
- Build futuro usa permissões mínimas, ações pinadas por commit e sem segredos disponíveis para jobs que não precisam deles.

## 5. Observabilidade e privacidade

### Aplicável agora

- Analytics, pixels, session replay, fontes remotas e CSP reporting externo ficam desabilitados.
- Erros do cliente podem aparecer no console de desenvolvimento, mas nunca incluem valores de campos, corpo de formulário, stack/configuração em UI ou identificadores persistentes.
- Testar que a cena falha de modo contido: erro de WebGL não impede conteúdo/CTA e não inicia loop de erro.
- Documentar eventos de produto pretendidos sem instrumentá-los: `qualified_view`, `cta_click`, `form_start`, `form_validation_error`, `form_local_validation_complete` e, somente no futuro, `diagnostic_request_accepted`.
- Não chamar a validação local de “envio válido” ou “pedido recebido”.

### Condicionado a backend e produção

Antes de ativar coleta real, definir e testar:

- finalidade, base aplicável, campos mínimos, owner, acesso, retenção, descarte e atendimento de direitos;
- aviso de privacidade e texto de consentimento quando consentimento for a base apropriada;
- processamento server-side, destino aprovado e acordo/configuração do provedor;
- `request_id`/`event_id` opacos; nunca e-mail como identificador de correlação;
- eventos estruturados em allowlist: `timestamp`, `event_id`, `schema_version`, `service`, `environment`, `event_type`, `severity`, `outcome`, `error_code`, `request_id`, `target_type` e metadata limitada;
- redação antes da serialização; proibição de nome, e-mail, organização, mensagem, Authorization, Cookie, IP integral e corpo completo em logs;
- acesso mínimo separado por ambiente, transporte cifrado, auditoria de exportação, integridade e relógio confiável;
- retenção curta por finalidade e teste verificável de descarte;
- detecções para pico de validações rejeitadas, rate limit, aumento de 4xx/5xx, falha do provedor, mudança de configuração/deploy e silêncio de telemetria;
- cada alerta com responsável humano, canal, severidade, janela/limiar, supressão, SLA, runbook, teste sintético e critério de encerramento;
- teste ponta a ponta `evento → ingestão → regra → alerta → notificação → triagem → evidência`, incluindo heartbeat/silêncio. Sem isso, monitoramento permanece “não validado”.

### Proteção contra abuso futura

O primeiro endpoint de contato deve combinar limites estritos de payload, timeout, rate limit por sinais minimizados, honeypot não enganoso e limitação de frequência. CAPTCHA ou fingerprinting não é baseline automático: só após evidência de abuso e análise de acessibilidade/privacidade. A resposta não deve revelar regras internas nem confirmar existência de pessoa/empresa. Filas e provedores devem ter idempotência para evitar múltiplas mensagens.

## 6. Plano de testes negativos e evidências

Todos os testes usam dados sintéticos e rodam localmente/preview autorizado.

| Teste | Resultado esperado | Evidência mínima |
|---|---|---|
| Inserir `<script>`, tags, aspas, template markers e Unicode incomum em todos os campos | texto não executa nem altera DOM fora do campo; erro controlado quando inválido | teste automatizado + inspeção DOM/console |
| Inserir NUL, controles, input vazio e valores nos limites e acima deles | regras determinísticas, sem travamento ou truncamento silencioso | testes unitários do schema |
| Submeter e observar rede/storage | nenhum request, cookie ou storage novo; mensagem “não enviado” | trace de rede e snapshot de storage antes/depois |
| Desabilitar JavaScript | conteúdo, navegação e CTA informativo continuam legíveis; formulário não promete envio | teste de navegador/screenshot |
| Bloquear WebGL, simular perda de contexto e reduced motion | fallback estático, sem loop, conteúdo e foco preservados | teste runtime nos três modos |
| Navegar por locales inválidos/manipulados | fallback/404 controlado, sem open redirect ou path inesperado | testes de rotas |
| Inspecionar HTML, bundle, source maps e build | sem segredo, PII, URL de serviço não aprovado ou claims privados | scanner + revisão manual |
| Verificar CSP/headers no preview de produção | headers presentes; zero violações inesperadas; sem `unsafe-eval` | dump de headers + console do navegador |
| Tentar iframe em origem distinta | bloqueado | teste automatizado/manual |
| Build com auditoria de dependências | achados triados por alcançabilidade e severidade | saída minimizada + decisão por achado |
| Testar teclado/leitor de tela nos erros | foco e descrição do erro corretos; sem exposição do valor | evidência QA acessível |

### Pacote de evidências do gate

O `EVIDENCE_BUNDLE` de segurança deve citar a versão da spec e incluir:

1. arquivos/configurações revisados e relação com os requisitos acima;
2. resultado do scanner na fonte e nos artefatos, sem reproduzir segredo/PII;
3. testes unitários e de navegador, com comandos reproduzíveis;
4. captura dos headers e relatório de violações CSP no preview de produção;
5. trace provando ausência de transmissão/storage no formulário;
6. inventário de dependências, licenças relevantes e achados triados;
7. teste dos modos completo, leve, estático e reduced motion;
8. limitações e riscos residuais;
9. autoria da implementação e revisão independente.

Resumo textual sozinho não aprova comportamento verificável. Evidências não devem conter valores reais digitados, logs completos, tokens ou dados privados.

## 7. Gates

### Gate de implementação local — `aprovado com condições`

Pode avançar desde que permaneçam verdadeiros: zero transmissão/persistência; zero segredo; conteúdo local confiável; dependências justificadas; controles e testes acima incorporados à spec.

### Gate de preview privado — `pendente`

Exige build de produção executável, headers/CSP verificados, scanner de fonte e build, testes negativos aprovados, ausência de erros relevantes e preview explicitamente não público/não indexado.

### Gate de publicação — `bloqueado`

Além das evidências do preview, requer autorização humana específica para versão, domínio, momento e coleta; revisão AppSec independente; decisão de privacidade; e, se houver backend/analytics, teste de abuso, logging, alerta e runbook. Achado high/critical, segredo válido, XSS explorável, transmissão oculta, endpoint sem controles ou coleta sem finalidade bloqueia o release até correção e reteste ou aceitação formal de risco pelo responsável autorizado.

## 8. Riscos residuais e gatilhos de reavaliação

- Dependências gráficas ampliam supply chain e superfície do cliente; mitigar com isolamento, carregamento progressivo, CSP e revisão de versões.
- CSP estrita no App Router pode exigir nonce/hash e mudança na estratégia de renderização; não enfraquecer silenciosamente a política para fazer o build funcionar.
- Dados permanecem visíveis ao próprio navegador/extensões enquanto digitados; comunicar que não há envio e não solicitar informação sensível.
- Preview privado não equivale a ambiente confidencial; nunca usar dados reais.
- MDX torna-se vetor crítico se no futuro aceitar origem remota ou autores não confiáveis; nesse caso exigir sanitização/pipeline isolado e nova revisão.
- Telemetria futura cria uma nova coleção de dados e risco de vazamento; não ativar por conveniência.

Reabrir o threat model antes de qualquer: endpoint/Server Action; persistência; analytics; cookie; CRM/e-mail; autenticação; CMS remoto; upload; fetch server-side de URL variável; integração; pagamento; domínio/deploy público; ou mudança material da CSP/stack.

## 9. Próximo handoff

Frontend recebe os requisitos “agora” e produz testes/evidências. QA valida comportamento e rede/storage. Application Security revisa fonte, build, headers e testes sem ser o único autor. Cybersecurity/Observability apenas aprova prontidão operacional quando houver serviço produtor de eventos; nesta fatia, registra corretamente **“não instrumentado por ausência de coleta/backend aprovado”**, não “monitoramento pronto”. O Evidence Validator então decide `aprovado`, `corrigir`, `escalar` ou `bloqueado` contra a spec, sem criar novos critérios após a implementação.
