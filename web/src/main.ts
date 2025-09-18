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
        <a href="#/login">Login</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a> |
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
        <a href="#/login">Login</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a> |
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
  } else if (route === "/login") {
    app.innerHTML = `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/register">Register</a> |
        <a href="#/login">Login</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a> |
        <a href="#/about">About</a>
      </nav>
      <h2>Login</h2>
      <form id="loginForm">
        <div style="margin: 10px 0;">
          <label for="loginUsername">Username:</label><br>
          <input type="text" id="loginUsername" name="username" required
                 style="padding: 8px; width: 200px; margin-top: 5px;">
        </div>
        <div style="margin: 10px 0;">
          <label for="loginPassword">Password:</label><br>
          <input type="password" id="loginPassword" name="password" required
                 style="padding: 8px; width: 200px; margin-top: 5px;">
        </div>
        <button type="submit" style="padding: 10px 20px; margin-top: 10px;">Login</button>
      </form>
      <div id="loginMessage" style="margin-top: 20px;"></div>
    `;
    setupLoginForm();
  } else if (route === "/about") {
    app.innerHTML = `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/register">Register</a> |
        <a href="#/login">Login</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a> |
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
        <a href="#/login">Login</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a> |
        <a href="#/about">About</a>
      </nav>
      <h2>Pong</h2>
      <canvas id="game" width="800" height="480"
        style="width:100%;max-width:800px;border:1px solid #ddd;border-radius:8px;"></canvas>
      <p class="muted">Left: W/S　Right: ↑/↓　R: Reset　P: Stop</p>
    `;
    const canvas = document.getElementById("game") as HTMLCanvasElement;
    initGame(canvas);
  } else if (route === "/tournament") {
    app.innerHTML = `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/register">Register</a> |
        <a href="#/login">Login</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a> |
        <a href="#/about">About</a>
      </nav>
      <h2>Tournament</h2>

      <!-- トーナメント作成フォーム -->
      <div style="margin-bottom: 30px; padding: 20px; border: 2px solid #ddd; border-radius: 8px;">
        <h3>新しいトーナメントを作成</h3>
        <form id="createTournamentForm">
          <div style="margin: 10px 0;">
            <label for="tournamentName">トーナメント名:</label><br>
            <input type="text" id="tournamentName" name="name" required
                   style="padding: 8px; width: 300px; margin-top: 5px;">
          </div>
          <button type="submit" style="padding: 10px 20px; margin-top: 10px;">トーナメント作成</button>
        </form>
        <div id="createMessage" style="margin-top: 15px;"></div>
      </div>

      <!-- トーナメント一覧 -->
      <div style="margin-bottom: 30px;">
        <h3>トーナメント一覧</h3>
        <div id="tournamentList">読み込み中...</div>
      </div>

      <!-- トーナメント参加フォーム -->
      <div style="margin-bottom: 30px; padding: 20px; border: 2px solid #ddd; border-radius: 8px;">
        <h3>トーナメントに参加</h3>
        <form id="joinTournamentForm">
          <div style="margin: 10px 0;">
            <label for="tournamentId">トーナメントID:</label><br>
            <input type="number" id="tournamentId" name="tournamentId" required
                   style="padding: 8px; width: 100px; margin-top: 5px;">
          </div>
          <div style="margin: 10px 0;">
            <label for="alias">エイリアス（ニックネーム）:</label><br>
            <input type="text" id="alias" name="alias" required
                   style="padding: 8px; width: 300px; margin-top: 5px;">
          </div>
          <button type="submit" style="padding: 10px 20px; margin-top: 10px;">参加</button>
        </form>
        <div id="joinMessage" style="margin-top: 15px;"></div>
      </div>

      <!-- 参加者一覧 -->
      <div style="margin-bottom: 30px;">
        <h3>参加者確認</h3>
        <div style="margin: 10px 0;">
          <label for="checkTournamentId">トーナメントID:</label>
          <input type="number" id="checkTournamentId" style="padding: 5px; width: 100px; margin: 0 10px;">
          <button onclick="checkPlayers()" style="padding: 5px 15px;">参加者確認</button>
        </div>
        <div id="playersList">トーナメントIDを入力して「参加者確認」ボタンを押してください</div>
      </div>

      <!-- トーナメント進行管理 -->
      <div style="margin-bottom: 30px; padding: 20px; border: 2px solid #ddd; border-radius: 8px;">
        <h3>トーナメント進行管理</h3>
        <div style="margin: 10px 0;">
          <label for="manageTournamentId">トーナメントID:</label>
          <input type="number" id="manageTournamentId" style="padding: 5px; width: 100px; margin: 0 10px;">
          <button onclick="loadTournamentDetails()" style="padding: 5px 15px;">詳細表示</button>
        </div>
        <div id="tournamentDetails"></div>
      </div>
    `;
    setupTournamentForms();
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

// ログインフォームの設定
function setupLoginForm() {
  const form = document.getElementById("loginForm") as HTMLFormElement;
  const messageDiv = document.getElementById("loginMessage") as HTMLDivElement;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ログイン成功時、トークンをlocalStorageに保存
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        messageDiv.innerHTML = `<p style="color: green;">✅ ${data.message}</p>`;
        form.reset();

        // 3秒後にゲームページに移動
        setTimeout(() => {
          window.location.hash = "#/game";
        }, 1500);
      } else {
        messageDiv.innerHTML = `<p style="color: red;">❌ ${data.error}</p>`;
      }
    } catch (error) {
      messageDiv.innerHTML = `<p style="color: red;">❌ Network error. Please try again.</p>`;
    }
  });
}

