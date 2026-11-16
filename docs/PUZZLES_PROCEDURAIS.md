# Desafios procedurais

Os desafios da fuga agora recebem variações a cada partida. A configuração é criada uma vez e permanece igual quando o jogador fecha e reabre o painel. A aleatoriedade muda a solução, mas não cria estados impossíveis.

| Desafio | Mecânica | O que varia | Condição de sucesso |
|---|---|---|---|
| Madeira | Precisão e tempo | Posição da faixa, velocidade e tolerância | Acertar três janelas de pressão; três falhas reiniciam somente a tábua atual |
| Motor | Engrenagens acopladas | Orientação inicial das três rodas | Alinhar as três marcas para cima |
| Guincho | Roteamento elétrico 4×4 | Caminho e rotações iniciais das conexões | Formar um caminho contínuo entre bateria e motor |
| Lona | Equilíbrio de tensão | Valores-alvo e leituras das quatro relações | Satisfazer simultaneamente as quatro equações |
| Rádio | Sintonia de frequência e ganho | Frequência e ganho da transmissão | Encontrar o pico do sinal e estabilizar os dois ajustes |
| Montagem | Sequência de ignição | Sequência de seis movimentos | Instalar as peças, apertar, abastecer e repetir a sequência |

## Garantias de solução

- O caminho do circuito é gerado a partir de uma rota válida entre a entrada e a saída; as rotações iniciais são embaralhadas depois disso.
- As ações das três engrenagens formam um sistema reversível, portanto qualquer orientação inicial pode chegar ao alinhamento correto.
- As quatro equações da lona determinam uma única combinação de tensão dentro da escala apresentada.
- A sequência de partida é fixa durante a tentativa. Um erro reinicia o progresso, mas não apaga as peças instaladas.
- Fechar e reabrir um desafio não gera uma nova solução nem apaga o progresso já feito.
