/* ──────────────────────────────────────────────────────────
   GAME SWITCHER
────────────────────────────────────────────────────────── */
function switchGame(game) {
    document.getElementById('area-minesweeper').classList.toggle('visible', game === 'minesweeper');
    document.getElementById('area-2048').classList.toggle('visible', game === '2048');
    document.getElementById('btn-ms').classList.toggle('active', game === 'minesweeper');
    document.getElementById('btn-t').classList.toggle('active', game === '2048');
}

/* ══════════════════════════════════════════════════════════
   MINESWEEPER  (9×9, 10 mines)
══════════════════════════════════════════════════════════ */
const MS_ROWS = 9, MS_COLS = 9, MS_MINES = 10;
let msBoard = [], msFlagged = 0, msRevealed = 0, msGameOver = false;
let msTimerInterval = null, msSeconds = 0, msStarted = false;

function msNewGame() {
    clearInterval(msTimerInterval);
    msSeconds = 0; msStarted = false; msGameOver = false;
    msFlagged = 0; msRevealed = 0;
    document.getElementById('ms-timer').textContent = '0s';
    document.getElementById('ms-mines').textContent = 'Mines: ' + MS_MINES;
    document.getElementById('ms-message').textContent = '';

    // Build empty board
    msBoard = Array.from({length: MS_ROWS}, () =>
        Array.from({length: MS_COLS}, () => ({mine:false, revealed:false, flagged:false, neighbours:0}))
    );
    msRender();
}

function msPlaceMines(firstR, firstC) {
    // Avoid placing mine on first click or its neighbours
    const safe = new Set();
    for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
            const r = firstR+dr, c = firstC+dc;
            if (r>=0 && r<MS_ROWS && c>=0 && c<MS_COLS) safe.add(r*MS_COLS+c);
        }
    let placed = 0;
    while (placed < MS_MINES) {
        const idx = Math.floor(Math.random() * MS_ROWS * MS_COLS);
        if (!safe.has(idx) && !msBoard[Math.floor(idx/MS_COLS)][idx%MS_COLS].mine) {
            msBoard[Math.floor(idx/MS_COLS)][idx%MS_COLS].mine = true;
            placed++;
        }
    }
    // Compute neighbour counts
    for (let r = 0; r < MS_ROWS; r++)
        for (let c = 0; c < MS_COLS; c++) {
            if (msBoard[r][c].mine) continue;
            let cnt = 0;
            msForNeighbours(r, c, (nr, nc) => { if (msBoard[nr][nc].mine) cnt++; });
            msBoard[r][c].neighbours = cnt;
        }
}

function msForNeighbours(r, c, fn) {
    for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
            if (dr===0 && dc===0) continue;
            const nr=r+dr, nc=c+dc;
            if (nr>=0 && nr<MS_ROWS && nc>=0 && nc<MS_COLS) fn(nr, nc);
        }
}

function msReveal(r, c) {
    const cell = msBoard[r][c];
    if (cell.revealed || cell.flagged) return;
    cell.revealed = true;
    msRevealed++;

    if (cell.mine) {
        msGameOver = true;
        clearInterval(msTimerInterval);
        // Reveal all mines
        for (let i=0; i<MS_ROWS; i++)
            for (let j=0; j<MS_COLS; j++)
                if (msBoard[i][j].mine) msBoard[i][j].revealed = true;
        msRender();
        document.getElementById('ms-message').textContent = 'Game over. Try again.';
        return;
    }
    // Flood-fill for empty cells
    if (cell.neighbours === 0) {
        msForNeighbours(r, c, (nr, nc) => {
            if (!msBoard[nr][nc].revealed && !msBoard[nr][nc].flagged) msReveal(nr, nc);
        });
    }
    // Win check
    if (msRevealed === MS_ROWS * MS_COLS - MS_MINES) {
        msGameOver = true;
        clearInterval(msTimerInterval);
        msRender();
        document.getElementById('ms-message').textContent = 'You win. All mines cleared.';
    }
}

