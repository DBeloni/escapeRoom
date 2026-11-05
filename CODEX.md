# CODEX.md — Escape Room: Site institucional

> Documento de orientação para agentes de programação que trabalham neste repositório.
> **Escopo principal: site institucional e sua interface visual.** O jogo executável existe no mesmo repositório, mas suas mecânicas não fazem parte do escopo normal deste documento.

## 1. Identidade e objetivo do projeto

O projeto é um Escape Room escolar com ambientação pós-apocalíptica. O repositório reúne duas partes relacionadas, mas distintas:

1. **Site institucional:** apresenta o universo, a história, os cenários, os itens, os enigmas, os finais, a equipe, a tecnologia e informações de contato.
2. **Jogo:** experiência interativa executada em uma página própria, com mapas, personagem, colisões, cenas e sistemas de jogo.

Ao receber uma tarefa sobre “site”, “layout”, “visual”, “CSS”, “página”, “menu” ou “responsividade”, trabalhe na primeira parte. Não altere o funcionamento do jogo por iniciativa própria.

O site deve parecer a página oficial de um jogo pós-apocalíptico: imersivo, consistente, sóbrio e funcional. A interface pode transmitir suspense e abandono, mas deve continuar legível, organizada e fácil de navegar.

## 2. Regra de escopo: site não é jogo

### Arquivos normalmente pertencentes ao site

- `index.html`
- `pages/*.html`
- `css/site.css`
- `js/site.js`
- `assets/` quando a alteração envolver imagens, ícones ou mídia exibidos pelo site.

### Arquivos do jogo — não modificar em tarefas comuns de site

- `html/mapaPrincipal.html`
- `js/core/`
- `js/entities/`
- `js/player/`
- `js/scenes/`
- `js/systems/`
- `js/ui/`
- `js/world/`
- `js/config/`
- `css/style.css`
- `css/game.css`
- `css/ui.css`
- `css/base.css`
- `legacy/`
- `prototypes/`
- `test/` quando os testes forem do jogo.

**Exceção:** só altere arquivos do jogo quando o usuário pedir explicitamente uma mudança nele ou quando uma alteração de integração for indispensável e estiver dentro do pedido. Explique a necessidade antes de ampliar o escopo.

Não confunda `css/site.css` com `css/style.css`: o primeiro estiliza o site institucional; o segundo está associado à página do jogo.

## 3. Stack e execução

| Tecnologia | Uso no projeto |
|---|---|
| HTML5 | Estrutura das páginas institucionais e do jogo |
| CSS3 | Layout, identidade visual, responsividade e estados de interação |
| JavaScript Vanilla | Interações leves do site e sistemas do jogo |
| Google Fonts | Tipografia Rajdhani e Share Tech Mono |
| Git / GitHub | Versionamento |
| Vercel | Hospedagem |

Não há framework de front-end ou etapa de build do site. O projeto usa HTML, CSS e JavaScript nativos.

### Comandos

| Objetivo | Comando |
|---|---|
| Abrir o site | Abrir `index.html` no navegador |
| Executar verificação JavaScript | `npm run check:js` |
| Instalar dependências | Não é necessário para a estrutura atual |

Se uma mudança envolver caminhos relativos, valide as páginas tanto na raiz quanto dentro de `pages/`. Não presuma que todos os caminhos relativos são iguais.

## 4. Arquitetura do site

### Páginas

- `index.html` — página inicial e apresentação principal.
- `pages/historia.html` — contexto e narrativa.
- `pages/cenarios.html` — apresentação dos ambientes.
- `pages/itens.html` — objetos e recursos do universo.
- `pages/enigmas.html` — apresentação dos desafios.
- `pages/finais.html` — desfechos.
- `pages/como-jogar.html` — instruções para o jogador.
- `pages/desenvolvedores.html` — equipe.
- `pages/tecnologia.html` — tecnologias e arquitetura.
- `pages/galeria.html` — imagens e registros visuais.
- `pages/contato.html` — formulário demonstrativo.
- `pages/mapaPrincipal.html` — arquivo de redirecionamento; não é uma página institucional comum.

### CSS

`css/site.css` é a folha de estilos compartilhada por `index.html` e pelas páginas institucionais. Ela concentra:

