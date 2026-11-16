# Quarantine Protocol — tarefas para o Trabalho Final

**Prazo informado no Moodle:** segunda-feira, 23/11/2026, às 20h  
**Objetivo:** fechar os requisitos técnicos do site e do Escape Room, publicar o projeto e preparar uma partida demonstrável de 2 a 5 minutos.

Este checklist foi montado a partir dos critérios enviados no Moodle e de uma leitura dos arquivos atuais do projeto. `[x]` indica evidência encontrada no código; `[ ]` indica trabalho pendente ou validação ainda necessária. Confirmar no navegador antes de marcar qualquer item técnico como concluído.

## Situação atual resumida

- **Site:** há `index.html` e nove páginas em `pages/` (10 arquivos HTML institucionais), navegação comum, formulário demonstrativo e folhas CSS externas. A página do jogo é adicional.
- **Cenários:** há o mapa da Zona Costeira e cinco interiores de casas/locais, com navegação entre mapa e interiores.
- **Jogo:** há inventário de cinco itens, temporizador de cinco minutos, quatro desafios de coleta/recuperação, rádio e montagem do barco. Também existem finais de fuga, secreto, infecção e afogamento no código.
- **Pendências de maior risco:** os requisitos pedem pelo menos 10 objetos/puzzles distintos e um diário de pistas visível. O jogo já tem um minigame de teclado funcional na partida do motor, mas ainda precisa de teste completo no navegador. O site de finais documenta só um desfecho. O código ativo também usa `addEventListener`, `createElement` e funções arrow, em conflito com as restrições literais do enunciado.
- **Entrega:** o README descreve Git/GitHub e Vercel, mas ainda é preciso confirmar commits de todos, deploy funcional e envio no Moodle.

## P0 — Requisitos explícitos do jogo

- [ ] **Contabilizar e implementar 10 objetos/puzzles distintos.** Fazer uma tabela interna com nome, cenário, lógica, estado, pré-requisitos e consequência de cada um. Hoje há seis pontos de interação principais (`wood`, `engine`, `circuit`, `cover`, `radio`, `assembly`); decompor ou acrescentar desafios com lógicas distintas até chegar a dez interações que o avaliador consiga identificar.
- [ ] **Criar o Diário de Bordo visível.** Adicionar botão persistente na interface e painel que registre pistas lidas, mensagens decifradas, itens importantes, erros/decisões e mecanismos acionados em ordem cronológica. Garantir leitura por teclado e leitor de tela.
- [x] **Adicionar um minigame controlado pelo teclado.** A partida manual do motor usa uma sequência aleatória de seis direções, aceita as setas do teclado e exibe progresso e feedback de erro/sucesso.
- [x] **Completar o requisito de minigame por clique.** O roteamento elétrico, as engrenagens e o ajuste das presilhas usam ações de clique/toque, com estado visual e feedback.
- [ ] **Fortalecer o sistema de itens.** Permitir selecionar/inspecionar item e usá-lo explicitamente em objetos compatíveis; mostrar combinações ou bloqueios por falta de item e registrar essas ações no diário. O inventário e consumo de itens já existem, mas a seleção/inspeção não está evidente.
- [ ] **Formalizar interdependências entre enigmas.** Fazer cada solução alterar outro objeto/cenário de forma observável (ex.: guincho libera hélice para montagem; fusível/fita restauram painel; rádio revela pista/rota). Exibir a consequência ao jogador e registrá-la.
- [ ] **Revisar a modelagem em objetos.** Manter cada objeto interativo com estado e método/ação associados (trancado, inspecionado, resolvido, pistas/itens necessários). As estruturas `puzzleState`, `TASKS` e `LOCATIONS` são uma base, mas validar que os dez objetos satisfazem o critério individualmente.
- [ ] **Tornar os finais condicionais e documentar todos.** Preservar os finais existentes e ligar os desfechos a tempo, pistas e decisões; assegurar ao menos três finais claramente alcançáveis em jogo. Atualizar `pages/finais.html`, hoje descrevendo somente a fuga.
- [ ] **Garantir duração de 2 a 5 minutos.** Ajustar temporizador, quantidade/ordem de desafios, deslocamentos e dicas; preparar rota demonstrativa que caiba nesse intervalo.

## P0 — Restrições de implementação do enunciado

- [ ] **Resolver a incompatibilidade com `addEventListener`.** O texto do Moodle proíbe `eventListenner`/`eventListener` e manda usar eventos “no lugar”; confirmar a interpretação em aula e adaptar os handlers ativos para a forma aceita (por exemplo, propriedades `on...`), incluindo controles mobile, puzzles e formulário.
- [ ] **Remover `document.createElement` do código ativo**, se a proibição de “create element” se aplica a `createElement`. Renderizar os slots do inventário com HTML/template string e atualizar o estado sem criar nós pelo método proibido. Também conferir ocorrências em outros scripts.
- [ ] **Trocar funções arrow usadas como handlers por funções tradicionais**, conforme a orientação de priorizar `for` normal e evitar lambda. Fazer busca final nos scripts ativos; preservar callbacks exigidos por APIs apenas se o professor permitir.
- [ ] **Confirmar que não há bibliotecas ou frameworks externos** no jogo. O projeto aparenta usar JavaScript próprio e scripts locais; revisar referências externas antes da entrega.

