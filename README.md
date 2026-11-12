# Quarantine Protocol

> Escape room de exploração e investigação em pixel art, ambientado em uma comunidade costeira isolada em 1984.

## Sobre o projeto

Em Santa Bruma, uma evacuação é interrompida por uma tempestade, uma queda de energia e a subida da maré. A região é registrada como vazia, mas os vestígios encontrados nas casas, na clínica, na rádio e na oficina contam outra história.

O jogador desperta na Zona Costeira às 07h42, depois de uma transmissão retornar à frequência comunitária 04. A saída é urgente. Entender quem ficou para trás é uma escolha.

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

Antes de criar novas pistas, diálogos ou áreas, leia [`docs/README.md`](docs/README.md). A bíblia narrativa em [`docs/story-bible.md`](docs/story-bible.md) define a direção atual do universo.

A organização real dos arquivos em execução está descrita em [`docs/architecture.md`](docs/architecture.md).

## Equipe

| Integrante | Área principal |
|---|---|
| **Davi Beloni** | JavaScript / Lógica |
| **João Lucas** | HTML / CSS / Interface |

## Como executar

1. Abra `index.html` para acessar o site.
2. Use o botão **Acessar jogo** para abrir `html/mapaPrincipal.html`.
3. Para validar a sintaxe dos scripts, execute `npm run check:js`.

Não há etapa de build nem dependências externas instaladas pelo npm. O site usa Google Fonts pela internet.

## Status

**Em desenvolvimento.** O mapa da Zona Costeira, os interiores, o inventário e os desafios de fuga continuam recebendo ajustes.