function msCountFlaggedAround(r, c) {
    let flagged = 0;
    msForNeighbours(r, c, (nr, nc) => {
        if (msBoard[nr][nc].flagged) flagged++;
    });
    return flagged;
}

function msAutoRevealAround(r, c) {
    const cell = msBoard[r][c];
    if (!cell.revealed || cell.mine || cell.neighbours === 0 || msGameOver) return false;

    if (msCountFlaggedAround(r, c) !== cell.neighbours) return false;

    msForNeighbours(r, c, (nr, nc) => {
        const neighbour = msBoard[nr][nc];
        if (!neighbour.revealed && !neighbour.flagged) {
            msReveal(nr, nc);
        }
    });

    return true;
}

function msRender() {
    const board = document.getElementById('ms-board');
    board.innerHTML = '';
    for (let r = 0; r < MS_ROWS; r++) {
        for (let c = 0; c < MS_COLS; c++) {
            const cell = msBoard[r][c];
            const el = document.createElement('div');
            el.className = 'ms-cell';

            if (cell.revealed) {
                el.classList.add('ms-revealed');
                if (cell.mine) {
                    el.classList.add('ms-mine-hit');
                        el.textContent = 'X';
                } else if (cell.neighbours > 0) {
                    el.textContent = cell.neighbours;
                }
            } else if (cell.flagged) {
                    el.textContent = 'F';
            }

            const row = r, col = c;
            el.addEventListener('click', () => {
                if (msGameOver) return;

                const current = msBoard[row][col];
                if (current.revealed) {
                    if (msAutoRevealAround(row, col)) msRender();
                    return;
                }

                if (current.flagged) return;

                if (!msStarted) {
                    msStarted = true;
                    msPlaceMines(row, col);
                    msTimerInterval = setInterval(() => {
                        msSeconds++;
                        document.getElementById('ms-timer').textContent = msSeconds + 's';
                    }, 1000);
                }
                msReveal(row, col);
                msRender();
            });
            el.addEventListener('contextmenu', e => {
                e.preventDefault();
                if (msGameOver) return;

                const current = msBoard[row][col];
                if (current.revealed) {
                    if (msAutoRevealAround(row, col)) msRender();
                    return;
                }

                current.flagged = !current.flagged;
                msFlagged += current.flagged ? 1 : -1;
                document.getElementById('ms-mines').textContent = 'Mines: ' + (MS_MINES - msFlagged);
                msRender();
            });

            board.appendChild(el);
        }
    }
}

/* ══════════════════════════════════════════════════════════
   2048  (4×4) — tile-identity model with CSS transitions
══════════════════════════════════════════════════════════ */
let tTiles = [], tScore = 0, tBest = 0, tOver = false, tWon = false;
let tNextId = 1, tPreviousState = null;

