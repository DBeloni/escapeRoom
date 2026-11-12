# CODEX.md — Quarantine Protocol

## Escopo

O projeto tem duas partes: o site institucional e o jogo. Preserve essa separação.

- **Site:** `index.html`, `pages/*.html`, `css/site.css`, `js/site.js` e os assets usados por essas páginas.
- **Jogo:** `html/mapaPrincipal.html`, `css/style.css`, `css/ui.css`, `css/puzzles.css`, `js/script.js`, `js/systems/puzzles/boatEscapePuzzles.js`, `js/systems/timer/hordeTimer.js` e os assets de jogo.

Não altere mecânicas do jogo em uma tarefa institucional. Não altere a identidade visual do site em uma tarefa de gameplay sem necessidade.

## Stack e execução

- HTML5 semântico, CSS3 e JavaScript Vanilla.
- Não há build nem framework obrigatório.
- Google Fonts: Barlow Condensed, Inter e IBM Plex Mono.
- `index.html` é a entrada do site.
- `html/mapaPrincipal.html` é a entrada da partida.
- Rode `npm run check:js` para validar a sintaxe dos scripts ativos.

A estrutura visual usa princípios de organização semelhantes ao Bootstrap (container, grid responsivo, componentes consistentes e formulários), mas é implementada em CSS próprio. Não adicionar Bootstrap, jQuery ou outra dependência sem solicitação.

## Páginas institucionais

- `index.html`: página inicial e acesso ao jogo.
- `pages/historia.html`: narrativa e linha do tempo.
- `pages/cenarios.html`: mapas existentes e áreas planejadas.
- `pages/itens.html`: catálogo de itens.
- `pages/enigmas.html`: catálogo de desafios.
- `pages/finais.html`: desfechos previstos.
- `pages/como-jogar.html`: controles e manual.
- `pages/desenvolvedores.html`: equipe e processo.
- `pages/tecnologia.html`: tecnologias e arquivos ativos.
- `pages/galeria.html`: galeria com ampliação em dialog.
- `pages/contato.html`: formulário demonstrativo, sem backend.

## Identidade visual

Direção: site editorial/industrial de um jogo pós-apocalíptico, com pixel art como identidade central. A atmosfera deve ser forte, mas equilibrada com leitura e navegação claras.

Paleta central em `css/site.css`: asfalto escuro (`--ink`), superfícies verdes acinzentadas (`--panel`), papel envelhecido (`--paper`), ferrugem (`--rust`), oliva (`--olive`) e sinalização (`--signal`). Tipografia: Barlow Condensed para títulos, Inter para leitura e IBM Plex Mono para etiquetas técnicas.

Priorizar composições editoriais, imagens grandes, linhas, arquivos, relatórios e sinalização. Evitar aparência genérica de template, excesso de glow, neon, gradientes decorativos, vidro, cantos arredondados em tudo e animações constantes.

## CSS

- `css/site.css`: folha compartilhada do site institucional.
- `css/style.css`, `css/ui.css` e `css/puzzles.css`: folhas carregadas pela tela do jogo.

Reutilize regras e tokens existentes. Mantenha contraste, foco visível, responsividade e movimento reduzido. Não aplique estilos institucionais ao canvas ou aos controles do jogo.

## JavaScript institucional

`js/site.js` cuida exclusivamente do menu responsivo, filtros dos catálogos, ampliação da galeria, ano do rodapé e feedback local do formulário demonstrativo. O formulário não envia nem armazena dados em servidor.

## JavaScript do jogo

- `js/script.js` é o script principal carregado pela página do jogo e concentra a exploração, o jogador, o mapa, as colisões, os itens e a integração do gameplay.
- `js/systems/puzzles/boatEscapePuzzles.js` implementa os desafios ligados à construção do barco.
- `js/systems/timer/hordeTimer.js` controla o temporizador da partida.

A página `html/mapaPrincipal.html` carrega esses três scripts em ordem. Preserve essa ordem e os IDs/classes usados pelo HTML. Não introduza ES Modules sem atualizar conscientemente a entrada do jogo e validar o carregamento no navegador.

## Regras de qualidade

1. Preserve o conteúdo factual existente; não invente funcionalidades de gameplay que ainda não foram implementadas.
2. Mantenha links relativos corretos tanto a partir da raiz quanto de `pages/` e `html/`.
3. Toda imagem de conteúdo deve ter `alt` descritivo; imagens decorativas devem usar `alt=""`.
4. Controles interativos devem ser acessíveis por teclado, ter foco visível e estados/atributos ARIA coerentes.
5. Teste `npm run check:js` e valide os caminhos internos e assets após alterações.
6. Em tarefas institucionais, confirme que os arquivos do jogo permaneceram inalterados.
