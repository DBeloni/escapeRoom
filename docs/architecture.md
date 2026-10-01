# Arquitetura do Escape Room

## Regra principal

O jogo principal usa ES Modules nativos do navegador. `js/main.js` é o único ponto de entrada.

## Camadas

- `config/`: parâmetros globais que alteram comportamento sem mexer na lógica.
- `core/`: ciclo de vida do jogo, estado, input, assets, canvas, loop e cenas.
- `entities/`: entidades jogáveis e suas regras locais.
- `world/`: mapa físico, câmera, colisão e água.
- `scenes/`: conteúdo específico de cada lugar.
- `systems/`: mecânicas independentes que podem ser usadas por várias cenas.
- `ui/`: HUD e ferramentas visuais.
- `prototypes/`: laboratórios independentes; não fazem parte do core.
- `legacy/`: versões antigas preservadas para consulta e comparação; não são carregadas.
- `assets/`: mídia do projeto.
- `docs/`: documentação e brainstorm.

## O que não fazer

Não colocar toda uma mecânica nova em `main.js`, `core/game.js` ou em uma cena só.

Uma porta deve ser conteúdo da cena. A regra genérica de inventário pertence a `systems/inventory`.

## Como adicionar uma nova casa

1. Criar `js/scenes/casaNova/`.
2. Criar a definição da cena.
3. Registrar no `sceneRegistry.js`.
4. Definir objetos e puzzles próprios no diretório da cena.
5. Reusar sistemas existentes para inventário, diálogo, pontos e interação.

## Como adicionar uma mecânica nova

Criar um diretório em `js/systems/` e expor uma API pequena. O core só coordena o ciclo de atualização.

## Protótipos

Os três experimentos existentes foram preservados e modularizados separadamente:

- `prototypes/inventory/`
- `prototypes/multiplayer/`
- `prototypes/zombie/`

Eles são laboratórios, não dependências do jogo principal.
