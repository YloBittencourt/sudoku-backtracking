# 🧩 Sudoku Backtracking Visualizer

[![CI](https://github.com/SEU-USUARIO/NOME-DO-REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/SEU-USUARIO/NOME-DO-REPO/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Live_Demo-GitHub_Pages-2ea44f)](https://SEU-USUARIO.github.io/NOME-DO-REPO/)

Visualizador interativo de **backtracking** aplicado ao Sudoku, nascido de um trabalho da disciplina de
*Projeto e Análise de Algoritmos* (PAA). Veja o algoritmo tentar, errar e voltar atrás em tempo real.

> 🔗 **Demo online:** `https://SEU-USUARIO.github.io/NOME-DO-REPO/` *(ative o GitHub Pages — veja abaixo)*
>
> 📸 *Adicione aqui um GIF da resolução (ex.: gravado com [peek](https://github.com/phw/peek) ou ScreenToGif).*

## ✨ Funcionalidades

- **Animação passo a passo** do backtracking: verde (válido), vermelho (conflito), laranja (backtrack).
- **Controles**: resolver/pausar, passo a passo, reiniciar e velocidade de 1 a ~20.000 passos/s.
- **Métricas em tempo real**: tentativas, backtracks e profundidade da recursão.
- **Raio-X do algoritmo**: log explicando *por que* cada número foi aceito ou rejeitado.
- **Heurística MRV** (*Minimum Remaining Values*) opcional — compare com o backtracking ingênuo.
- **Edite o tabuleiro**: clique numa célula e digite 1–9 (Backspace apaga).
- **Desafio PAA**: variante do trabalho original, com palíndromos nas diagonais dos blocos 3×3.

## 🧠 O algoritmo

```text
resolver(tabuleiro):
  célula ← próxima célula vazia
  se não há célula: return SUCESSO
  para v em 1..9:
    se v é válido em célula:
      célula ← v                 # tenta
      se resolver(tabuleiro): return SUCESSO
      célula ← 0                 # backtrack
  return FALHA
```

**Complexidade:** no pior caso `O(9^m)`, com `m` = número de células vazias. A poda (checagem de
linha/coluna/bloco antes de recursar) reduz muito o espaço de busca, e a heurística MRV reduz ainda mais:

| Puzzle | Sem MRV (tentativas) | Com MRV (tentativas) |
| :-- | --: | --: |
| Fácil | 37.652 | 239 |
| Difícil | 170.978 | 824 |

### Variante "Desafio PAA" (palíndromos)

Port fiel do código original em C ([`core/sudoku.c`](core/sudoku.c)), em duas fases de backtracking:

1. A diagonal de cada bloco 3×3 recebe um **palíndromo único** (nenhum valor usado 3×, sem repetir entre blocos).
2. O restante de cada bloco é preenchido respeitando: **no máximo um par repetido** por bloco.

## 🚀 Como rodar

**Web** (sem build, sem dependências) — a partir da raiz do repositório:

```bash
cd web && python3 -m http.server 8000   # abra http://localhost:8000
```

> Módulos ES exigem servidor HTTP; abrir o `index.html` direto (`file://`) não funciona.

**Rodar testes automatizados:**

```bash
node --test test/solver.test.js
```

**Versão original em C (terminal):**

```bash
cd core && make run
```

## 🌐 Publicar no GitHub Pages

1. Suba o repositório para o GitHub (branch `main`).
2. Em **Settings → Pages → Source**, escolha **GitHub Actions**.
3. O workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publica a pasta `web/` a cada push.

## 📁 Estrutura

```text
├── core/            # Código original em C (backtracking + palíndromos) e Makefile
├── web/             # Visualizador (HTML + CSS + JS puro, ES modules)
│   └── src/solver.js   # Algoritmos como geradores: cada yield = um passo animado
└── .github/workflows/  # Deploy automático no GitHub Pages
```

## 💡 Próximos passos

- Voltar passo (rewind) e gráfico da árvore de recursão.
- Compilar o C para WebAssembly (Emscripten) e usá-lo no lugar do solver JS.
- Algoritmo X / Dancing Links para comparar.

## 📄 Licença

MIT — veja [LICENSE](LICENSE).