## P1 — Site: critérios técnicos e conteúdo obrigatório

- [x] **Quantidade mínima de páginas:** `index.html` mais nove arquivos em `pages/`; manter pelo menos 10 HTML institucionais além da página do jogo.
- [x] **Páginas principais previstas:** história, contato fake, cenários, itens, enigmas, finais, instruções, desenvolvedores, tecnologia e galeria existem.
- [ ] **Validar toda a navegação:** de cada página, abrir todas as áreas pelo menu/rodapé sem digitar URL; testar links internos, externos e arquivos locais, inclusive links da raiz e da pasta `pages/`.
- [ ] **Checar tags e validade HTML:** executar verificador HTML em todas as páginas, corrigir erros e manter tags semânticas (`header`, `nav`, `main`, `section`, `footer`) e hierarquia correta de títulos.
- [ ] **Garantir acessibilidade visual:** texto alternativo para imagens de conteúdo, `alt=""` para decorativas, labels ligados aos campos, foco visível, contraste, navegação por teclado e nomes acessíveis em controles/diálogos; conferir o canvas do jogo com instruções acessíveis.
- [ ] **Completar listas e tabelas:** listas já aparecem; adicionar uma tabela real, acessível e relevante (por exemplo, inventário de itens ou matriz de enigmas) caso não exista em nenhuma página.
- [ ] **Confirmar multimídia:** galeria de imagens já existe. Verificar se atende ao critério de multimídia; acrescentar áudio/vídeo local ou material multimídia com controles e alternativa textual, se necessário.
- [ ] **Verificar formulário fake:** testar validação e mensagem de confirmação local, sem alegar envio real de dados.
- [ ] **Revisar Google Fonts, CSS externo e recursos visuais:** manter CSS separado, hover, bordas, backgrounds, variáveis, posicionamento/flex/grid, fontes e media queries. Conferir responsividade e movimento reduzido em telas pequenas.

## P1 — Jogo: revisão de funcionamento e experiência

- [ ] **Testar percurso completo do jogo** do início ao fim: carregamento, instruções, movimento, colisões, entrada/saída dos cinco interiores, coleta, inventário, puzzles, montagem, vitória, derrota e reinício.
- [ ] **Conferir os cinco cenários navegáveis** e que cada um tenha conteúdo/interação percebida, sem softlock. O mapa atual e cinco interiores são evidência de cenário; testar as entradas no navegador.
- [ ] **Conferir aleatoriedade, estado e tempo.** Os desafios agora geram variações por partida (rota elétrica, engrenagens, tensões, frequência/ganho e partida); ainda é preciso validar no navegador a duração total e a relação com o temporizador.
- [ ] **Conferir pistas e interdependências** nos cenários com feedback claro, evitando dependências impossíveis ou itens consumidos sem possibilidade de concluir a rota.
- [ ] **Revisar acessibilidade do jogo:** instruções textuais, controles alternativos, foco no diálogo, labels/ARIA, feedback anunciado e funcionamento sem mouse quando aplicável.
- [ ] **Revisar CSS/ambientação:** conferir legibilidade, contraste, transições discretas, adaptação a celular e que efeitos não atrapalhem os controles ou a leitura.

## P1 — Versionamento, deploy e apresentação

- [ ] **Confirmar commits descritivos de todos os integrantes** no repositório do grupo, com autoria correta e histórico que mostre contribuições.
- [ ] **Publicar/atualizar o deploy Vercel** e confirmar que o endereço abre sem erro, que assets e caminhos relativos funcionam e que o jogo carrega fora do computador local.
- [ ] **Preparar demonstração de 2–5 minutos:** rota, pistas a mostrar, um puzzle por clique, um puzzle por teclado, diário, interdependência e dois ou mais desfechos demonstráveis.
- [ ] **Distribuir responsáveis e estimativas** entre integrantes; registrar nome ao lado de cada tarefa pendente e avisar imediatamente se algum bloqueio ameaçar o prazo.
- [ ] **Enviar o trabalho no Moodle antes de 23/11/2026 às 20h** e conferir que o status mudou de “Nada foi enviado”.

## Ordem sugerida para concluir

1. Fechar as três lacunas do jogo mais explícitas: dez objetos, diário e teclado.
2. Adequar eventos/DOM/funções arrow às restrições explicadas em aula.
3. Ligar interdependências, itens selecionáveis e finais condicionais; sincronizar a página de finais.
4. Fazer uma passada de validação do site, links, acessibilidade e responsividade.
5. Testar a rota completa e duração, publicar na Vercel, conferir commits e enviar no Moodle.

## Registro da equipe

| Tarefa | Responsável | Prazo interno | Estado / observações |
|---|---|---|---|
| Dez objetos/puzzles |  |  |  |
| Diário de Bordo |  |  |  |
| Minigame de teclado |  |  |  |
| Itens e interdependências |  |  |  |
| Finais condicionais e página de finais |  |  |  |
| Restrições de JavaScript |  |  |  |
| Validação do site e acessibilidade |  |  |  |
| Deploy Vercel e commits |  |  |  |
| Demonstração e envio Moodle |  |  |  |
