# Quarantine Protocol

> Escape room de exploração e investigação em pixel art, ambientado em uma comunidade costeira isolada em 1984.

## Sobre o projeto

Em 1984, uma doença desconhecida se espalha por uma pequena vila pesqueira isolada. As autoridades isolam a região e evacuam os moradores em barcos de pesca. Por um erro nos registros, um pescador fica para trás. Dois ou três dias depois, sozinho e sem saída por terra ou barcos, ele precisa reunir materiais e construir uma embarcação para escapar.

O projeto combina exploração em pixel art, enigmas, inventário e narrativa ambiental. A história é descoberta por documentos, objetos, mecanismos e detalhes dos cenários.

## Tecnologias

- **HTML5** — estrutura semântica das páginas e do jogo.
- **CSS3** — layout, responsividade e identidade visual.
- **JavaScript** — interface do site e lógica da partida.
- **Git + GitHub** — versionamento e colaboração.
- **Vercel** — hospedagem.

## Estrutura principal

```text
escapeRoom/
├── index.html                  # Entrada do site
├── pages/                      # Páginas institucionais
├── html/mapaPrincipal.html     # Entrada do jogo
├── css/                        # Estilos ativos do site e do jogo
├── js/                         # Scripts ativos
│   ├── site.js                 # Interações do site
│   ├── script.js               # Lógica principal da partida
│   └── systems/                # Puzzles e temporizador usados pelo jogo
├── assets/                     # Mapas, sprites, itens e identidade visual
├── docs/                       # Documentação narrativa e técnica
├── tools/check-js.mjs          # Verificação de sintaxe JavaScript
├── package.json
└── README.md
```

## Documentação

Antes de criar novas pistas, diálogos ou áreas, leia [`docs/README.md`](docs/README.md) e [`docs/CANONE_E_PENDENCIAS.md`](docs/CANONE_E_PENDENCIAS.md).

Para entender onde cada parte do jogo fica e como a partida funciona, consulte o [Guia simples do código](docs/GUIA_CODIGO.md).

## Equipe

| Integrante | Área principal |
|---|---|
| **Davi Beloni** | JavaScript / Lógica |
| **João Lucas** | HTML / CSS / Interface |

## Como executar

1. Abra no VS Code a pasta `escapeRoom` inteira, e não apenas a pasta `html`.
2. Inicie o Live Server pelo arquivo `index.html`, que fica na raiz do projeto.
3. Acesse o jogo pelo botão **Acessar jogo** do site. O endereço do jogo será `/html/mapaPrincipal.html`.
4. Para conferir os arquivos antes de entregar, execute `npm run check`.

Também é possível abrir `index.html` diretamente no navegador, mas o Live Server é recomendado para testar o jogo. Não inicie o servidor dentro de `html`, `pages`, `css` ou `js`, pois isso muda a raiz dos endereços relativos.

Não há etapa de build nem dependências externas instaladas pelo npm. O site usa Google Fonts pela internet.

## Status

**Em desenvolvimento.** O mapa da Zona Costeira, os interiores, o inventário e os desafios de fuga continuam recebendo ajustes.
