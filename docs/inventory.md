# Especificação do inventário

## Regras

- Capacidade máxima de cinco itens.
- Cada item pode ser coletado uma única vez.
- `ITM_001` (chave de fenda) e `ITM_002` (chave inglesa) são reutilizáveis.
- `ITM_003` (fita isolante), `ITM_004` (fusível) e `ITM_005` (galão de gasolina) são consumidos após uma interação válida.
- Uma tentativa inválida nunca consome um item.

## Onde encontrar

| Local | Objeto | Motivo |
|---|---|---|
| Casa 01 — residência | Chave de fenda | Ferramenta doméstica deixada sobre a bancada de apoio. |
| Casa 02 — rádio | Fita isolante | Material guardado no armário de manutenção da rádio. |
| Casa 03 — clínica | Fusível de cartucho | Peça guardada no armário de manutenção. |
| Casa 05 — oficina | Chave inglesa | Ferramenta de Nilo, usada para motores e conexões. |
| Casa 05 — oficina | Galão de gasolina | Combustível de reserva para o motor do barco. |

A Casa 04 não tem item de inventário: nela o jogador recupera a lona e o cordame da maca, resolvendo o desafio das presilhas.

## Uso na fuga

| ID | Uso implementado | Consumo |
|---|---|---|
| `ITM_001` | Soltar as tábuas do tronco rachado, retirar a proteção do motor e apertar as fixações do barco. | Reutilizável |
| `ITM_002` | Soltar as porcas do motor e apertar as fixações do barco. | Reutilizável |
| `ITM_003` | Isolar o cabo do guincho. | Uso único |
| `ITM_004` | Substituir o fusível do guincho. | Uso único |
| `ITM_005` | Abastecer o motor antes da partida. | Uso único |

As imagens dos objetos continuam em `assets/itens/`. O inventário mostra somente os ícones e mantém a capacidade de cinco espaços.
