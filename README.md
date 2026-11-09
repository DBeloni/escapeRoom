# Quarantine Protocol

> Escape room de exploração e investigação em pixel art, ambientado em uma comunidade costeira isolada em 1984.

## Sobre o projeto

Em Santa Bruma, uma evacuação é interrompida por uma tempestade, uma queda de energia e a subida da maré. A região é registrada como vazia, mas os vestígios encontrados nas casas, na clínica, na enfermaria e na oficina contam outra história.

O jogador desperta na Zona Costeira às 07h42, depois de uma transmissão retornar à frequência comunitária 04. A saída é urgente. Entender quem ficou para trás é uma escolha.

O projeto combina exploração em pixel art, enigmas, inventário e narrativa ambiental. A história é descoberta por documentos, objetos, mecanismos e detalhes dos cenários — não por longas explicações.

## Tecnologias

- **HTML5** — estrutura semântica das páginas
- **CSS3** — layout, responsividade e identidade visual
- **JavaScript** — lógica e interação do jogo
- **Git + GitHub** — versionamento e colaboração
- **Vercel** — hospedagem

## Estrutura

```text
escapeRoom/
├── index.html
├── css/
├── js/
├── pages/
├── html/
├── assets/
├── docs/
├── prototypes/
├── legacy/
└── README.md
```

## Documentação

Antes de criar novas pistas, diálogos ou áreas, leia [`docs/README.md`](docs/README.md). A bíblia narrativa em [`docs/story-bible.md`](docs/story-bible.md) define a direção atual do universo.

## Equipe

| Integrante | Área principal |
|---|---|
| **Davi Beloni** | JavaScript / Lógica |
| **João Lucas** | HTML / CSS / Interface |

## Como executar

1. Clone o repositório:

   ```bash
   git clone https://github.com/DBeloni/escapeRoom.git
   ```

2. Entre na pasta do projeto:

   ```bash
   cd escapeRoom
   ```

3. Abra `index.html` em um navegador. Caso sejam usadas funcionalidades que dependam de módulos ES ou carregamento local de assets, execute por um servidor local.

## Status

**Em desenvolvimento.** O mapa da Zona Costeira, os interiores e o inventário estão em construção. A narrativa foi organizada para orientar as próximas etapas de documentos encontráveis, puzzles, interações e desfechos.
