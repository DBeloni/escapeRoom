# Especificação do inventário

## Regras

- Capacidade máxima de cinco itens.
- Cada ID pode aparecer uma única vez no inventário.
- `ITM_001` (Chave de Fenda) e `ITM_002` (Chave Inglesa) são reutilizáveis.
- `ITM_003` (Fita Isolante), `ITM_004` (Fusível de Cartucho) e `ITM_005` (Galão de Gasolina) são consumidos após uma interação bem-sucedida.
- Uma tentativa inválida ou malsucedida nunca consome o item.

## Catálogo

As definições e usos estão em `js/systems/inventory/itemCatalog.js`. A página `pages/itens.html` apresenta o mesmo catálogo como material de referência.

## Modelo de dados

`createInventorySystem()` expõe operações independentes de cenário e interface: `add`, `get`, `has`, `remove`, `use` e `clear`. A função `use(itemId, applyToTarget)` chama a interação fornecida e só remove itens marcados como `single-use` quando essa interação retorna `true`.

Posições de coleta, objetos de cenário, interface e controles ficam fora desta especificação. Nenhum ponto de coleta ou alvo de uso está definido no jogo neste momento.
