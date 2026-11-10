# Temporizador das hordas

O temporizador fica no HUD da partida principal (`html/mapaPrincipal.html`) e começa quando os recursos do jogo terminam de carregar. Ele continua durante a exploração da costa e dos interiores.

## Sequência

| Etapa | Contagem |
|---|---:|
| Tempo até a 1ª horda | 2 minutos |
| Tempo até a 2ª horda | 1 minuto e 30 segundos |
| Tempo até a 3ª horda | 1 minuto |
| Tempo até a horda final | 30 segundos |

A sequência completa dura 5 minutos. Ao terminar uma etapa, o HUD avança automaticamente para a próxima. Ao terminar a quarta, exibe que a contagem foi concluída. O temporizador para ao ocorrer game over e reinicia quando a partida é reiniciada.

## Integração futura com inimigos

O sistema está isolado em `js/systems/timer/hordeTimer.js`. Quando cada contagem termina, ele dispara o evento `game:horde-arrival` no `window`. O evento contém `detail.phase` (de 1 a 4) e `detail.label`. O sistema de inimigos poderá escutar esse evento para iniciar cada horda quando essa mecânica for implementada.

Neste momento, o evento e a indicação visual são implementados, mas não há criação automática de zumbis na partida principal.
