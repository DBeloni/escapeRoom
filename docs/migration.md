# Refactor hard — migração

## O que foi consolidado

- O JS monolítico foi retirado do caminho principal.
- `index.html` agora inicia `js/main.js` como módulo.
- Assets não ficam mais misturados com lógica.
- Cenas e barreiras ficam junto do conteúdo da cena.
- Sistemas futuros já têm pontos de extensão.
- Protótipos experimentais foram separados do jogo principal.
- Código antigo foi mantido em `legacy/`.

## Duplicações removidas do caminho ativo

- `js/player/render.js` vazio e `renderer.js` duplicado: agora existe somente `entities/player/render.js`.
- `root.css` e `global.css` vazios não são carregados.
- O HTML do mapa não depende mais de um JS/arquivo CSS local quebrado.