- variáveis de tema em `:root`;
- reset e estilos globais;
- tipografia;
- cabeçalho e navegação;
- hero e cabeçalhos internos;
- botões;
- grids e cards;
- tabelas, listas, formulários e avisos;
- rodapé;
- breakpoints e preferência por movimento reduzido.

Evite criar uma folha de estilos isolada para cada página. Antes de adicionar CSS, verifique se o componente já existe em `site.css` e se pode ser reutilizado.

### JavaScript do site

`js/site.js` contém interações institucionais simples:

- tratamento do formulário demonstrativo por `[data-fake-form]`;
- atualização do ano em elementos `[data-year]`;
- mensagens de retorno na própria página.

Não misture esse código com os sistemas do jogo. Não transforme o formulário demonstrativo em envio real nem prometa entrega de mensagens sem uma integração de backend.

## 5. Identidade visual e direção de arte

### Conceito

A direção visual é de um **site oficial de um jogo de sobrevivência pós-apocalíptico**, não de um painel administrativo genérico e nem de uma página corporativa convencional.

Referências de atmosfera já estabelecidas:

- cidade abandonada e em decadência;
- vegetação retomando estruturas humanas;
- concreto, ferrugem, sujeira e sinais de isolamento;
- suspense, silêncio e tensão;
- comunicação visual de emergência, arquivos, terminais e zonas interditadas.

A interface deve equilibrar atmosfera e usabilidade. A ambientação nunca pode prejudicar leitura, contraste ou navegação.

### Paleta atual

As variáveis existentes em `css/site.css` são a referência inicial:

| Variável | Valor atual | Uso |
|---|---|---|
| `--bg` | `#07100d` | Fundo principal |
| `--bg-soft` | `#0d1713` | Fundo secundário |
| `--panel` | `rgba(12, 23, 18, 0.92)` | Painéis |
| `--panel-light` | `#14231c` | Superfícies elevadas |
| `--text` | `#edf7ef` | Texto principal |
| `--muted` | `#a9b9ae` | Texto secundário |
| `--accent` | `#a5d66a` | Destaques e ações |
| `--accent-strong` | `#d7ff86` | Ênfase e foco |
| `--rust` | `#b95f43` | Ferrugem e alertas temáticos |
| `--danger` | `#d96854` | Estados de perigo |
| `--line` | `rgba(165, 214, 106, 0.28)` | Bordas e divisores |

Preserve a lógica da paleta. Verde deve ser usado como acento, não como preenchimento de tudo. Tons de ferrugem/vermelho devem aparecer com moderação. Fundos escuros devem manter separação perceptível entre conteúdo, navegação e superfícies.

Se alterar cores, atualize as variáveis centrais em vez de espalhar valores quase iguais por dezenas de seletores. Não introduza uma nova cor de destaque sem uma razão visual clara.

### Tipografia

- `Rajdhani`: tipografia principal da interface.
- `Share Tech Mono`: dados técnicos, etiquetas, códigos e pequenos elementos com aparência de terminal.
- Fontes de fallback já definidas devem continuar funcionando caso o Google Fonts não carregue.

Use a fonte monoespaçada como detalhe. Parágrafos longos devem priorizar legibilidade.

### Linguagem visual

Priorize:
- composição limpa e hierarquia clara;
- superfícies escuras com bordas discretas;
- imagens com tratamento coerente com a ambientação;
- detalhes de interface inspirados em sinalização e arquivos;
- efeitos curtos e discretos em hover/focus;
- espaços negativos suficientes para a página respirar.

Evite:
- excesso de glow, neon, sombras fortes ou gradientes decorativos;
- aparência de template genérico;
- excesso de bordas, etiquetas e elementos competindo pela atenção;
- animações constantes ou efeitos que distraiam;
- efeitos de vidro em todos os elementos;
- cantos excessivamente arredondados em tudo;
- poluição visual com textos técnicos decorativos sem função;
- transformar toda seção em um card.

**O objetivo não é deixar o site mais enfeitado; é deixá-lo mais convincente, coeso e bem resolvido.**

## 6. Sistema de componentes e convenções CSS

Reutilize as classes existentes sempre que possível:

