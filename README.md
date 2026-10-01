# Escape Room

Projeto escolar de jogo web desenvolvido com HTML, CSS e JavaScript.

## Entrada

`index.html` inicia o jogo principal.

## Estrutura

```text
assets/       imagens, mapas e ícones
css/          estilos do jogo principal
docs/         documentação e brainstorm
js/           código do jogo principal
pages/        páginas de compatibilidade
prototypes/   experimentos independentes
legacy/       versões antigas preservadas
package.json  ferramentas locais
tools/        scripts de manutenção
```

## Execução

Como o projeto usa ES Modules, rode com um servidor HTTP local ou hospede normalmente no Vercel/Replit.

Exemplo simples:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000/`.

## Verificação de sintaxe

```bash
npm run check:js
```

## Próximas expansões

O core já possui pontos de extensão para:

- inventário
- interação
- diálogo
- puzzles
- quests
- pontos
- timer
- save/load
- novas cenas
- NPCs e objetos por cena

## Protótipos

Os experimentos antigos estão em `prototypes/` e podem ser abertos separadamente:

- `prototypes/inventory/`
- `prototypes/multiplayer/`
- `prototypes/zombie/`
