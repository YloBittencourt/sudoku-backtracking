# 🧩 Sudoku Backtracking Visualizer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![C: C99](https://img.shields.io/badge/Language-C99-00599C.svg)](core/)
[![JavaScript: ES2022](https://img.shields.io/badge/Frontend-ES_Modules-F7DF1E.svg)](web/)

Visualizador interativo de **Backtracking** e **Heurística MRV** aplicados ao Sudoku, nascido de um projeto da disciplina de **Projeto e Análise de Algoritmos (PAA)**. 

O projeto permite ver o algoritmo tomar decisões, explorar a árvore de estados, encontrar contradições e retroceder (*backtrack*) em tempo real.

---

## ✨ Funcionalidades

- **Animação Passo a Passo**: Visualização gráfica dos estados do algoritmo:
  - 🟢 **Verde**: Dígito válido inserido.
  - 🔴 **Vermelho**: Conflito de regra detectado (linha, coluna ou bloco 3×3).
  - 🟠 **Laranja**: Ponto de *backtracking* (beco sem saída desfeito).
  - 🟡 **Dourado**: Diagonais palíndromas validadas.
- **Controles de Execução**: Play/Pause, avançar passo a passo, reiniciar e slider de velocidade (de 1 a ~20.000 passos/segundo).
- **Métricas em Tempo Real**: Contagem de tentativas, podas/backtracks e profundidade da pilha de recursão.
- **Raio-X do Algoritmo**: Log lateral detalhado explicando cada decisão e poda.
- **Heurística MRV (*Minimum Remaining Values*)**: Ative ou desative para comparar o backtracking ingênuo contra a ordenação por menor domínio.
- **Edição Interativa**: Clique em qualquer célula vazia e digite dígitos de 1 a 9 no teclado (Backspace apaga).
- **Desafio PAA**: Modo especial que executa o algoritmo original com restrições exóticas (palíndromos nas diagonais dos blocos 3×3 e controle de pares).

---

## 🧠 Algoritmo e Comparação de Desempenho

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

A complexidade no pior caso de força bruta é $\mathcal{O}(9^m)$, onde $m$ é o número de células vazias. A poda de viabilidade reduz o espaço de busca, e a **heurística MRV** (*fail-first*) reduz as tentativas em mais de 99%:

| Instância do Tabuleiro | Força Bruta / Ingênuo | Com Heurística MRV | Redução de Tentativas |
| :--- | :---: | :---: | :---: |
| **Fácil** | 37.652 tentativas | **239 tentativas** | **~99,4%** |
| **Difícil** | 170.978 tentativas | **824 tentativas** | **~99,5%** |

> 📖 **Para uma análise matemática completa** (modelagem CSP, redução NP-Completo e análise assintótica), leia o documento: [**docs/analise-algoritmica.md**](docs/analise-algoritmica.md).

### Variante "Desafio PAA" (Palíndromos)

Port fiel do código original em C ([`core/sudoku.c`](core/sudoku.c)), dividido em duas fases de backtracking:

1. **Fase 1 (Diagonais)**: A diagonal principal de cada bloco 3×3 recebe um **palíndromo único** de 3 dígitos (ex: `1-2-1`), sem repetição de padrão entre os 9 blocos.
2. **Fase 2 (Subgrades)**: O restante de cada bloco é preenchido respeitando a regra de no máximo um único par repetido fora da diagonal.

---

## 🚀 Como Rodar Localmente

### 1. Visualizador Web

Sem necessidade de build ou instalação de dependências pesadas. Basta rodar um servidor HTTP local a partir da raiz:

```bash
cd web
python3 -m http.server 8080
```

Abra no navegador: 👉 **[http://localhost:8080](http://localhost:8080)**

*(Nota: navegadores exigem um servidor HTTP local para carregar módulos JavaScript `type="module"` por segurança).*

### 2. Testes Automatizados

Suíte de testes unitários nativa (sem frameworks externos):

```bash
npm test
# ou: node --test test/solver.test.js
```

### 3. Programa Original em C (Terminal)

Para compilar e executar o código C original via terminal:

```bash
cd core
make run
```

---

## 📁 Estrutura do Repositório

```text
├── core/                        # Motor original em C e Makefile
│   ├── sudoku.c                 # Algoritmo de backtracking com palíndromos
│   └── Makefile                 # Automação de compilação (gcc)
├── web/                         # Visualizador gráfico interativo
│   ├── index.html               # Estrutura e layout responsivo
│   ├── style.css                # Estilização com tema dark e efeitos visuais
│   └── src/
│       ├── main.js              # Controlador da interface e loop de animação
│       └── solver.js            # Solvers escritos como Geradores (yield por passo)
├── docs/                        # Fundamentos teóricos e análise de algoritmos
│   └── analise-algoritmica.md   # Modelagem CSP, complexidade e heurísticas
├── test/                        # Suíte de testes automatizados
│   └── solver.test.js           # Validação de regras clássicas, MRV e palíndromos
├── package.json                 # Configuração do módulo ES e script de teste
├── LICENSE                      # Licença MIT
└── README.md                    # Documentação do projeto
```

---

## 💡 Próximos Passos e Melhorias Futuras

- [ ] Exportação/importação de tabuleiros customizados via URL hash.
- [ ] Compilação do motor em C para WebAssembly (WASM) via Emscripten.
- [ ] Implementação do **Algoritmo X de Donald Knuth** com *Dancing Links* (DLX) para benchmark comparativo.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [`LICENSE`](LICENSE) para mais detalhes.
