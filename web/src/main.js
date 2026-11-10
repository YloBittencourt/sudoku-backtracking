import { resolverClassico, resolverPalindromo } from './solver.js';

const PUZZLES = {
  easy: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
  hard: '000000907000420180000705026100904000050000040000507009920108000034059000507000000',
  killer: '000000000000003085001020000000507000004000100090000000500000073002010000000040009',
  empty: '0'.repeat(81),
};

const $ = (id) => document.getElementById(id);
const boardEl = $('board');
const cells = [];
for (let i = 0; i < 81; i++) {
  const d = document.createElement('div');
  d.className = 'cell';
  d.dataset.i = i;
  boardEl.appendChild(d);
  cells.push(d);
}

let board, givens, gen, stats, running = false, done = false, sel = -1, flash = [];

const parse = (s) => Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => +s[r * 9 + c]));

function reset() {
  running = false; done = false; gen = null; flash = [];
  stats = { tries: 0, backtracks: 0, depth: 0 };
  const pal = $('mode').value === 'pal';
  board = pal ? parse(PUZZLES.empty) : parse(PUZZLES[$('puzzle').value]);
  givens = board.map((row) => row.map((v) => v !== 0));
  $('puzzleWrap').style.display = pal ? 'none' : '';
  $('mrvWrap').style.display = pal ? 'none' : '';
  $('play').textContent = '▶ Resolver';
  $('log').innerHTML = '';
  render();
}

function render() {
  const pal = $('mode').value === 'pal';
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9), c = i % 9, v = board[r][c];
    const el = cells[i];
    el.textContent = v || '';
    let cls = 'cell';
    if (givens[r][c]) cls += ' given';
    else if (v) cls += ' place';
    if (pal && r % 3 === c % 3 && v) cls += ' pal';
    if (i === sel) cls += ' sel';
    el.className = cls;
  }
  for (const f of flash) cells[f.r * 9 + f.c].classList.add(f.type === 'conflict' ? 'conflict' : 'back');
  $('sTries').textContent = stats.tries.toLocaleString('pt-BR');
  $('sBack').textContent = stats.backtracks.toLocaleString('pt-BR');
  $('sDepth').textContent = stats.depth;
}

function addLog(ev) {
  if (!ev.msg) return;
  const li = document.createElement('li');
  li.textContent = ev.msg;
  li.className = ev.type;
  const log = $('log');
  log.appendChild(li);
  while (log.children.length > 9) log.firstChild.remove();
}

function ensureGen() {
  if (gen) return;
  gen = $('mode').value === 'pal'
    ? resolverPalindromo(board, stats)
    : resolverClassico(board, $('mrv').checked, stats);
}

// Executa 1 passo; devolve false quando termina.
function stepOnce() {
  ensureGen();
  const n = gen.next();
  if (n.done) {
    done = true; running = false; flash = [];
    $('play').textContent = '✔ Concluído';
    addLog({ type: 'place', msg: n.value === false ? 'Sem solução.' : `Pronto! ${stats.tries} tentativas, ${stats.backtracks} backtracks.` });
    return false;
  }
  flash = n.value.r === undefined ? [] : (n.value.type === 'conflict' || n.value.type === 'backtrack') ? [n.value] : [];
  addLog(n.value);
  return true;
}

// Velocidade: slider 0..100 -> 1 a ~20000 passos/s (escala exponencial).
const stepsPerSec = () => Math.round(Math.pow(10, (+$('speed').value / 100) * 4.3));
function updateSpeedLabel() { $('speedLabel').textContent = `${stepsPerSec().toLocaleString('pt-BR')} passos/s`; }

let last = 0, acc = 0;
function loop(t) {
  if (running) {
    acc += ((t - last) / 1000) * stepsPerSec();
    last = t;
    let n = Math.min(Math.floor(acc), 100000);
    acc -= Math.floor(acc);
    while (n-- > 0 && running) if (!stepOnce()) break;
    render();
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame((t) => { last = t; loop(t); });

$('play').onclick = () => {
  if (done) return;
  running = !running;
  $('play').textContent = running ? '⏸ Pausar' : '▶ Continuar';
  last = performance.now(); acc = 0;
};
$('step').onclick = () => { if (!done) { running = false; $('play').textContent = '▶ Continuar'; stepOnce(); render(); } };
$('reset').onclick = reset;
$('mode').onchange = reset;
$('puzzle').onchange = reset;
$('mrv').onchange = reset;
$('speed').oninput = updateSpeedLabel;

// Edição manual de células (quando parado e sem execução em andamento)
boardEl.addEventListener('click', (e) => {
  const i = e.target.dataset.i;
  if (i !== undefined) { sel = +i; render(); boardEl.focus(); }
});
boardEl.addEventListener('keydown', (e) => {
  if (sel < 0 || gen || $('mode').value === 'pal') return;
  const r = Math.floor(sel / 9), c = sel % 9;
  if (/^[1-9]$/.test(e.key)) { board[r][c] = +e.key; givens[r][c] = true; }
  else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { board[r][c] = 0; givens[r][c] = false; }
  else return;
  render();
});

updateSpeedLabel();
reset();
