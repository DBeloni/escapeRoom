# Implementação da narrativa

Este arquivo separa a história aprovada para o universo das funcionalidades que realmente estão conectadas ao jogo. A página institucional pode apresentar a direção narrativa, mas não deve afirmar que uma mecânica já funciona quando ainda é apenas uma proposta.

## Premissa jogável

Às 07h42 de 24 de setembro de 1984, uma transmissão retorna à frequência comunitária 04. O jogador desperta na Zona Costeira depois da noite em que a evacuação foi interrompida. A passagem baixa está alagada; o portão leste é perigoso com a maré alta; e o cais velho é a única saída plausível.

O jogador atravessa residências, clínica, enfermaria e oficina. Ferramentas e registros ajudam a recuperar energia, identificar rotas e reconstruir quem ficou para trás. A história é descoberta em fragmentos.

## Estrutura de progressão sugerida

### Ato 1 — O silêncio

- O jogador reconhece a costa, as barreiras e os caminhos tomados pela água.
- A primeira transmissão alerta para o portão leste.
- Os primeiros objetos indicam que a evacuação foi interrompida, não concluída.

### Ato 2 — Os nomes

- A clínica e a enfermaria revelam que os registros de pacientes não fecham com o relatório oficial.
- A casa da rádio revela que Lúcia manteve uma lista de pessoas sem confirmação de embarque.
- O jogador entende que a frequência 04 era uma tentativa de organizar ajuda local.

### Ato 3 — A saída

- A oficina apresenta a relação entre gerador, rádio, bombas e maré.
- O jogador escolhe uma rota com base no que descobriu.
- O cais velho pode servir como saída, mas a decisão de deixar ou transmitir os registros muda o sentido do final.

## Desfechos narrativos propostos

Os nomes abaixo são provisórios e ainda não representam estados implementados no código.

1. **Partida às pressas:** o jogador encontra uma forma de sair, mas leva poucas informações. Sobrevive; a história de quem ficou continua sem registro.
2. **A lista incompleta:** o jogador sai com parte dos registros da clínica e da rádio. Descobre que a evacuação não foi completa, mas não consegue reconstruir todos os nomes.
3. **Frequência 04:** desfecho secreto. Ao recuperar as anotações e reativar a comunicação, o jogador transmite os nomes que faltavam na lista. A resposta que retorna é curta e não promete resgate imediato: “Recebido. Estamos ouvindo.”
4. **Sem sinal:** o jogador não consegue concluir a rota a tempo ou perde acesso à saída. A transmissão desaparece e a Zona 04 permanece isolada.

O final secreto não deve ser “o final feliz perfeito”. Ele é o final em que o jogador consegue fazer algo por quem não está presente, mesmo sem garantia de que isso resolverá tudo.

## O que o projeto já mostra

- Um mapa externo da Zona Costeira.
- Cinco interiores: duas residências, uma clínica, uma enfermaria e uma oficina.
- Um personagem explorável e transições entre a área externa e os interiores.
- Um catálogo de cinco itens no sistema de inventário.
- Uma identidade visual de arquivo e registros datados de 1984.

## O que ainda precisa de implementação narrativa

- Documentos, bilhetes, gravações e pistas encontráveis dentro das cenas.
- Interações entre os itens do inventário e os objetos de cenário.
- Estados de progressão para registrar quais pistas foram encontradas.
- Uma sequência de transmissão de rádio e sua relação com o gerador.
- Condições reais para desbloquear os quatro desfechos.
- Um sistema consistente de inspeção/diálogo para apresentar os vestígios sem depender de longos blocos de texto.

## Regra de produção

Ao implementar conteúdo novo, use este ciclo:

1. Defina o que o jogador aprende com a pista.
2. Defina por que aquela pista está naquele lugar.
3. Defina o que muda na compreensão ou na progressão depois de encontrá-la.
4. Só então escolha o formato: papel, áudio, objeto, mecanismo, ambiente ou fala.
5. Atualize os documentos e a página institucional quando o conteúdo passar de ideia para implementação.
