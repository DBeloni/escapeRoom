# Regras rápidas de organização

### `core`
Coordena o jogo, mas não deve conhecer detalhes de puzzles específicos.

### `entities`
Comportamento e renderização de entidades.

### `world`
Física espacial comum a várias cenas.

### `scenes`
Conteúdo específico do lugar: barreiras, objetos, NPCs, entradas e puzzles.

### `systems`
Mecânicas reutilizáveis e independentes do mapa.

### `prototypes`
Testes e ideias experimentais que ainda não foram promovidos para o produto principal.

### `legacy`
Nunca importar daqui no jogo principal.
