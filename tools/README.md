# Verificadores do projeto

Execute os comandos na pasta raiz do repositório.

| Comando | O que verifica |
|---|---|
| `npm run check:js` | Sintaxe dos scripts JavaScript ativos |
| `npm run check:links` | Caminhos locais referenciados no HTML, CSS e JS |
| `npm run check:html` | Estrutura básica, idioma, título, landmarks, IDs e nomes de botões |
| `npm run check:accessibility` | Presença de navegação por teclado, regiões semânticas, nomes/descrições e guia do jogo |
| `npm run check:rules` | Restrições do projeto, estrutura CSS, tabela, quantidade de páginas e API do guia |
| `npm run test:puzzles` | Ambientes, seis mecanismos, modelagem em objetos, abertura textual e reset |
| `npm run check` | Executa toda a bateria local acima |
| `npm run check:nu-html` | Envia cada HTML ao Nu HTML Checker oficial; requer conexão com a internet |

Os verificadores locais são uma bateria de regressão do projeto. Eles não substituem avaliação visual, testes de jogabilidade com pessoas, leitor de tela nem a validação formal do Nu HTML Checker.
