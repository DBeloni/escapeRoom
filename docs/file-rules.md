# Regras rápidas de organização

- `index.html` e `pages/`: conteúdo institucional do site.
- `html/mapaPrincipal.html`: entrada da partida.
- `css/site.css`: estilos compartilhados do site.
- `css/style.css`, `css/ui.css` e `css/puzzles.css`: estilos do jogo.
- `js/site.js`: interações institucionais.
- `js/script.js`: lógica principal da partida.
- `js/systems/puzzles/`: desafios carregados pela página do jogo.
- `js/systems/timer/`: temporizador carregado pela página do jogo.
- `assets/`: imagens, sprites, itens e demais mídias realmente usadas.
- `docs/`: documentação narrativa, técnica e material de criação.
- `tools/`: verificações e utilitários de desenvolvimento.

Não crie arquivos vazios como reserva de estrutura. Antes de adicionar uma nova pasta, confirme que existe uma responsabilidade concreta e um uso planejado no código ativo. Antes de remover um recurso, procure todas as referências no projeto.
