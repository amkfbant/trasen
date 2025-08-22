import { initGame } from "./game.js";
import { GameState } from "@shared/types.js";

const app = document.getElementById("app")!;

const s: GameState = {
  w: 800, h: 480,
  lY: 200, rY: 200,
  bX: 400, bY: 240,
  vX: 5, vY: 3,
  sL: 0, sR: 0,
  tick: 0,
  paused: false
};


function currentRoute(): string {
  // ex: "#/game?x=1#foo" → "/game"
  const raw = location.hash.replace(/^#/, "") || "/";
  const clean = raw.split("?")[0].replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}

function render() {
  const route = currentRoute();
  console.log("[route]", route); // debug log

  if (route === "/") {
    app.innerHTML = `
      <h2>Home</h2>
      <p>TypesScript compiled in Docker. You can start Pong from the <strong>Game</strong> tab.</p>
      <ul>
        <li>Left <code>W/S</code>／Right <code>↑/↓</code></li>
        <li>Reset <code>R</code>／Stop <code>P</code></li>
      </ul>
    `;
  } else if (route === "/about") {
    app.innerHTML = `
      <h2>About</h2>
      <p>This SPA is built and run entirely within a Docker container.</p>
    `;
  } else if (route === "/game" || route.startsWith("/game")) {
    app.innerHTML = `
      <h2>Pong</h2>
      <canvas id="game" width="800" height="480"
        style="width:100%;max-width:800px;border:1px solid #ddd;border-radius:8px;"></canvas>
      <p class="muted">Left: W/S　Right: ↑/↓　R: Reset　P: Stop</p>
    `;
    const canvas = document.getElementById("game") as HTMLCanvasElement;
    initGame(canvas);
  } else {
    app.innerHTML = `<h2>404</h2><p>Pong DEMO not found: <code>${route}</code></p>`;
  }
}

window.addEventListener("hashchange", render);