import { ApiService } from '../services/api-service.js';

type Keys = { [k: string]: boolean };

export interface TournamentGameState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tournamentId: string;
  matchId: string;
  player1: string;
  player2: string;
  animationId?: number;
  gameEnded: boolean;
  leftY: number;
  rightY: number;
  ballX: number;
  ballY: number;
  vx: number;
  vy: number;
  scoreL: number;
  scoreR: number;
  paused: boolean;
}

export class TournamentGame {
  private static gameState: TournamentGameState | null = null;
  private static keys: Keys = {};

  static initKeys(): void {
    window.addEventListener("keydown", (e) => { this.keys[e.code] = true; });
    window.addEventListener("keyup", (e) => { this.keys[e.code] = false; });
  }

  static init(canvas: HTMLCanvasElement, tournamentId: string, matchId: string, player1: string, player2: string): void {
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    this.gameState = {
      canvas,
      ctx,
      tournamentId,
      matchId,
      player1,
      player2,
      gameEnded: false,
      leftY: (H - 80) / 2,
      rightY: (H - 80) / 2,
      ballX: W / 2,
      ballY: H / 2,
      vx: 5 * (Math.random() < 0.5 ? 1 : -1),
      vy: 3 * (Math.random() < 0.5 ? 1 : -1),
      scoreL: 0,
      scoreR: 0,
      paused: false
    };

    const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
    gameStatus.innerHTML = `<p style="color: green;">ゲーム開始！ 先に5点取った方の勝利です</p>`;

    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === "KeyP") {
        e.preventDefault();
        if (this.gameState) {
          this.gameState.paused = !this.gameState.paused;
          const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
          if (this.gameState.paused) {
            gameStatus.innerHTML = `<p style="color: orange;">⏸️ ゲーム一時停止</p>`;
          } else {
            gameStatus.innerHTML = `<p style="color: green;">▶️ ゲーム再開</p>`;
          }
        }
      }
      if (e.code === "KeyR") {
        e.preventDefault();
        this.reset();
      }
    };

    window.removeEventListener("keydown", keyHandler);
    window.addEventListener("keydown", keyHandler);

    this.gameLoop();
  }

  private static gameLoop(): void {
    if (!this.gameState || this.gameState.gameEnded) return;

    const state = this.gameState;
    const W = state.canvas.width;
    const H = state.canvas.height;
    const PADDLE_SPEED = 6;
    const PADDLE_W = 12;
    const PADDLE_H = 80;
    const BALL_R = 8;

    if (!state.paused) {
      // キー入力処理
      if (this.keys["KeyW"]) state.leftY -= PADDLE_SPEED;
      if (this.keys["KeyS"]) state.leftY += PADDLE_SPEED;
      if (this.keys["ArrowUp"]) state.rightY -= PADDLE_SPEED;
      if (this.keys["ArrowDown"]) state.rightY += PADDLE_SPEED;
      state.leftY = Math.max(0, Math.min(H - PADDLE_H, state.leftY));
      state.rightY = Math.max(0, Math.min(H - PADDLE_H, state.rightY));

      // ボール移動
      state.ballX += state.vx;
      state.ballY += state.vy;

      // 上下バウンド
      if (state.ballY - BALL_R < 0 && state.vy < 0) {
        state.ballY = BALL_R;
        state.vy *= -1;
      }
      if (state.ballY + BALL_R > H && state.vy > 0) {
        state.ballY = H - BALL_R;
        state.vy *= -1;
      }

      // 左パドル衝突
      if (state.ballX - BALL_R < 20 + PADDLE_W &&
          state.ballY > state.leftY && state.ballY < state.leftY + PADDLE_H && state.vx < 0) {
        state.ballX = 20 + PADDLE_W + BALL_R;
        state.vx *= -1;
        const offset = (state.ballY - (state.leftY + PADDLE_H / 2)) / (PADDLE_H / 2);
        state.vy = Math.max(-8, Math.min(8, state.vy + offset * 2.5));
      }

      // 右パドル衝突
      if (state.ballX + BALL_R > W - 20 - PADDLE_W &&
          state.ballY > state.rightY && state.ballY < state.rightY + PADDLE_H && state.vx > 0) {
        state.ballX = W - 20 - PADDLE_W - BALL_R;
        state.vx *= -1;
        const offset = (state.ballY - (state.rightY + PADDLE_H / 2)) / (PADDLE_H / 2);
        state.vy = Math.max(-8, Math.min(8, state.vy + offset * 2.5));
      }

      // 得点
      if (state.ballX < -BALL_R) {
        state.scoreR++;
        this.resetBall(1);
      }
      if (state.ballX > W + BALL_R) {
        state.scoreL++;
        this.resetBall(-1);
      }

      // 勝利判定（5点先取）
      if (state.scoreL >= 5 || state.scoreR >= 5) {
        const winner = state.scoreL >= 5 ? state.player1 : state.player2;
        const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
        gameStatus.innerHTML = `<p style="color: gold; font-size: 18px;">🏆 ${winner} の勝利！</p>`;

        this.autoSubmitResult(winner, state.scoreL, state.scoreR);
        state.gameEnded = true;
        return;
      }
    }

    // 描画
    state.ctx.clearRect(0, 0, W, H);

    // 中央線
    state.ctx.setLineDash([8, 8]);
    state.ctx.strokeStyle = "#ddd";
    state.ctx.beginPath();
    state.ctx.moveTo(W/2, 0);
    state.ctx.lineTo(W/2, H);
    state.ctx.stroke();
    state.ctx.setLineDash([]);

    // スコア
    state.ctx.fillStyle = "#444";
    state.ctx.font = "bold 24px system-ui, sans-serif";
    state.ctx.textAlign = "center";
    state.ctx.fillText(`${state.player1}: ${state.scoreL} - ${state.scoreR} :${state.player2}`, W/2, 32);

    // パドル
    state.ctx.fillStyle = "#111";
    state.ctx.fillRect(20, state.leftY, PADDLE_W, PADDLE_H);
    state.ctx.fillRect(W - 20 - PADDLE_W, state.rightY, PADDLE_W, PADDLE_H);

    // ボール
    state.ctx.beginPath();
    state.ctx.arc(state.ballX, state.ballY, BALL_R, 0, Math.PI * 2);
    state.ctx.fill();

    state.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private static resetBall(dir: number): void {
    if (!this.gameState) return;
    const W = this.gameState.canvas.width;
    const H = this.gameState.canvas.height;

    this.gameState.ballX = W / 2;
    this.gameState.ballY = H / 2;
    this.gameState.vx = 5 * dir;
    this.gameState.vy = ((Math.random() * 2) + 2) * (Math.random() < 0.5 ? 1 : -1);
  }

  private static async autoSubmitResult(winner: string, scoreL: number, scoreR: number): Promise<void> {
    if (!this.gameState) return;

    try {
      await ApiService.recordMatchResult(
        parseInt(this.gameState.tournamentId),
        parseInt(this.gameState.matchId),
        winner,
        scoreL,
        scoreR
      );

      const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
      gameStatus.innerHTML += `<p style="color: green;">✅ 結果が自動記録されました</p>`;

      setTimeout(() => {
        window.location.hash = "/tournament";
      }, 3000);
    } catch (error) {
      const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
      gameStatus.innerHTML += `<p style="color: red;">❌ 結果の記録に失敗しました</p>`;
    }
  }

  static reset(): void {
    if (!this.gameState) return;

    this.gameState.scoreL = 0;
    this.gameState.scoreR = 0;
    this.gameState.gameEnded = false;
    this.resetBall(Math.random() < 0.5 ? 1 : -1);

    const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
    gameStatus.innerHTML = `<p style="color: green;">ゲームリセット！ 先に5点取った方の勝利です</p>`;
  }

  static async end(): Promise<void> {
    if (!this.gameState || this.gameState.gameEnded) return;

    const result = confirm("試合を手動で終了しますか？現在のスコアで勝者を決定します。");
    if (!result) return;

    const state = this.gameState;
    let winner: string;

    if (state.scoreL > state.scoreR) {
      winner = state.player1;
    } else if (state.scoreR > state.scoreL) {
      winner = state.player2;
    } else {
      winner = state.player1;
    }

    state.gameEnded = true;
    const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
    gameStatus.innerHTML = `<p style="color: orange;">🏁 手動終了: ${winner} の勝利</p>`;

    await this.autoSubmitResult(winner, state.scoreL, state.scoreR);
  }
}