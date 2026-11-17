# Guia simples do código

Este documento mostra onde procurar cada parte do jogo. A ideia é começar pelo arquivo certo e evitar mexer em várias partes sem necessidade.

## Arquivos principais

| Arquivo | O que faz |
|---|---|
| `html/mapaPrincipal.html` | Elementos da tela: mapa, inventário, botões, introdução e telas finais. |
| `js/script.js` | Controla a partida: jogador, mapa, movimento, colisões, itens, inventário, câmera e desenhos. |
| `js/systems/puzzles/boatEscapePuzzles.js` | Controla os desafios, seus painéis e a montagem do barco. |
| `js/systems/timer/timer.js` | Conta os cinco minutos e encerra a partida quando o tempo acaba. |
| `js/site.js` | Controla apenas as interações das páginas do site. Não controla o jogo. |
| `css/style.css`, `css/ui.css`, `css/puzzles.css` | Aparência do jogo. |
| `css/site.css` | Aparência das páginas do site. |

## Como a partida funciona

1. `mapaPrincipal.html` carrega os três scripts do jogo.
2. `script.js` carrega o mapa, o personagem e as imagens usadas na água.
3. Quando os arquivos terminam de carregar, aparece a tela de introdução.
4. Ao iniciar, o cronômetro começa e o ciclo principal é executado.
5. A cada quadro, o jogo atualiza o tempo, movimenta o personagem, verifica os desafios próximos e desenha a tela.
6. Quando o jogador conclui a montagem do barco, o sistema de puzzles informa a vitória ao script principal.

## Onde fazer alterações comuns

- **Velocidade e tamanho do jogador:** objeto `jogador`, no começo de `js/script.js`.
- **Posição dos itens:** lista `itensNoMundo`, no começo de `js/script.js`.
- **Capacidade do inventário:** constante `capacidadeInventario`.
- **Locais dos desafios:** lista `LOCATIONS`, no começo de `boatEscapePuzzles.js`.
- **Tempo da partida:** constante `TEMPO_TOTAL`, em `timer.js`.
- **Textos e elementos da interface:** `html/mapaPrincipal.html`.
- **Cores, tamanhos e espaçamentos:** arquivos CSS.

## Regras para manter o projeto simples

1. Antes de criar uma função, procure se já existe uma que faz a mesma coisa.
2. Prefira nomes que expliquem a ação, como `coletarItemProximo`.
3. Faça uma função cuidar de uma tarefa principal.
4. Evite criar sistemas genéricos para resolver apenas um caso.
5. Não altere o sistema de colisão ou de água sem testar o mapa inteiro. Essas partes dependem das dimensões e das imagens do cenário.
6. Depois de alterar JavaScript, execute `npm run check`. Esse comando verifica a sintaxe dos scripts e os caminhos locais de HTML, CSS e imagens do jogo.
7. Abra o Live Server pela raiz do projeto (`index.html`), e não pela pasta `html`.
8. Teste a partida no navegador: entrar em uma casa, coletar itens, abrir os desafios, sair da casa, reiniciar e conferir os finais.

## Partes que exigem mais cuidado

O arquivo `js/script.js` ainda contém a lógica de água, profundidade, colisões e câmera. Ela é extensa porque precisa reconhecer áreas específicas do mapa e dos interiores. Não é seguro trocar esses cálculos por uma verificação simples de cor sem testar cada região: isso pode fazer o personagem atravessar paredes, andar sobre a água ou ficar preso.

O arquivo `boatEscapePuzzles.js` também é maior porque reúne vários desafios diferentes. Cada desafio tem sua própria regra. Para fazer uma mudança, procure primeiro a função com o nome daquele desafio, em vez de alterar o arquivo inteiro.


## Como conferir erros de arquivos não encontrados

Se o navegador mostrar `404 (Not Found)`, abra a aba **Network** do DevTools, atualize a página e veja o nome completo do arquivo que falhou. O `404` significa que o servidor não encontrou aquele endereço.

Antes de procurar o erro manualmente, execute `npm run check`. Se a verificação passar, os caminhos locais presentes nos HTMLs, CSSs e imagens chamadas pelo JavaScript estão apontando para arquivos existentes no projeto.

O aviso sobre `/.well-known/appspecific/com.chrome.devtools.json` é uma solicitação do Chrome DevTools. Esse arquivo não é usado pelo jogo e não deve ser criado só para esconder o aviso.