| Classe | Responsabilidade |
|---|---|
| `.container` | Largura e alinhamento do conteúdo |
| `.site-header` / `.header-inner` | Cabeçalho |
| `.brand` / `.brand-mark` | Identidade e marca |
| `.site-nav` | Navegação principal |
| `.hero` / `.hero-content` | Destaque da página inicial |
| `.page-head` | Cabeçalho de páginas internas |
| `.eyebrow` / `.kicker` | Etiquetas de contexto |
| `.lead` | Texto introdutório |
| `.section` / `.section-head` | Seções e títulos |
| `.grid` / `.grid.two` | Grades de conteúdo |
| `.card` | Painel de conteúdo |
| `.media-card` | Card com mídia |
| `.button` / `.button.secondary` | Ações |
| `.notice` / `.quote` | Avisos e citações |
| `.table-shell` | Contêiner responsivo de tabela |
| `.form-shell` / `.form-grid` / `.field` | Formulários |
| `.footer` / `.footer-grid` | Rodapé |

### Regras para CSS novo

1. Use as variáveis de `:root` para cores, tipografia, largura e valores recorrentes.
2. Prefira classes semânticas e reutilizáveis a seletores excessivamente específicos.
3. Evite `!important`; só use quando houver justificativa técnica real.
4. Não duplique regras existentes. Edite a regra original ou extraia um componente reutilizável.
5. Agrupe estilos por componente e mantenha media queries organizadas.
6. Não use seletores globais para resolver um problema localizado.
7. Não aplique estilos de página institucional em `#gameCanvas`, `#gameContainer` ou controles do jogo.
8. Antes de criar uma nova classe, procure usos e padrões semelhantes no projeto.
9. Não adicione bibliotecas CSS, frameworks ou preprocessadores sem autorização.
10. Não use estilos inline como substituto de uma solução compartilhada, salvo em conteúdo realmente pontual.

## 7. Layout, responsividade e navegação

O site deve funcionar em desktop, tablet e celular.

Breakpoints existentes em `site.css`:
- até `980px`: cabeçalho reorganizado e grids passam a duas colunas;
- até `680px`: conteúdo em uma coluna, navegação mais compacta e botões ocupando a largura disponível.

Esses valores são a referência atual, não uma obrigação imutável. Se alterar breakpoints, teste os pontos de transição e evite criar vários breakpoints próximos sem necessidade.

### Critérios obrigatórios

- Nenhuma rolagem horizontal acidental.
- Navegação acessível em telas estreitas.
- Textos sem cortes ou sobreposição.
- Cards e imagens sem distorção.
- Formulários utilizáveis por toque.
- Alvos interativos com tamanho adequado.
- Cabeçalho não pode encobrir o conteúdo ou âncoras.
- Tabelas podem ter rolagem horizontal dentro de `.table-shell`, sem alargar a página inteira.

A navegação deve manter os caminhos relativos corretos: a página inicial usa caminhos a partir da raiz; páginas dentro de `pages/` normalmente usam `../` para voltar à raiz e caminhos locais para outras páginas da mesma pasta.

Mantenha `aria-current="page"` no link da página atual.

## 8. HTML, acessibilidade e conteúdo

- Use HTML semântico: `header`, `nav`, `main`, `section`, `article`, `footer`, `figure` e elementos apropriados.
- Cada página deve ter um `h1` principal e hierarquia de títulos coerente.
- Mantenha `lang="pt-BR"`, `meta viewport`, título e descrição adequados.
- Imagens informativas precisam de `alt` descritivo; imagens decorativas devem usar `alt=""`.
- Formulários precisam de `label` associado aos campos.
- Estados interativos devem funcionar com teclado e exibir `:focus-visible`.
- Preserve o link “Pular para o conteúdo principal”.
- Não use apenas cor para comunicar estado.
- Respeite `prefers-reduced-motion`.
- Links que abrem nova aba devem manter `rel="noopener noreferrer"` junto de `target="_blank"`.

O idioma padrão do conteúdo é português brasileiro. Preserve o tom narrativo de suspense, mas evite textos artificiais, repetitivos ou excessivamente dramáticos.

Não invente funcionalidades, integrações, fatos da história ou características do jogo. Se a informação não estiver no projeto ou no pedido, sinalize a lacuna em vez de apresentar suposição como fato.

## 9. Imagens e mídia

- Reaproveite os arquivos existentes em `assets/` quando forem adequados.
- Não substitua imagens do jogo ou mapas sem pedido explícito.
- Confira o caminho relativo a partir do arquivo HTML que usa a mídia.
- Preserve proporção e enquadramento; use `object-fit` de forma intencional.
- Evite imagens genéricas que quebrem a identidade pós-apocalíptica.
- Não aumente o peso visual de uma seção apenas adicionando imagens decorativas.
- Mídia deve ter função narrativa ou informativa clara.