function tGridOf(tiles) {
    const g = Array.from({length:4}, () => new Array(4).fill(null));
    tiles.forEach(t => g[t.row][t.col] = t);
    return g;
}
function tRandomEmpty(tiles) {
    const occ = new Set(tiles.map(t => t.row + ',' + t.col));
    const empty = [];
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) if (!occ.has(r+','+c)) empty.push([r,c]);
    if (!empty.length) return null;
    return empty[Math.floor(Math.random()*empty.length)];
}
function tAddTile(animate) {
    const pos = tRandomEmpty(tTiles);
    if (!pos) return null;
    const t = { id: tNextId++, value: Math.random()<.9 ? 2 : 4,
                row: pos[0], col: pos[1], isNew: animate, isMerged: false };
    tTiles.push(t);
    return t;
}
function tHasMoves() {
    if (tTiles.length < 16) return true;
    const g = tGridOf(tTiles);
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) {
        if (c<3 && g[r][c].value === g[r][c+1].value) return true;
        if (r<3 && g[r][c].value === g[r+1][c].value) return true;
    }
    return false;
}
function tSlideLine(line) {
    const src = line.filter(Boolean);
    const out = new Array(4).fill(null);
    const merges = [];
    let gain = 0, pos = 0;
    for (let i = 0; i < src.length; i++) {
        if (i+1 < src.length && src[i].value === src[i+1].value) {
            const val = src[i].value * 2;
            gain += val;
            out[pos++] = { ...src[i], value: val, isMerged: true, isNew: false };
            merges.push({ survivorId: src[i].id, absorbedId: src[i+1].id });
            i++;
        } else {
            out[pos++] = { ...src[i], isMerged: false, isNew: false };
        }
    }
    return { out, merges, gain };
}
function tNewGame() {
    tTiles = []; tScore = 0; tOver = false; tWon = false; tPreviousState = null;
    document.getElementById('t-score').textContent = 0;
    document.getElementById('t-message').textContent = '';
    document.getElementById('t-undo-btn').disabled = true;
    const bg = document.getElementById('t-bg-cells');
    if (!bg.children.length)
        for (let i=0;i<16;i++) { const d=document.createElement('div'); d.className='t-bg-cell'; bg.appendChild(d); }
    document.getElementById('t-tile-layer').innerHTML = '';
    tAddTile(false); tAddTile(false);
    tRender();
}
function tUndo() {
    if (!tPreviousState) return;
    const s = tPreviousState;
    tTiles = s.tiles.map(t => ({...t}));
    tScore = s.score; tBest = s.best; tOver = s.over; tWon = s.won;
    document.getElementById('t-score').textContent = tScore;
    document.getElementById('t-best').textContent  = tBest;
    document.getElementById('t-message').textContent = s.msg;
    tPreviousState = null;
    document.getElementById('t-undo-btn').disabled = true;
    document.getElementById('t-tile-layer').innerHTML = '';
    tRender();
}
function tMove(dir) {
    if (tOver) return;
    const grid = tGridOf(tTiles);
    let moved = false, totalGain = 0;
    const next = [], allMerges = [];
    for (let i = 0; i < 4; i++) {
        let line;
        if (dir==='left')  line = grid[i].slice();
        if (dir==='right') line = [...grid[i]].reverse();
        if (dir==='up')    line = [0,1,2,3].map(r => grid[r][i]);
        if (dir==='down')  line = [3,2,1,0].map(r => grid[r][i]);
        const { out, merges, gain } = tSlideLine(line);
        allMerges.push(...merges);
        totalGain += gain;
        out.forEach((t, idx) => {
            if (!t) return;
            let row, col;
            if (dir==='left')  { row=i;     col=idx;   }
            if (dir==='right') { row=i;     col=3-idx; }
            if (dir==='up')    { row=idx;   col=i;     }
            if (dir==='down')  { row=3-idx; col=i;     }
            const orig = tTiles.find(o => o.id === t.id);
            if (!orig || orig.row !== row || orig.col !== col || t.isMerged) moved = true;
            next.push({ ...t, row, col });
        });
    }
    if (!moved) return;
    tPreviousState = {
        tiles: tTiles.map(t => ({...t})),
        score: tScore, best: tBest, over: tOver, won: tWon,
        msg: document.getElementById('t-message').textContent
    };
    document.getElementById('t-undo-btn').disabled = false;
    const mergeDestMap = new Map();
    for (const { survivorId, absorbedId } of allMerges) {
        const dest = next.find(t => t.id === survivorId);
        if (dest) mergeDestMap.set(absorbedId, { row: dest.row, col: dest.col });
    }
    const absorbedIds = new Set(allMerges.map(m => m.absorbedId));
    tTiles = next.filter(t => !absorbedIds.has(t.id));
    tScore += totalGain;
    if (tScore > tBest) { tBest = tScore; document.getElementById('t-best').textContent = tBest; }
    document.getElementById('t-score').textContent = tScore;
    if (!tWon) {
        for (const t of tTiles) {
            if (t.value === 2048) {
                tWon = true;
                document.getElementById('t-message').textContent = 'You reached 2048. Keep going or start over.';
                break;
            }
        }
    }
    tAddTile(true);
    if (!tHasMoves()) {
        tOver = true;
        document.getElementById('t-message').textContent = 'No more moves. Game over.';
    }
    tRender(mergeDestMap, absorbedIds);
}
function tTileStyle(v) {
    if (!v) return { bg: '', color: '' };
    const steps = [2,4,8,16,32,64,128,256,512,1024,2048];
    const idx = steps.indexOf(v);
    const rank = idx >= 0 ? idx : steps.length;
    const l = Math.round(90 - (rank / steps.length) * 85);
    return { bg: 'hsl(0,0%,'+l+'%)', color: l < 50 ? '#fff' : '#000' };
}
function tCellPos(row, col) {
    return {
        top:  'calc(' + row + ' * (25% + 0.25px))',
        left: 'calc(' + col + ' * (25% + 0.25px))'
    };
}
function tRender(mergeDestMap, absorbedIds) {
    mergeDestMap = mergeDestMap || new Map();
    absorbedIds  = absorbedIds  || new Set();
    const layer  = document.getElementById('t-tile-layer');
    const elMap  = {};
    layer.querySelectorAll('.t-tile').forEach(el => elMap[el.dataset.tid] = el);
    const activeIds = new Set(tTiles.map(t => String(t.id)));
    for (const [id, el] of Object.entries(elMap)) {
        if (!activeIds.has(id)) {
            const dest = mergeDestMap.get(Number(id));
            if (dest) { const p = tCellPos(dest.row, dest.col); el.style.top = p.top; el.style.left = p.left; }
            setTimeout(() => { if (el.parentNode) el.remove(); }, dest ? 115 : 0);
        }
    }
    for (const tile of tTiles) {
        const pos = tCellPos(tile.row, tile.col);
        const { bg, color } = tTileStyle(tile.value);
        let el = elMap[String(tile.id)];
        if (!el) {
            el = document.createElement('div');
            el.className = 't-tile';
            el.dataset.tid = tile.id;
            el.style.cssText = 'transition:none;top:'+pos.top+';left:'+pos.left
                +';background-color:'+(bg||'var(--color-bg)')
                +';color:'+(color||'var(--color-text)')
                +';opacity:'+(tile.isNew?'0':'1')+';';
            el.textContent = tile.value;
            layer.appendChild(el);
            if (tile.isNew) {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.classList.add('t-appear');
                    el.addEventListener('animationend', () => el.classList.remove('t-appear'), {once:true});
                }, 115);
            }
        } else {
            el.style.transition = 'top 105ms ease, left 105ms ease';
            el.style.top  = pos.top;
            el.style.left = pos.left;
            el.style.backgroundColor = bg || 'var(--color-bg)';
            el.style.color = color || 'var(--color-text)';
            el.textContent = tile.value;
            if (tile.isMerged) {
                el.addEventListener('transitionend', () => {
                    el.classList.add('t-pop');
                    el.addEventListener('animationend', () => el.classList.remove('t-pop'), {once:true});
                }, {once:true});
            }
        }
        tile.isNew = false; tile.isMerged = false;
    }
}

/* Keyboard */
document.addEventListener('keydown', e => {
    const map = {ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down'};
    if (map[e.key] && document.getElementById('area-2048').classList.contains('visible')) {
        e.preventDefault();
        tMove(map[e.key]);
    }
});

/* Touch swipe */
let tTouchX=0, tTouchY=0;
document.getElementById('t-board').addEventListener('touchstart', e => {
    tTouchX = e.touches[0].clientX;
    tTouchY = e.touches[0].clientY;
}, {passive:true});
document.getElementById('t-board').addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tTouchX;
    const dy = e.changedTouches[0].clientY - tTouchY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) tMove(dx>0 ? 'right' : 'left');
    else                              tMove(dy>0 ? 'down'  : 'up');
});

/* Init both games */
msNewGame();
tNewGame();