// トーナメント関連の関数
function setupTournamentForms() {
  setupCreateTournamentForm();
  setupJoinTournamentForm();
  loadTournamentList();
}

// トーナメント作成フォームの設定
function setupCreateTournamentForm() {
  const form = document.getElementById("createTournamentForm") as HTMLFormElement;
  const messageDiv = document.getElementById("createMessage") as HTMLDivElement;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get("name") as string;

    try {
      const response = await fetch("http://localhost:3000/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok) {
        messageDiv.innerHTML = `<p style="color: green;">✅ ${data.message} (ID: ${data.tournament.id})</p>`;
        form.reset();
        loadTournamentList(); // 一覧を更新
      } else {
        messageDiv.innerHTML = `<p style="color: red;">❌ ${data.error}</p>`;
      }
    } catch (error) {
      messageDiv.innerHTML = `<p style="color: red;">❌ Network error. Please try again.</p>`;
    }
  });
}

// トーナメント参加フォームの設定
function setupJoinTournamentForm() {
  const form = document.getElementById("joinTournamentForm") as HTMLFormElement;
  const messageDiv = document.getElementById("joinMessage") as HTMLDivElement;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const tournamentId = formData.get("tournamentId") as string;
    const alias = formData.get("alias") as string;

    try {
      const response = await fetch(`http://localhost:3000/tournaments/${tournamentId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alias }),
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

// トーナメント一覧を読み込み
async function loadTournamentList() {
  const listDiv = document.getElementById("tournamentList") as HTMLDivElement;

  try {
    const response = await fetch("http://localhost:3000/tournaments");
    const data = await response.json();

    if (response.ok) {
      if (data.tournaments.length === 0) {
        listDiv.innerHTML = "<p>まだトーナメントがありません。</p>";
      } else {
        listDiv.innerHTML = data.tournaments.map((tournament: any) => `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 5px 0; border-radius: 5px;">
            <strong>ID: ${tournament.id}</strong> - ${tournament.name}
            <span style="color: #666;">(${tournament.status})</span>
          </div>
        `).join("");
      }
    } else {
      listDiv.innerHTML = "<p style='color: red;'>トーナメント一覧の読み込みに失敗しました。</p>";
    }
  } catch (error) {
    listDiv.innerHTML = "<p style='color: red;'>ネットワークエラーが発生しました。</p>";
  }
}

// 参加者一覧を確認
async function checkPlayers() {
  const input = document.getElementById("checkTournamentId") as HTMLInputElement;
  const listDiv = document.getElementById("playersList") as HTMLDivElement;
  const tournamentId = input.value;

  if (!tournamentId) {
    listDiv.innerHTML = "<p style='color: red;'>トーナメントIDを入力してください。</p>";
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/tournaments/${tournamentId}/players`);
    const data = await response.json();

    if (response.ok) {
      if (data.players.length === 0) {
        listDiv.innerHTML = "<p>まだ参加者がいません。</p>";
      } else {
        listDiv.innerHTML = `
          <h4>参加者一覧 (${data.players.length}名)</h4>
          ${data.players.map((player: any, index: number) => `
            <div style="border: 1px solid #eee; padding: 8px; margin: 3px 0;">
              ${index + 1}. ${player.alias} <span style="color: #666; font-size: 0.9em;">(${player.joined_at})</span>
            </div>
          `).join("")}
        `;
      }
    } else {
      listDiv.innerHTML = "<p style='color: red;'>参加者一覧の読み込みに失敗しました。</p>";
    }
  } catch (error) {
    listDiv.innerHTML = "<p style='color: red;'>ネットワークエラーが発生しました。</p>";
  }
}

