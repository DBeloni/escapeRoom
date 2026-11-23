# Alterações solicitadas

- Diário de bordo no HUD do jogo, com registros de início, coleta/uso de itens, resolução de desafios e pista do rádio.
- Catálogo de itens convertido para tabela HTML semântica, mantendo os cinco itens e os mesmos dados.
- Modelagem dos mecanismos organizada em objetos com estado e métodos `isSolved`, `complete` e `reset`.
- Música de tema iniciada após a ação explícita do jogador, em loop, respeitando bloqueios de autoplay do navegador.
- O cronômetro e o tempo de speedrun continuam iniciando no mesmo momento em que a tela de introdução é fechada.

Nenhum cenário, item, puzzle, solução ou final novo foi criado.

## Arquivo de áudio pendente

O código referencia `assets/musicTheme.mp3`, conforme o caminho solicitado. Esse arquivo não veio no ZIP de origem. A música só tocará quando o grupo adicionar o arquivo MP3 com esse nome à pasta `assets`.
