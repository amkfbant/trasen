import { initGame } from "./game.js";

const app = document.getElementById("app")!;


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
      <nav>
        <a href="#/">Home</a> |
        <a href="#/register">Register</a> |
        <a href="#/game">Game</a> |
        <a href="#/about">About</a>
      </nav>
      <h2>Home</h2>
      <p>TypesScript compiled in Docker. You can start Pong from the <strong>Game</strong> tab.</p>
      <ul>
        <li>Left <code>W/S</code>／Right <code>↑/↓</code></li>
        <li>Reset <code>R</code>／Stop <code>P</code></li>
      </ul>
    `;
  } else if (route === "/register") {
    app.innerHTML = `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/register">Register</a> |
        <a href="#/game">Game</a> |
        <a href="#/about">About</a>
      </nav>
      <h2>User Registration</h2>
      <form id="registerForm">
        <div style="margin: 10px 0;">
          <label for="username">Username:</label><br>
          <input type="text" id="username" name="username" required
                 style="padding: 8px; width: 200px; margin-top: 5px;">
        </div>
        <div style="margin: 10px 0;">
          <label for="password">Password:</label><br>
          <input type="password" id="password" name="password" required
                 style="padding: 8px; width: 200px; margin-top: 5px;">
        </div>
        <button type="submit" style="padding: 10px 20px; margin-top: 10px;">Register</button>
      </form>
      <div id="message" style="margin-top: 20px;"></div>
    `;
    setupRegisterForm();
  } else if (route === "/about") {
    app.innerHTML = `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/register">Register</a> |
        <a href="#/game">Game</a> |
        <a href="#/about">About</a>
      </nav>
      <h2>About</h2>
      <p>This SPA is built and run entirely within a Docker container.</p>
    `;
  } else if (route === "/game" || route.startsWith("/game")) {
    app.innerHTML = `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/register">Register</a> |
        <a href="#/game">Game</a> |
        <a href="#/about">About</a>
      </nav>
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

// ユーザー登録フォームの設定
function setupRegisterForm() {
  const form = document.getElementById("registerForm") as HTMLFormElement;
  const messageDiv = document.getElementById("message") as HTMLDivElement;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        messageDiv.innerHTML = `<p style="color: green;">✅ ${data.message}</p>`;
        form.reset();
      } else {
        messageDiv.innerHTML = `<p style="color: red;">❌ ${data.error}</p>`;
      }
    } catch (error) {
      messageDiv.innerHTML = `<p style="color: red;">❌ Network error. Please try again.</p>`;
    }
  });
}

window.addEventListener("hashchange", render);

// 初期化時にrenderを呼び出し
render();