// トーナメント詳細管理
async function loadTournamentDetails() {
  const input = document.getElementById("manageTournamentId") as HTMLInputElement;
  const detailsDiv = document.getElementById("tournamentDetails") as HTMLDivElement;
  const tournamentId = input.value;

  if (!tournamentId) {
    detailsDiv.innerHTML = "<p style='color: red;'>トーナメントIDを入力してください。</p>";
    return;
  }

  try {
    // トーナメント基本情報取得
    const tournamentResponse = await fetch(`http://localhost:3000/tournaments/${tournamentId}`);
    const tournamentData = await tournamentResponse.json();

    if (!tournamentResponse.ok) {
      detailsDiv.innerHTML = "<p style='color: red;'>トーナメントが見つかりません。</p>";
      return;
    }

    // 参加者情報取得
    const playersResponse = await fetch(`http://localhost:3000/tournaments/${tournamentId}/players`);
    const playersData = await playersResponse.json();

    // 試合情報取得
    const matchesResponse = await fetch(`http://localhost:3000/tournaments/${tournamentId}/matches`);
    const matchesData = await matchesResponse.json();

    const tournament = tournamentData.tournament;
    const players = playersData.players;
    const matches = matchesData.matches;

    let html = `
      <h4>トーナメント: ${tournament.name}</h4>
      <p><strong>状態:</strong> ${tournament.status} | <strong>参加者数:</strong> ${players.length}/${tournament.max_players}</p>
    `;

    if (tournament.status === 'waiting') {
      if (players.length === 4) {
        html += `
          <button onclick="startTournament(${tournamentId})"
                  style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; margin: 10px 0;">
            トーナメント開始
          </button>
        `;
      } else {
        html += `<p style='color: orange;'>4人の参加者が必要です。現在: ${players.length}人</p>`;
      }
    } else if (tournament.status === 'in_progress') {
      html += "<h5>試合状況</h5>";

      const round1Matches = matches.filter((m: any) => m.round === 1);
      const round2Matches = matches.filter((m: any) => m.round === 2);

      // 準決勝
      html += "<h6>準決勝</h6>";
      round1Matches.forEach((match: any) => {
        html += `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 5px 0; border-radius: 5px;">
            <strong>試合${match.match_number}:</strong> ${match.player1_alias} vs ${match.player2_alias}
            ${match.status === 'completed'
              ? `<br><span style="color: green;">結果: ${match.winner_alias} 勝利 (${match.player1_score}-${match.player2_score})</span>`
              : `<br><button onclick="showResultForm(${match.id}, '${match.player1_alias}', '${match.player2_alias}')"
                          style="padding: 5px 10px; margin-top: 5px;">結果入力</button>`
            }
          </div>
        `;
      });

      // 決勝
      if (round2Matches.length > 0) {
        html += "<h6>決勝</h6>";
        round2Matches.forEach((match: any) => {
          html += `
            <div style="border: 1px solid #ccc; padding: 10px; margin: 5px 0; border-radius: 5px;">
              <strong>決勝:</strong> ${match.player1_alias} vs ${match.player2_alias}
              ${match.status === 'completed'
                ? `<br><span style="color: gold;">🏆 優勝: ${match.winner_alias} (${match.player1_score}-${match.player2_score})</span>`
                : `<br><button onclick="showResultForm(${match.id}, '${match.player1_alias}', '${match.player2_alias}')"
                            style="padding: 5px 10px; margin-top: 5px;">結果入力</button>`
              }
            </div>
          `;
        });
      }
    } else if (tournament.status === 'completed') {
      const finalMatch = matches.find((m: any) => m.round === 2 && m.status === 'completed');
      html += `<h5 style="color: gold;">🏆 トーナメント完了！</h5>`;
      html += `<p><strong>優勝者:</strong> ${finalMatch?.winner_alias}</p>`;
    }

    detailsDiv.innerHTML = html;
  } catch (error) {
    detailsDiv.innerHTML = "<p style='color: red;'>エラーが発生しました。</p>";
  }
}

