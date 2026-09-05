(() => {
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');

  const GRID = 20;
  const CELL = canvas.width / GRID;

  const COLORS = {
    lineA: '#0a1e16',
    lineB: '#0c231a',
    head: '#b6ff6b',
    bodyLight: '#7fe862',
    bodyDark: '#1f6b3f',
    outline: '#0c2b1a',
    fruitCore: '#ff6b4a',
    fruitGlow: 'rgba(255,138,74,0.55)',
    eye: '#07130c'
  };

  const scoreEl = document.getElementById('scoreVal');
  const bestEl = document.getElementById('bestVal');
  const startOverlay = document.getElementById('startOverlay');
  const overOverlay = document.getElementById('overOverlay');
  const overScoreText = document.getElementById('overScoreText');

  let snake, direction, nextDirection, food, score, best, running, paused, moveInterval, acc, lastTime, pulseT;

  best = 0;

  function resetState() {
    const cx = Math.floor(GRID / 2);
    const cy = Math.floor(GRID / 2);
    snake = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    moveInterval = 130;
    acc = 0;
    pulseT = 0;
    paused = false;
    food = placeFood();
    scoreEl.textContent = score;
  }

  function placeFood() {
    while (true) {
      const x = Math.floor(Math.random() * GRID);
      const y = Math.floor(Math.random() * GRID);
      if (!snake.some(s => s.x === x && s.y === y)) return { x, y };
    }
  }

  function isOpposite(a, b) {
    return a.x === -b.x && a.y === -b.y;
  }

  function setDirection(dx, dy) {
    const nd = { x: dx, y: dy };
    if (!isOpposite(nd, direction)) nextDirection = nd;
  }

  function step() {
    direction = nextDirection;
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    if (
      newHead.x < 0 || newHead.x >= GRID ||
      newHead.y < 0 || newHead.y >= GRID ||
      snake.some(s => s.x === newHead.x && s.y === newHead.y)
    ) {
      endGame();
      return;
    }

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
      score += 1;
      scoreEl.textContent = score;
      food = placeFood();
      moveInterval = Math.max(70, 130 - score * 3);
    } else {
      snake.pop();
    }
  }

  function endGame() {
    running = false;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
    }
    overScoreText.textContent = `คะแนนของคุณ: ${score}`;
    overOverlay.classList.remove('hidden');
  }

  function drawBackground() {
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? COLORS.lineA : COLORS.lineB;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function lerpColor(c1, c2, t) {
    const p = (h) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
    const [r1,g1,b1] = p(c1), [r2,g2,b2] = p(c2);
    const r = Math.round(r1 + (r2-r1)*t);
    const g = Math.round(g1 + (g2-g1)*t);
    const b = Math.round(b1 + (b2-b1)*t);
    return `rgb(${r},${g},${b})`;
  }

  function drawSnake() {
    const len = Math.max(snake.length - 1, 1);
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const px = seg.x * CELL, py = seg.y * CELL;
      const pad = 2;

      if (i === 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(182,255,107,0.65)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = COLORS.head;
        roundRect(px + pad, py + pad, CELL - pad*2, CELL - pad*2, 7);
        ctx.fill();
        ctx.restore();
      } else {
        const t = (i - 1) / len;
        ctx.fillStyle = lerpColor(COLORS.bodyLight, COLORS.bodyDark, t);
        roundRect(px + pad, py + pad, CELL - pad*2, CELL - pad*2, 6);
        ctx.fill();
      }
      ctx.strokeStyle = COLORS.outline;
      ctx.lineWidth = 1;
      roundRect(px + pad, py + pad, CELL - pad*2, CELL - pad*2, 6);
      ctx.stroke();

      if (i === 0) {
        const cx = px + CELL/2, cy = py + CELL/2;
        const offset = CELL / 4.2;
        const perp = { x: -direction.y, y: direction.x };
        const eye1 = { x: cx + direction.x*offset + perp.x*offset, y: cy + direction.y*offset + perp.y*offset };
        const eye2 = { x: cx + direction.x*offset - perp.x*offset, y: cy + direction.y*offset - perp.y*offset };
        ctx.fillStyle = COLORS.eye;
        ctx.beginPath(); ctx.arc(eye1.x, eye1.y, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(eye2.x, eye2.y, 2, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  function drawFood() {
    const cx = food.x * CELL + CELL/2;
    const cy = food.y * CELL + CELL/2;
    const pulse = (Math.sin(pulseT * 5) + 1) / 2;
    const glowR = CELL * (0.75 + 0.25 * pulse);

    const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, glowR);
    grad.addColorStop(0, COLORS.fruitGlow);
    grad.addColorStop(1, 'rgba(255,138,74,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = COLORS.fruitCore;
    ctx.beginPath();
    ctx.arc(cx, cy, CELL/2 - 3, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3, 2, 0, Math.PI*2);
    ctx.fill();
  }

  function render() {
    drawBackground();
    drawFood();
    drawSnake();
  }

  function loop(time) {
    if (!running) return;
    if (lastTime == null) lastTime = time;
    const dt = time - lastTime;
    lastTime = time;
    pulseT += dt / 1000;

    if (!paused) {
      acc += dt;
      while (acc >= moveInterval) {
        step();
        acc -= moveInterval;
        if (!running) break;
      }
    }

    render();
    requestAnimationFrame(loop);
  }

  function startGame() {
    resetState();
    startOverlay.classList.add('hidden');
    overOverlay.classList.add('hidden');
    running = true;
    lastTime = null;
    render();
    requestAnimationFrame(loop);
  }

  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('restartBtn').addEventListener('click', startGame);

  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp': setDirection(0, -1); e.preventDefault(); break;
      case 'ArrowDown': setDirection(0, 1); e.preventDefault(); break;
      case 'ArrowLeft': setDirection(-1, 0); e.preventDefault(); break;
      case 'ArrowRight': setDirection(1, 0); e.preventDefault(); break;
      case ' ':
        if (running) paused = !paused;
        e.preventDefault();
        break;
    }
  });

  document.getElementById('padUp').addEventListener('click', () => setDirection(0, -1));
  document.getElementById('padDown').addEventListener('click', () => setDirection(0, 1));
  document.getElementById('padLeft').addEventListener('click', () => setDirection(-1, 0));
  document.getElementById('padRight').addEventListener('click', () => setDirection(1, 0));

  let touchStart = null;
  const boardWrap = document.querySelector('.board-wrap');
  boardWrap.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });

  boardWrap.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) { touchStart = null; return; }
    if (Math.abs(dx) > Math.abs(dy)) {
      setDirection(dx > 0 ? 1 : -1, 0);
    } else {
      setDirection(0, dy > 0 ? 1 : -1);
    }
    touchStart = null;
  }, { passive: true });

  resetState();
  render();
})();
