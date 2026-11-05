# CODEX.md — Quarantine Protocol

## Escopo

O repositório reúne duas partes: o site institucional e o jogo. Em tarefas de site, trabalhe somente em `index.html`, `pages/*.html`, `css/site.css`, `js/site.js` e nos assets efetivamente usados pelo site. Não altere o motor, mapas, personagem, colisões, enigmas ou mecânicas do jogo sem pedido explícito.

Arquivos do jogo que devem permanecer isolados em tarefas institucionais: `html/mapaPrincipal.html`, `js/core/`, `js/player/`, `js/scenes/`, `js/systems/`, `js/ui/`, `js/world/`, `js/config/`, `css/style.css`, `css/game.css`, `css/ui.css`, `css/base.css`, `legacy/`, `prototypes/` e `test/`.

## Stack e execução

- HTML5 semântico, CSS3 e JavaScript Vanilla.
- Não há build nem framework obrigatório.
- Google Fonts: Barlow Condensed, Inter e IBM Plex Mono.
- Abra `index.html` no navegador.
- Rode `npm run check:js` para validar a sintaxe JavaScript.

A estrutura visual usa princípios de organização semelhantes ao Bootstrap (container, grid responsivo, componentes consistentes e formulários), mas é implementada em CSS próprio. Não adicionar Bootstrap, jQuery ou outra dependência sem solicitação.

## Páginas institucionais

- `index.html`: página inicial/editorial e acesso ao jogo.
- `pages/historia.html`: narrativa e linha do tempo.
- `pages/cenarios.html`: mapas existentes e áreas planejadas.
- `pages/itens.html`: catálogo filtrável de itens.
- `pages/enigmas.html`: catálogo filtrável de desafios.
- `pages/finais.html`: desfechos previstos.
- `pages/como-jogar.html`: controles e manual.
- `pages/desenvolvedores.html`: equipe e processo.
- `pages/tecnologia.html`: stack e organização do repositório.
- `pages/galeria.html`: galeria com ampliação em dialog.
- `pages/contato.html`: formulário demonstrativo, sem backend.
- `pages/mapaPrincipal.html`: redirecionamento legado; não confundir com `html/mapaPrincipal.html`, que é a entrada do jogo.

## Identidade visual

Direção: site editorial/industrial de um jogo pós-apocalíptico, com pixel art como identidade central. A atmosfera deve ser forte, mas equilibrada com leitura e navegação claras.

Paleta central em `css/site.css`: asfalto escuro (`--ink`), superfícies verdes acinzentadas (`--panel`), papel envelhecido (`--paper`), ferrugem (`--rust`), oliva (`--olive`) e sinalização (`--signal`). Tipografia: Barlow Condensed para títulos, Inter para leitura e IBM Plex Mono para etiquetas técnicas.

Priorizar composições editoriais, imagens grandes, linhas, arquivos, relatórios e sinalização. Não transformar todas as seções em cards. Evitar aparência genérica de template, excesso de glow, neon, gradientes decorativos, vidro, cantos arredondados em tudo e animações constantes.

## CSS

`css/site.css` é a folha compartilhada do site. Centraliza tokens, layout, cabeçalho, navegação, hero, páginas internas, catálogos, formulários, galeria, rodapé, responsividade e `prefers-reduced-motion`.

- Reutilize os componentes e tokens existentes.
- Não duplique regras nem espalhe valores de cor quase iguais.
- Mantenha contraste, foco visível, responsividade e movimento reduzido.
- Não aplique estilos institucionais ao canvas ou aos controles do jogo.

## JavaScript institucional

`js/site.js` cuida exclusivamente de:

- menu responsivo e fechamento por Escape/clique em link;
- filtros de texto nos catálogos de itens e enigmas;
- ampliação de imagens da galeria com `<dialog>`;
- atualização automática do ano;
- feedback local do formulário demonstrativo.

O formulário não envia nem armazena dados em servidor. Não o descreva como canal real de atendimento e não adicione envio de dados sem backend e autorização explícita.

## Regras de qualidade

1. Preserve o conteúdo factual existente; não invente funcionalidades de gameplay que ainda não foram implementadas.
2. Mantenha links relativos corretos tanto a partir da raiz quanto de `pages/`.
3. Toda imagem de conteúdo deve ter `alt` descritivo; imagens decorativas devem usar `alt=""`.
4. Controles interativos devem ser acessíveis por teclado, ter foco visível e estados/atributos ARIA coerentes.
5. Teste `npm run check:js` e valide os caminhos internos e assets após alterações.
6. Em tarefas institucionais, confirme que arquivos do jogo permaneceram inalterados.
