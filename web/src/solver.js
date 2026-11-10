// Solvers escritos como geradores: cada `yield` é um passo visível do backtracking.
// Eventos: { type: 'try' | 'conflict' | 'place' | 'backtrack' | 'info', r, c, v, msg }
// O tabuleiro (matriz 9x9 de inteiros, 0 = vazio) é alterado no lugar.

export function conflitoClassico(b, r, c, v) {
  for (let k = 0; k < 9; k++) {
    if (b[r][k] === v) return `${v} já existe na linha ${r + 1}`;
    if (b[k][c] === v) return `${v} já existe na coluna ${c + 1}`;
  }
  const br = r - (r % 3), bc = c - (c % 3);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (b[br + i][bc + j] === v) return `${v} já existe no bloco 3x3`;
  return null;
}

function candidatos(b, r, c) {
  const out = [];
  for (let v = 1; v <= 9; v++) if (!conflitoClassico(b, r, c, v)) out.push(v);
  return out;
}

function proximaCelula(b, mrv) {
  let best = null, bestN = 10;
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      if (b[r][c] !== 0) continue;
      if (!mrv) return { r, c };
      const n = candidatos(b, r, c).length;
      if (n < bestN) { bestN = n; best = { r, c }; if (n === 0) return best; }
    }
  return best;
}

// ---------- Sudoku clássico (backtracking ingênuo ou com heurística MRV) ----------
export function* resolverClassico(b, mrv, stats) {
  const cel = proximaCelula(b, mrv);
  if (!cel) return true;
  const { r, c } = cel;
  stats.depth++;
  for (let v = 1; v <= 9; v++) {
    const motivo = conflitoClassico(b, r, c, v);
    stats.tries++;
    if (motivo) {
      yield { type: 'conflict', r, c, v, msg: `Linha ${r + 1}, coluna ${c + 1}: tentando ${v}… ✗ ${motivo}` };
      continue;
    }
    b[r][c] = v;
    yield { type: 'place', r, c, v, msg: `Linha ${r + 1}, coluna ${c + 1}: ${v} é válido ✓ — avançando` };
    if (yield* resolverClassico(b, mrv, stats)) return true;
    b[r][c] = 0;
    stats.backtracks++;
    yield { type: 'backtrack', r, c, v, msg: `Beco sem saída — voltando: removendo ${v} de (${r + 1},${c + 1})` };
  }
  stats.depth--;
  return false;
}

// ---------- Variante "Desafio PAA": palíndromos nas diagonais dos blocos ----------
// Port fiel de sudoku.c (backtracking_diagonal + preencher_subtabuleiro_com_restricoes).

const ehPalindromo = (s) => s.every((x, i) => x === s[s.length - 1 - i]);

function* diagonal(b, bi, bj, k, diag, usos, existentes, stats) {
  if (k === 3) {
    const [a, m] = [diag[0], diag[1]];
    if (ehPalindromo(diag) && !existentes.has(`${a},${m}`)) {
      existentes.add(`${a},${m}`);
      return true;
    }
    return false;
  }
  for (let v = 1; v <= 9; v++) {
    stats.tries++;
    if (usos[v] >= 2) {
      yield { type: 'conflict', r: bi + k, c: bj + k, v, msg: `Diagonal: ${v} já usado 2× neste bloco` };
      continue;
    }
    b[bi + k][bj + k] = v; usos[v]++; diag.push(v);
    yield { type: 'try', r: bi + k, c: bj + k, v, msg: `Diagonal do bloco (${bi / 3 + 1},${bj / 3 + 1}): tentando ${v} na posição ${k + 1}` };
    stats.depth++;
    if (yield* diagonal(b, bi, bj, k + 1, diag, usos, existentes, stats)) { stats.depth--; return true; }
    stats.depth--;
    b[bi + k][bj + k] = 0; usos[v]--; diag.pop();
    stats.backtracks++;
    yield { type: 'backtrack', r: bi + k, c: bj + k, v, msg: `Diagonal não formou palíndromo único — desfazendo ${v}` };
  }
  return false;
}

function restricoesOk(b, bi, bj, pal) {
  const cont = Array(10).fill(0);
  let pares = 0;
  for (let i = bi; i < bi + 3; i++)
    for (let j = bj; j < bj + 3; j++) {
      const v = b[i][j];
      if (v !== 0 && !pal.includes(v)) {
        cont[v]++;
        if (cont[v] === 2) { if (++pares > 1) return false; }
        else if (cont[v] > 2) return false;
      }
    }
  return true;
}

function* preencher(b, bi, bj, pal, parUsado, stats) {
  let pos = null;
  outer: for (let i = bi; i < bi + 3; i++)
    for (let j = bj; j < bj + 3; j++)
      if (b[i][j] === 0 && i !== j) { pos = { i, j }; break outer; }
  if (!pos) return true;
  const { i: r, j: c } = pos;
  for (let v = 1; v <= 9; v++) {
    if (pal.includes(v)) continue;
    let repetindo = false;
    for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (b[bi + x][bj + y] === v) repetindo = true;
    stats.tries++;
    if (repetindo && parUsado) {
      yield { type: 'conflict', r, c, v, msg: `Bloco (${bi / 3 + 1},${bj / 3 + 1}): ${v} formaria um 2º par — proibido` };
      continue;
    }
    b[r][c] = v;
    if (restricoesOk(b, bi, bj, pal)) {
      yield { type: 'place', r, c, v, msg: `Bloco (${bi / 3 + 1},${bj / 3 + 1}): ${v} em (${r + 1},${c + 1}) respeita as restrições` };
      stats.depth++;
      if (yield* preencher(b, bi, bj, pal, parUsado || repetindo, stats)) { stats.depth--; return true; }
      stats.depth--;
    } else {
      yield { type: 'conflict', r, c, v, msg: `Bloco (${bi / 3 + 1},${bj / 3 + 1}): ${v} viola a regra de pares` };
    }
    b[r][c] = 0;
    stats.backtracks++;
    yield { type: 'backtrack', r, c, v, msg: `Voltando: removendo ${v} de (${r + 1},${c + 1})` };
  }
  return false;
}

export function* resolverPalindromo(b, stats) {
  const existentes = new Set();
  yield { type: 'info', msg: 'Fase 1: gerar um palíndromo único na diagonal de cada bloco' };
  for (let bi = 0; bi < 9; bi += 3)
    for (let bj = 0; bj < 9; bj += 3)
      yield* diagonal(b, bi, bj, 0, [], Array(10).fill(0), existentes, stats);
  yield { type: 'info', msg: 'Fase 2: preencher o resto de cada bloco com restrições' };
  for (let bi = 0; bi < 9; bi += 3)
    for (let bj = 0; bj < 9; bj += 3) {
      const pal = [0, 1, 2].map((k) => b[bi + k][bj + k]);
      yield* preencher(b, bi, bj, pal, false, stats);
    }
  return true;
}

