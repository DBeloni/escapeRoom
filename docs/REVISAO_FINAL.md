# Revisão técnica — Quarantine Protocol

Este documento descreve a versão atual do projeto. Ele separa o que foi implementado e verificado localmente daquilo que ainda depende de testes no navegador, validação externa ou publicação.

## Implementado nesta revisão

- Guia Acessível no jogo com navegação textual entre a cidade e os cinco interiores.
- Pelo Guia Acessível, o jogador pode coletar os itens disponíveis no ambiente atual e abrir os mecanismos daquele ambiente sem depender dos marcadores do canvas.
- Os cinco itens do inventário agora podem ser inspecionados por botões acessíveis; cada inspeção mostra descrição e uso previsto e é registrada no Diário de Bordo.
- Diário de Bordo registra início, mudança de ambiente, coleta, inspeção e uso de itens, pistas, desafios resolvidos e finais.
- Os seis mecanismos (`wood`, `engine`, `circuit`, `cover`, `radio` e `assembly`) oferecem estado e métodos de inspeção, interação, conclusão e reinicialização.
- Os cinco itens continuam modelados como objetos coletáveis com estado de disponibilidade, proximidade, validação de capacidade e coleta.
- O teste de puzzles foi atualizado para verificar os seis mecanismos em seus ambientes reais, a API do modelo de objetos, a abertura pelo guia e o reset.
- O botão de tentar novamente agora limpa itens, mecanismos, rádio, inventário, diário, temporizador, posição e ambiente e retorna à introdução.
- O loop de animação é iniciado uma única vez, evitando duplicação de velocidade após reinícios.
- Foi adicionada contenção de foco nos diálogos de puzzles e retorno do foco ao controle que abriu o diálogo.
- Os verificadores em `tools/` foram reorganizados e integrados ao comando `npm run check`.

## Contagem de elementos interativos

O projeto contém **11 elementos interativos principais**: cinco itens coletáveis e seis mecanismos/enigmas. Os seis mecanismos são:

| ID | Ambiente | Interação |
|---|---|---|
| `wood` | Cidade costeira | Desafio de precisão e tempo para separar tábuas |
| `engine` | Casa 05 — oficina | Alinhamento de engrenagens acopladas |
| `circuit` | Cidade / cais | Rotação de conexões para restabelecer o circuito |
| `cover` | Casa 04 — enfermaria | Ajuste de quatro tensões relacionadas |
| `radio` | Casa 02 | Sintonia de frequência e ganho para recuperar mensagem |
| `assembly` | Cidade / cais | Montagem de componentes e sequência de ignição por teclado ou clique |

Os cinco itens são chave de fenda, chave inglesa, fita isolante, fusível de cartucho e galão de gasolina. A página `pages/enigmas.html` apresenta os seis mecanismos; `pages/itens.html` documenta os cinco itens.

## Verificações locais

Executar na raiz do projeto:

```bash
npm run check
```

O comando reúne:

- verificação de sintaxe dos quatro arquivos JavaScript ativos;
- verificação de caminhos locais;
- auditoria estrutural básica dos 12 arquivos HTML;
- auditoria básica de acessibilidade das páginas e do jogo;
- conferência de recursos e restrições do enunciado;
- teste isolado dos seis mecanismos e da reinicialização dos seus estados.

Para validar cada HTML com o serviço externo Nu HTML Checker, execute com internet disponível:

```bash
npm run check:nu-html
```

A auditoria local é uma verificação estática própria; não substitui o resultado do validador oficial nem um teste com leitor de tela.

## Validações que ainda dependem da equipe

1. Jogar uma partida completa em navegador real, verificando os cinco interiores, coleta, enigmas, montagem e os quatro desfechos.
2. Confirmar visualmente que os objetos e os pontos de coleta estão alcançáveis sem colisões ou bloqueios inesperados.
3. Cronometrar partidas com pessoas que não conhecem o jogo e ajustar o percurso para a faixa de 2 a 5 minutos pedida pelo trabalho.
4. Testar o Guia Acessível e o inventário com leitor de tela e navegação somente por teclado; a interface textual elimina a dependência da localização visual de itens e mecanismos, mas não substitui toda a navegação espacial por um mapa acessível completo.
5. Rodar `npm run check:nu-html` com rede disponível e corrigir mensagens que o serviço oficial apontar.
6. Revisar o diff no repositório, criar commits descritivos com autoria correta de todos os integrantes e enviar as alterações ao remoto.
7. Atualizar e abrir o deploy da Vercel em outro navegador/dispositivo.

## Limites desta revisão

O ambiente de trabalho não confirmou uma sessão completa de jogo em navegador nem a publicação na Vercel. Portanto, esses itens permanecem como testes externos, não como aprovações já realizadas.
