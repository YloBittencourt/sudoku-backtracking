import test from 'node:test';
import assert from 'node:assert/strict';
import { conflitoClassico, resolverClassico, resolverPalindromo } from '../web/src/solver.js';

const parse = (s) => Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => +s[r * 9 + c]));

const ehValido = (b) => {
  for (let r = 0; r < 9; r++) {
    if (new Set(b[r]).size !== 9 || b[r].includes(0)) return false;
  }
  for (let c = 0; c < 9; c++) {
    const col = b.map((row) => row[c]);
    if (new Set(col).size !== 9 || col.includes(0)) return false;
  }
  for (let bi = 0; bi < 9; bi += 3) {
    for (let bj = 0; bj < 9; bj += 3) {
      const bloco = [];
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
          bloco.push(b[bi + i][bj + j]);
      if (new Set(bloco).size !== 9 || bloco.includes(0)) return false;
    }
  }
  return true;
};

test('conflitoClassico detecta conflitos de linha, coluna e bloco', () => {
  const b = Array.from({ length: 9 }, () => Array(9).fill(0));
  b[0][0] = 5;
  assert.ok(conflitoClassico(b, 0, 8, 5)); // linha
  assert.ok(conflitoClassico(b, 8, 0, 5)); // coluna
  assert.ok(conflitoClassico(b, 1, 1, 5)); // bloco 3x3
  assert.equal(conflitoClassico(b, 1, 1, 3), null); // sem conflito
});

test('resolverClassico resolve puzzle fácil com backtracking ingênuo', () => {
  const easy = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
  const b = parse(easy);
  const stats = { tries: 0, backtracks: 0, depth: 0 };
  const gen = resolverClassico(b, false, stats);
  let step;
  while (!(step = gen.next()).done);
  assert.equal(step.value, true);
  assert.ok(ehValido(b));
  assert.ok(stats.tries > 0);
});

test('heurística MRV resolve com significativamente menos tentativas', () => {
  const hard = '000000907000420180000705026100904000050000040000507009920108000034059000507000000';
  const bNaive = parse(hard);
  const statsNaive = { tries: 0, backtracks: 0, depth: 0 };
  const genNaive = resolverClassico(bNaive, false, statsNaive);
  while (!genNaive.next().done);

  const bMRV = parse(hard);
  const statsMRV = { tries: 0, backtracks: 0, depth: 0 };
  const genMRV = resolverClassico(bMRV, true, statsMRV);
  while (!genMRV.next().done);

  assert.ok(ehValido(bMRV));
  assert.ok(statsMRV.tries < statsNaive.tries / 100); // MRV deve ser mais de 100x mais rápido neste puzzle!
});

test('resolverPalindromo (desafio PAA) gera diagonais simétricas e únicas', () => {
  const b = Array.from({ length: 9 }, () => Array(9).fill(0));
  const stats = { tries: 0, backtracks: 0, depth: 0 };
  const gen = resolverPalindromo(b, stats);
  while (!gen.next().done);

  const diagonais = new Set();
  for (let bi = 0; bi < 9; bi += 3) {
    for (let bj = 0; bj < 9; bj += 3) {
      const d = [b[bi][bj], b[bi + 1][bj + 1], b[bi + 2][bj + 2]];
      assert.equal(d[0], d[2], `Diagonal do bloco (${bi/3}, ${bj/3}) deve ser palíndromo: ${d}`);
      diagonais.add(`${d[0]},${d[1]}`);
    }
  }
  assert.equal(diagonais.size, 9, 'Todas as 9 diagonais devem ser combinações palíndromas únicas');
});

