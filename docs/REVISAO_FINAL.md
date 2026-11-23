# Revisão do projeto — Quarantine Protocol

Este arquivo registra o que foi corrigido no pacote revisado e o que ainda precisa de validação ou implementação manual.

## Correções realizadas

- Removidos os usos de `addEventListener` do JavaScript ativo; os eventos são associados por propriedades como `onclick`, `oninput`, `onkeydown`, `onresize` e `onpointerdown`.
- Removidos os usos de `document.createElement`; os dois canvases auxiliares agora existem no HTML e os slots do inventário são renderizados por template string e `innerHTML`.
- Adicionada inspeção individual dos cinco itens do inventário, com descrição e imagem.
- Adicionado diário de bordo visível, com horário e histórico de pistas, itens, inspeções, ações, mudanças de cenário e finais.
- Adicionado Guia Acessível com lista textual dos mecanismos e itens do ambiente atual; permite abrir mecanismos e recolher itens sem depender da exploração visual do mapa.
- Ampliado o jogo para dez objetos interativos: os seis mecanismos anteriores e quatro adicionais (cofre, disjuntores, válvulas e caixas).
- Criados pré-requisitos entre os quatro novos mecanismos; a cadeia é opcional e não impede a fuga principal.
- Criada modelagem de objetos interativos com propriedades de estado e métodos `inspect`, `interact` e `complete`.
- Adicionada uma tabela HTML semântica à página de itens.
- Atualizadas as páginas de enigmas, finais, manual e tecnologia para refletir as mecânicas implementadas.
- Adicionados estilos para as novas interfaces e controles.
- Atualizado o verificador para detectar regressões das duas APIs proibidas.

## Pendências que exigem teste ou decisão do grupo

1. **Testar uma partida completa em navegador real.** A auditoria estática e a verificação headless não substituem uma partida humana de ponta a ponta. Confirmar coleta dos cinco itens, entrada/saída das cinco casas, puzzles, montagem e quatro finais.
2. **Validar posicionamento dos quatro novos objetos.** As coordenadas foram escolhidas a partir das dimensões e dos pontos já utilizados nos interiores. Confirmar visualmente que o personagem consegue alcançar cada marcador sem ficar atrás de móveis ou barreiras.
3. **Acessibilidade completa do mapa.** O Guia Acessível oferece lista textual de mecanismos, permite abrir puzzles e recolher itens do ambiente atual. Ainda não substitui a movimentação livre no mapa por uma interface totalmente navegável por leitor de tela. Uma alternativa completa precisaria permitir navegação textual por pontos, indicar rotas/obstáculos e descrever a posição do personagem.
4. **Duração real de 2 a 5 minutos.** O jogo mantém o limite de cinco minutos, mas o grupo deve cronometrar várias partidas e ajustar o percurso, porque a duração depende da familiaridade do jogador e da quantidade de desafios opcionais.
5. **Validação formal do HTML.** Os caminhos locais e a sintaxe JavaScript foram verificados. Ainda é necessário passar cada HTML pelo Nu Html Checker (validator.w3.org/nu) e corrigir eventuais avisos de semântica ou acessibilidade.
6. **Git e Vercel.** O ZIP revisado não inclui a pasta `.git` e não faz push ou deploy. O grupo deve copiar/substituir os arquivos no repositório, revisar o diff, criar commits descritivos de todos os integrantes e publicar a versão final na Vercel.
7. **Revisar a interpretação do professor sobre funções arrow.** Os novos trechos privilegiam funções nomeadas e laços `for`; ainda há funções arrow e métodos de array no código anterior. O enunciado pede priorizar funções tradicionais, não proíbe explicitamente todas as arrow functions.
8. **Revisar conteúdo da história e coerência visual.** Os quatro mecanismos extras foram colocados em casas existentes e conectados por dependências, mas o grupo deve confirmar que os textos e os objetos fazem sentido com a arte final de cada interior.

## Verificações executadas

- `npm run check`: sintaxe de quatro arquivos JavaScript, caminhos locais e teste isolado dos dez objetos aprovados.
- Busca por `addEventListener` e `createElement` nos arquivos JavaScript: nenhuma ocorrência ativa encontrada.
- Contagem dos arquivos HTML: 10 páginas de conteúdo, `index.html` e a página do jogo.
- Presença de pelo menos uma tabela HTML semântica.
- Verificação de IDs duplicados na página do jogo: nenhum ID duplicado encontrado.
- Teste isolado com DOM simulado: os dez objetos foram listados por ambiente, abertos e registrados sem exceção.
- Tentativa de captura headless em Chromium não terminou dentro do limite do ambiente; por isso, não foi considerada validação visual ou de jogabilidade.
