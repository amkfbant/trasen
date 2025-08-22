type Keys = { [k: string]: boolean };
const keys: Keys = {};

export function initGame(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;

  const PADDLE_SPEED = 6; // パドルの移動速度
  const PADDLE_W = 12; // パドルの幅
  const PADDLE_H = 80; // パドルの高さ
  const BALL_R = 8; // ボールの半径

  // 初期位置
  let leftY = (H - PADDLE_H) / 2; // 左パドルのY座標
  let rightY = (H - PADDLE_H) / 2; // 右パドルのY座標
  let ballX = W / 2, ballY = H / 2;
  let vx = 5 * (Math.random() < 0.5 ? 1 : -1);
  let vy = 3 * (Math.random() < 0.5 ? 1 : -1);
  let scoreL = 0, scoreR = 0;
  let paused = false;

  function resetBall(dir: number) {
    ballX = W / 2; ballY = H / 2;
    vx = 5 * dir;
    vy = ((Math.random() * 2) + 2) * (Math.random() < 0.5 ? 1 : -1);
  }

  function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }

  function step() {
    if (!paused) {
      // 入力
      if (keys["KeyW"]) leftY -= PADDLE_SPEED;
      if (keys["KeyS"]) leftY += PADDLE_SPEED;
      if (keys["ArrowUp"]) rightY -= PADDLE_SPEED;
      if (keys["ArrowDown"]) rightY += PADDLE_SPEED;
      leftY = clamp(leftY, 0, H - PADDLE_H);
      rightY = clamp(rightY, 0, H - PADDLE_H);

      // ボール移動
      ballX += vx; ballY += vy;

      // 上下バウンド
      if (ballY - BALL_R < 0 && vy < 0) { ballY = BALL_R; vy *= -1; }
      if (ballY + BALL_R > H && vy > 0) { ballY = H - BALL_R; vy *= -1; }

      // 左パドル衝突
      if (ballX - BALL_R < 20 + PADDLE_W &&
          ballY > leftY && ballY < leftY + PADDLE_H && vx < 0) {
        ballX = 20 + PADDLE_W + BALL_R;
        vx *= -1;
        // 当たり位置で少し角度変化
        const offset = (ballY - (leftY + PADDLE_H / 2)) / (PADDLE_H / 2);
        vy = clamp(vy + offset * 2.5, -8, 8);
      }

      // 右パドル衝突
      if (ballX + BALL_R > W - 20 - PADDLE_W &&
          ballY > rightY && ballY < rightY + PADDLE_H && vx > 0) {
        ballX = W - 20 - PADDLE_W - BALL_R;
        vx *= -1;
        const offset = (ballY - (rightY + PADDLE_H / 2)) / (PADDLE_H / 2);
        vy = clamp(vy + offset * 2.5, -8, 8);
      }

      // 得点
      if (ballX < -BALL_R) { scoreR++; resetBall(+1); }
      if (ballX > W + BALL_R) { scoreL++; resetBall(-1); }
    }

    // 描画
    ctx.clearRect(0, 0, W, H);
    // 中央線
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = "#ddd";
    ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
    ctx.setLineDash([]);

    // スコア
    ctx.fillStyle = "#444";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${scoreL} : ${scoreR}`, W/2, 32);

    // パドル
    ctx.fillStyle = "#111";
    ctx.fillRect(20, leftY, PADDLE_W, PADDLE_H);
    ctx.fillRect(W - 20 - PADDLE_W, rightY, PADDLE_W, PADDLE_H);

    // ボール
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(step);
  }

  function onKey(e: KeyboardEvent, down: boolean) {
    if (e.code === "KeyP" && down) paused = !paused;
    if (e.code === "KeyR" && down) { scoreL = 0; scoreR = 0; resetBall(Math.random() < 0.5 ? 1 : -1); }
    keys[e.code] = down;
  }
  window.addEventListener("keydown", (e) => onKey(e, true));
  window.addEventListener("keyup",   (e) => onKey(e, false));

  // 初期化
  resetBall(Math.random() < 0.5 ? 1 : -1);
  requestAnimationFrame(step);
}
