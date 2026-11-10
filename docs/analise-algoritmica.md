# 📐 Análise Algorítmica e Fundamentos Teóricos

Este documento formaliza a modelagem matemática e a análise de complexidade do projeto, desenvolvido originalmente no contexto da disciplina de **Projeto e Análise de Algoritmos (PAA)**.

---

## 1. O Problema do Sudoku como CSP (*Constraint Satisfaction Problem*)

O Sudoku pode ser formalizado como um **Problema de Satisfação de Restrições**:
- **Variáveis ($X$):** $X = \{x_{i,j} \mid 1 \le i, j \le 9\}$, representando as 81 células do tabuleiro 9×9.
- **Domínio ($D$):** Para cada variável não fixada inicialmente, $D_i = \{1, 2, 3, 4, 5, 6, 7, 8, 9\}$.
- **Restrições ($C$):**
  1. **Linhas:** $\text{Alldifferent}(x_{i, 1}, x_{i, 2}, \dots, x_{i, 9})$ para cada linha $i$.
  2. **Colunas:** $\text{Alldifferent}(x_{1, j}, x_{2, j}, \dots, x_{9, j})$ para cada coluna $j$.
  3. **Subgrades 3×3:** $\text{Alldifferent}(\{x_{i, j} \mid i \in [3a+1, 3a+3], j \in [3b+1, 3b+3]\})$ para $a, b \in \{0, 1, 2\}$.

O problema de decidir se um tabuleiro $N \times N$ arbitrário admite solução é **NP-Completo** (via redução a partir do problema *Exact Cover* ou *3-SAT*).

---

## 2. Árvore de Busca e Backtracking

O algoritmo clássico realiza uma **busca em profundidade (DFS)** com poda na árvore de decisões:

```text
                                [Raiz: Tabuleiro Inicial]
                                  /         |         \
                             Célula(0,0)=1  Célula(0,0)=2  ...
                                /      \
                         Célula(0,1)=3  Conflito! (Poda)
                             /
                      Célula(0,2)=...
```

### Análise Assintótica no Pior Caso

Seja $m$ o número de células vazias ($0 \le m \le 81$):
- **Complexidade de Tempo:**
  - **Pior Caso:** $\mathcal{O}(9^m)$ no caso patológico de força bruta irrestrita.
  - **Caso Médio (com poda imediata):** Drasticamente inferior, pois a verificação de conflito $\mathcal{O}(1)$ poda precocemente ramos inteiros da árvore de recursão.
- **Complexidade de Espaço:**
  - $\mathcal{O}(m)$ de memória na pilha de execução (profundidade máxima da recursão), que para $N=9$ é no máximo 81 chamadas. Espaço adicional de armazenamento do tabuleiro é $\mathcal{O}(1)$ ($\approx 81$ bytes).

---

## 3. Heurística MRV (*Minimum Remaining Values*)

A heurística **MRV** (também conhecida como *heurística da variável mais restrita* ou *fail-first*) modifica a ordem de escolha das variáveis:

> **Regra MRV:** Selecionar a célula vazia com o **menor número de valores válidos possíveis** remanescentes em seu domínio.

### Impacto Prático Observado

| Instância | Tentativas sem Heurística | Tentativas com MRV | Redução |
| :--- | :---: | :---: | :---: |
| **Fácil** | 37.652 | **239** | **~99,4%** |
| **Difícil** | 170.978 | **824** | **~99,5%** |

Ao escolher primeiro a variável com menos opções, o algoritmo:
1. Se uma célula tiver apenas 1 opção restante, ela é preenchida imediatamente com certeza (*forçamento*).
2. Se uma célula tiver 0 opções (conflito inevitável), o algoritmo falha e retrocede **imediatamente**, evitando explorar subtrens gigantescos fadados ao fracasso.

---

## 4. O "Desafio PAA" — Variante com Palíndromos

A variante apresentada no trabalho acadêmico introduz restrições estruturais customizadas modeladas em duas etapas:

### Fase 1: Diagonais Palíndromas Únicas
Para cada subgrade $3 \times 3$ $(B_{r, c})$ com $r, c \in \{0, 1, 2\}$:
- Os elementos da diagonal principal $D = [d_0, d_1, d_2]$ devem satisfazer a condição de simetria:
  $$d_0 = d_2 \quad \text{e} \quad d_0 \ne d_1$$
- **Unicidade Global:** O par ordenado $(d_0, d_1)$ não pode se repetir entre as 9 subgrades.

### Fase 2: Preenchimento das Subgrades com Restrições de Frequência
Para as células fora da diagonal em cada subgrade:
- Nenhum elemento pertencente à diagonal palíndroma pode ser reutilizado.
- Permitido no máximo **um único par repetido** em toda a subgrade.
- Nenhum número pode ter frequência $\ge 3$.

Essa modelagem demonstra a generalidade do método de **Backtracking** para resolver problemas arbitrários com restrições não padronizadas.
