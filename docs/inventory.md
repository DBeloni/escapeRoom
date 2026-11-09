# Especificação do inventário

## Regras

- Capacidade máxima de cinco itens.
- Cada ID pode aparecer uma única vez no inventário.
- `ITM_001` (Chave de Fenda) e `ITM_002` (Chave Inglesa) são reutilizáveis.
- `ITM_003` (Fita Isolante), `ITM_004` (Fusível de Cartucho) e `ITM_005` (Galão de Gasolina) são consumidos após uma interação bem-sucedida.
- Uma tentativa inválida ou malsucedida nunca consome o item.

## Catálogo e contexto narrativo

Os cinco itens pertencem ao cotidiano da Zona 04: manutenção das casas e da clínica, reparos da rádio comunitária e funcionamento do cais. Eles devem parecer ferramentas que alguém realmente teria guardado ou deixado para trás, não objetos criados exclusivamente para abrir portas.

As definições mecânicas estão em `js/systems/inventory/itemCatalog.js`. A página `pages/itens.html` apresenta o mesmo catálogo com descrições narrativas.

| ID | Item | Função no universo | Tipo |
|---|---|---|---|
| `ITM_001` | Chave de Fenda | Acesso a tampas de inspeção e painéis simples. | Reutilizável |
| `ITM_002` | Chave Inglesa | Manutenção de conexões, válvulas e equipamentos do cais. | Reutilizável |
| `ITM_003` | Fita Isolante | Reparo provisório de cabos e conexões. | Consumível |
| `ITM_004` | Fusível de Cartucho | Reposição de proteção elétrica em equipamento compatível. | Consumível |
| `ITM_005` | Galão de Gasolina | Combustível para o gerador auxiliar ou motor de apoio. | Consumível |

## Modelo de dados

`createInventorySystem()` expõe operações independentes de cenário e interface: `add`, `get`, `has`, `remove`, `use` e `clear`. A função `use(itemId, applyToTarget)` chama a interação fornecida e só remove itens marcados como `single-use` quando essa interação retorna `true`.

Os cinco itens estão colocados na Zona Costeira e podem ser coletados com `E` ou pelo botão touch `PEGAR`. As imagens vêm de `assets/itens/`. Interações dos itens com alvos de cenário ainda não estão ligadas ao mapa.

## Regra narrativa

A página de itens deve diferenciar **uso previsto** de **uso já implementado**. Não prometa que uma ferramenta abre uma porta, ativa o rádio ou repara o gerador enquanto essa interação não existir no jogo.
