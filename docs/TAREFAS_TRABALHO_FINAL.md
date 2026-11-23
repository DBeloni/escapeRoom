# Trabalho final — checklist de entrega

Checklist atualizado com base no projeto atual e nos critérios do trabalho.

## Estrutura do site

- [x] 10 páginas institucionais em HTML além da página do jogo (`index.html` + 10 arquivos em `pages/`).
- [x] Navegação entre páginas pelo menu e rodapé.
- [x] História, desenvolvedores, contato demonstrativo, cenários, itens, enigmas, finais, manual, tecnologia e galeria.
- [x] Listas, tabela semântica, multimídia e links internos, externos e de arquivos locais.
- [x] HTML semântico com cabeçalho, navegação, conteúdo principal e rodapé.
- [x] Folhas CSS externas com variáveis, seletores, hover, posicionamento, Flexbox, Grid e media queries.
- [ ] Confirmar no Nu HTML Checker todas as páginas e corrigir eventuais mensagens.
- [ ] Testar o formulário e todos os links no deploy publicado.

## Jogo

- [x] JavaScript Vanilla, sem framework de jogo.
- [x] Cinco itens modelados como objetos coletáveis.
- [x] Seis mecanismos modelados como objetos com estado e métodos.
- [x] Onze elementos interativos principais no total (5 itens + 6 mecanismos).
- [x] Interdependências por itens necessários e peças liberadas pelos desafios.
- [x] Inventário de cinco espaços com inspeção por botão, descrição e uso previsto.
- [x] Diário de Bordo com eventos da partida.
- [x] Guia Acessível com navegação textual entre a cidade e os cinco interiores, coleta textual e acesso aos mecanismos.
- [x] Aleatoriedade nas configurações dos desafios e sequência de partida.
- [x] Desafios por clique/toque e minigame de sequência por teclado.
- [x] Quatro desfechos: fuga de barco, fuga secreta, infecção pelo tempo e afogamento.
- [x] Reinício completo de estado e temporizador.
- [ ] Jogar do início ao fim em navegador real e comprovar a rota completa.
- [ ] Conferir as coordenadas e o acesso físico a cada item/mecanismo.
- [ ] Cronometrar partidas para confirmar 2–5 minutos.
- [ ] Testar leitor de tela e controles de teclado em todas as telas.

## Restrições de JavaScript

- [x] Não há `addEventListener` nos arquivos JavaScript ativos.
- [x] Não há `document.createElement` nos arquivos JavaScript ativos.
- [x] As principais ações de interface usam propriedades de evento (`onclick`, `oninput`, `onkeydown` etc.).
- [ ] Revisar com o professor se a orientação sobre funções arrow exige removê-las de todo o código preexistente; o enunciado apresentado pede priorizar funções tradicionais e laços `for`.

## Ferramentas de verificação

Na raiz do projeto:

```bash
npm run check
```

Validação oficial de HTML (requer internet):

```bash
npm run check:nu-html
```

Arquivos de verificação ficam em `tools/`. O comando `npm run check` inclui sintaxe, caminhos, estrutura HTML básica, acessibilidade estática, regras do projeto e teste isolado dos puzzles.

## Git, deploy e apresentação

- [ ] Conferir o `git status` e revisar todas as alterações.
- [ ] Criar commits descritivos de todos os integrantes e enviar ao repositório remoto.
- [ ] Publicar a versão atualizada na Vercel.
- [ ] Abrir o deploy em outro navegador ou dispositivo e testar caminhos/arquivos.
- [ ] Preparar uma demonstração entre 2 e 5 minutos, incluindo coleta, diário, puzzle de clique, puzzle de teclado e um final.
- [ ] Entregar o link e os arquivos no Moodle.