## 10. Formulário e JavaScript institucional

O formulário atual é demonstrativo. `js/site.js` intercepta o envio, gera um protocolo local e mostra uma mensagem na página; ele **não envia dados para uma equipe ou servidor**.

Ao alterar essa parte:
- preserve a compatibilidade com `[data-fake-form]` e `[data-form-status]`, ou atualize HTML e JS em conjunto;
- mantenha feedback acessível ao usuário;
- não prometa envio, armazenamento remoto ou resposta real;
- evite variáveis globais desnecessárias;
- não introduza dependências para interações simples.

## 11. Dívidas e cuidados identificados no repositório

Estes pontos devem ser considerados antes de refatorar:

1. `css/site.css` é a folha institucional compartilhada e tem responsabilidade ampla. Evite concentrar novas exceções no final do arquivo sem organização.
2. `css/base.css`, `css/game.css`, `css/style.css` e `css/ui.css` pertencem ao contexto do jogo ou a estilos antigos. Não os trate como folhas alternativas do site.
3. `css/global.css` e `css/root.css` estão vazios no estado analisado. Não passe a depender deles sem uma decisão explícita de organização.
4. `css/style.css` contém estilos do canvas, controles, game over e controles touch. Alterá-lo pode afetar diretamente o jogo.
5. O menu principal é repetido nas páginas HTML. Ao mudar navegação ou estrutura compartilhada, confira todas as páginas para evitar inconsistência.
6. A página `pages/mapaPrincipal.html` redireciona para `index.html`; não confunda esse redirecionamento com o acesso real ao jogo.
7. O formulário de contato é simulado, não é uma integração funcional de envio.
8. Google Fonts depende de conexão externa; mantenha fallbacks locais na pilha de fontes.

Não trate esta lista como autorização para refatorar tudo. Corrija apenas o que for necessário para a tarefa solicitada.

## 12. Fluxo de trabalho para o Codex

Antes de editar:
1. Leia a página HTML afetada e identifique sua folha de estilos e scripts.
2. Confirme se o pedido é sobre o site ou sobre o jogo.
3. Procure classes e componentes existentes antes de criar novos.
4. Identifique quais outras páginas compartilham o componente ou CSS.
5. Preserve conteúdo e comportamento não relacionados ao pedido.

Durante a implementação:
1. Faça mudanças pequenas e coerentes.
2. Priorize soluções compartilhadas quando o componente aparece em várias páginas.
3. Não reescreva arquivos inteiros para uma alteração localizada.
4. Não remova conteúdo, links, metadados, atributos de acessibilidade ou funcionalidades sem necessidade.
5. Não altere mecânicas, mapas, colisões, personagem ou sistemas do jogo em tarefas de interface institucional.
6. Não adicione dependências sem autorização.

Antes de concluir:
1. Confira o diff e liste os arquivos alterados.
2. Verifique caminhos de CSS, JS, imagens e links internos.
3. Teste a página alterada em largura desktop e mobile.
4. Confira hover, focus, navegação por teclado e estados dos botões.
5. Execute `npm run check:js` quando houver alteração em JavaScript.
6. Informe testes executados e limitações. Não diga que testou visualmente se não abriu a página em navegador.

## 13. Critérios de qualidade visual

Uma alteração visual só deve ser considerada concluída quando:

- a página mantém a identidade visual do projeto;
- a hierarquia de informação está clara;
- o resultado não parece genérico nem excessivamente decorado;
- cores, espaçamentos, bordas e tipografia são consistentes;
- o conteúdo continua fácil de ler;
- os estados de hover e foco são discretos e perceptíveis;
- desktop e mobile continuam funcionais;
- nenhuma parte do jogo foi alterada fora do escopo.

## 14. Instrução final

**Trate o site como um produto visual único, não como um conjunto de páginas independentes.** Toda mudança deve respeitar a identidade, os componentes compartilhados, a navegação e a experiência geral.

Quando o pedido for sobre o site, concentre o trabalho em `index.html`, `pages/`, `css/site.css` e, quando necessário, `js/site.js`. Mantenha o jogo intacto.
