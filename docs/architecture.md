# Arquitetura em execução

## Visão geral

O projeto é composto por um site institucional e uma partida de jogo. Ambos usam HTML, CSS e JavaScript puro; não há framework nem etapa de build.

## Site institucional

- `index.html` é a página inicial.
- `pages/*.html` contém história, cenários, itens, enigmas, finais, manual, equipe, tecnologia, galeria e contato.
- `css/site.css` concentra a identidade visual e os componentes compartilhados.
- `js/site.js` ativa navegação responsiva, filtros, lightbox, ano do rodapé e feedback do formulário demonstrativo.

## Jogo

A entrada da partida é `html/mapaPrincipal.html`. Ela carrega, nesta ordem:

1. `js/systems/timer/hordeTimer.js` — temporizador da partida.
2. `js/systems/puzzles/boatEscapePuzzles.js` — desafios da fuga e montagem do barco.
3. `js/script.js` — lógica principal da exploração, mapa, jogador, colisões, itens, inventário e integração das mecânicas.

O jogo ainda usa scripts clássicos do navegador, não ES Modules. Por isso, a ordem das tags `<script>` e os nomes globais utilizados entre os arquivos são importantes.

### Estilos do jogo

- `css/style.css`: apresentação principal do canvas, HUD e telas do jogo.
- `css/ui.css`: elementos de interface e controles.
- `css/puzzles.css`: painéis e interações dos desafios.

## Assets

`assets/` contém apenas os recursos referenciados pelo site ou pelo jogo: logotipo, imagens dos itens, mapa da zona, interiores e sprites/spritesheets do personagem e dos efeitos na água.

## Regra para mudanças

Antes de remover ou renomear um arquivo, procure referências em HTML, CSS e JavaScript. Se uma nova mecânica for criada, mantenha a alteração compatível com a forma atual de carregamento do jogo ou planeje a migração completa da entrada — não misture módulos isolados com scripts clássicos sem uma integração explícita.