// トーナメント開始
async function startTournament(tournamentId: number) {
  try {
    const response = await fetch(`http://localhost:3000/tournaments/${tournamentId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    const data = await response.json();

    if (response.ok) {
      alert(`✅ ${data.message}`);
      loadTournamentDetails(); // 詳細を再読み込み
    } else {
      alert(`❌ ${data.error}`);
    }
  } catch (error) {
    alert("❌ ネットワークエラーが発生しました。");
  }
}

// 試合結果入力フォーム表示
function showResultForm(matchId: number, player1: string, player2: string) {
  const detailsDiv = document.getElementById("tournamentDetails") as HTMLDivElement;

  const formHtml = `
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
      <h6>試合結果入力: ${player1} vs ${player2}</h6>
      <form id="resultForm-${matchId}">
        <div style="margin: 10px 0;">
          <label>勝者:</label>
          <select name="winner" required style="padding: 5px; margin: 0 10px;">
            <option value="">選択してください</option>
            <option value="${player1}">${player1}</option>
            <option value="${player2}">${player2}</option>
          </select>
        </div>
        <div style="margin: 10px 0;">
          <label>${player1}のスコア:</label>
          <input type="number" name="player1_score" min="0" required style="padding: 5px; width: 60px; margin: 0 10px;">
          <label>${player2}のスコア:</label>
          <input type="number" name="player2_score" min="0" required style="padding: 5px; width: 60px; margin: 0 10px;">
        </div>
        <button type="button" onclick="submitResult(${matchId})" style="padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 4px; margin-right: 10px;">
          結果を記録
        </button>
        <button type="button" onclick="loadTournamentDetails()" style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 4px;">
          キャンセル
        </button>
      </form>
    </div>
  `;

  // 結果フォームを既存の内容に追加
  detailsDiv.innerHTML += formHtml;
}

// 試合結果送信
async function submitResult(matchId: number) {
  const form = document.getElementById(`resultForm-${matchId}`) as HTMLFormElement;
  const formData = new FormData(form);

  const tournamentId = (document.getElementById("manageTournamentId") as HTMLInputElement).value;

  try {
    const response = await fetch(`http://localhost:3000/tournaments/${tournamentId}/matches/${matchId}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        winner_alias: formData.get("winner"),
        player1_score: parseInt(formData.get("player1_score") as string),
        player2_score: parseInt(formData.get("player2_score") as string)
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert(`✅ ${data.message}`);
      loadTournamentDetails(); // 詳細を再読み込み
    } else {
      alert(`❌ ${data.error}`);
    }
  } catch (error) {
    alert("❌ ネットワークエラーが発生しました。");
  }
}

// グローバル関数として定義（onclickで使用）
(window as any).checkPlayers = checkPlayers;
(window as any).loadTournamentDetails = loadTournamentDetails;
(window as any).startTournament = startTournament;
(window as any).showResultForm = showResultForm;
(window as any).submitResult = submitResult;

window.addEventListener("hashchange", render);

// 初期化時にrenderを呼び出し
render();