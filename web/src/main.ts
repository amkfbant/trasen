import { initGame } from "./game.js";

// キー入力状態管理（トーナメントゲーム用）
type Keys = { [k: string]: boolean };
const keys: Keys = {};

// キーボードイベントリスナーを追加
window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

const app = document.getElementById("app")!;

type RouteInfo = {
  path: string;
  params: URLSearchParams;
};

function currentRoute(): RouteInfo {
  const hash = location.hash.replace(/^#/, "") || "/";
  const [rawPath, queryString] = hash.split("?");
  const cleanPath = (rawPath || "/").replace(/\/+$/, "");

  return {
    path: cleanPath === "" ? "/" : cleanPath,
    params: new URLSearchParams(queryString || ""),
  };
}

function render() {
  const { path: route, params } = currentRoute();
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
  } else if (route.startsWith("/tournament-match")) {
    // トーナメント専用ゲーム画面
    const tournamentId = params.get('tournamentId');
    const matchId = params.get('matchId');
    const player1 = params.get('player1');
    const player2 = params.get('player2');

    // パラメータの検証
    if (!tournamentId || !matchId || !player1 || !player2) {
      app.innerHTML = `
        <nav>
          <a href="#/tournament">← トーナメントに戻る</a>
        </nav>
        <div style="text-align: center; margin: 50px;">
          <h2>❌ エラー</h2>
          <p>試合情報が不完全です。トーナメント画面に戻ってやり直してください。</p>
          <p>Debug: tournamentId=${tournamentId}, matchId=${matchId}, player1=${player1}, player2=${player2}</p>
        </div>
      `;
      return;
    }

    app.innerHTML = `
      <nav>
        <a href="#/tournament">← トーナメントに戻る</a>
      </nav>
      <div style="text-align: center; margin-bottom: 20px;">
        <h2>🏆 トーナメント試合</h2>
        <h3>${player1} vs ${player2}</h3>
        <p>トーナメントID: ${tournamentId} | 試合ID: ${matchId}</p>
      </div>
      <canvas id="tournamentGame" width="800" height="480"
        style="width:100%;max-width:800px;border:1px solid #ddd;border-radius:8px;margin:0 auto;display:block;"></canvas>
      <div style="text-align: center; margin-top: 15px;">
        <p class="muted">Left Player (${player1}): W/S　Right Player (${player2}): ↑/↓</p>
        <p class="muted">R: Reset　P: Pause　先に5点取った方の勝利！</p>
        <div id="gameStatus" style="margin-top: 10px; font-weight: bold;"></div>
        <div id="gameControls" style="margin-top: 10px;">
          <button onclick="resetTournamentGame()" style="padding: 8px 15px; margin: 0 5px;">ゲームリセット</button>
          <button onclick="endTournamentGame()" style="padding: 8px 15px; margin: 0 5px; background: #dc3545; color: white; border: none; border-radius: 4px;">試合終了</button>
        </div>
      </div>
    `;
    const canvas = document.getElementById("tournamentGame") as HTMLCanvasElement;
    initTournamentGame(canvas, tournamentId, matchId, player1, player2);
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
          <div style="margin: 10px 0;">
            <label for="maxPlayers">参加者数:</label><br>
            <select id="maxPlayers" name="max_players" required
                    style="padding: 8px; width: 150px; margin-top: 5px;">
              <option value="2">2人 (1試合)</option>
              <option value="4" selected>4人 (準決勝+決勝)</option>
              <option value="8">8人 (3ラウンド)</option>
              <option value="16">16人 (4ラウンド)</option>
            </select>
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
    const max_players = parseInt(formData.get("max_players") as string);

    try {
      const response = await fetch("http://localhost:3000/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, max_players }),
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
      if (players.length === tournament.max_players) {
        html += `
          <button onclick="startTournament(${tournamentId})"
                  style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; margin: 10px 0;">
            トーナメント開始
          </button>
        `;
      } else {
        html += `<p style='color: orange;'>${tournament.max_players}人の参加者が必要です。現在: ${players.length}人</p>`;
      }
    } else if (tournament.status === 'in_progress') {
      html += "<h5>試合状況</h5>";

      // ラウンド別に試合を整理
      const roundMatches: { [key: number]: any[] } = {};
      matches.forEach((match: any) => {
        if (!roundMatches[match.round]) {
          roundMatches[match.round] = [];
        }
        roundMatches[match.round].push(match);
      });

      const totalRounds = Math.log2(tournament.max_players);

      // 各ラウンドを表示
      Object.keys(roundMatches).sort((a, b) => parseInt(a) - parseInt(b)).forEach((roundNum: string) => {
        const round = parseInt(roundNum);
        const roundName = round === totalRounds ? '決勝' :
                         round === totalRounds - 1 ? '準決勝' :
                         round === 1 ? '1回戦' :
                         `第${round}ラウンド`;

        html += `<h6>${roundName}</h6>`;

        roundMatches[round].forEach((match: any) => {
          const isLastRound = round === totalRounds;
          html += `
            <div style="border: 1px solid #ccc; padding: 10px; margin: 5px 0; border-radius: 5px;">
              <strong>試合${match.match_number}:</strong> ${match.player1_alias} vs ${match.player2_alias}
              ${match.status === 'completed'
                ? isLastRound
                  ? `<br><span style="color: gold;">🏆 優勝: ${match.winner_alias} (${match.player1_score}-${match.player2_score})</span>`
                  : `<br><span style="color: green;">結果: ${match.winner_alias} 勝利 (${match.player1_score}-${match.player2_score})</span>`
                : `<br>
                   <button onclick="startTournamentMatch(${tournamentId}, ${match.id}, '${match.player1_alias}', '${match.player2_alias}')"
                           style="padding: 5px 10px; margin: 5px 5px 5px 0; background: #007bff; color: white; border: none; border-radius: 3px;">
                     🎮 ゲーム開始
                   </button>
                   <button onclick="showResultForm(${match.id}, '${match.player1_alias}', '${match.player2_alias}')"
                           style="padding: 5px 10px; margin: 5px 0;">
                     📝 手動入力
                   </button>`
              }
            </div>
          `;
        });
      });
    } else if (tournament.status === 'completed') {
      const totalRounds = Math.log2(tournament.max_players);
      const finalMatch = matches.find((m: any) => m.round === totalRounds && m.status === 'completed');
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

// トーナメント試合開始（ゲーム画面への遷移）
function startTournamentMatch(tournamentId: number, matchId: number, player1: string, player2: string) {
  const params = new URLSearchParams({
    tournamentId: tournamentId.toString(),
    matchId: matchId.toString(),
    player1: player1,
    player2: player2
  });
  window.location.hash = `/tournament-match?${params.toString()}`;
}

// トーナメントゲームのゲーム状態
let tournamentGameState: {
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
} | null = null;

// トーナメントゲーム初期化
function initTournamentGame(canvas: HTMLCanvasElement, tournamentId: string, matchId: string, player1: string, player2: string) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;

  // ゲーム状態の初期化
  tournamentGameState = {
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

  // キーボードイベントリスナー（ポーズとリセット）
  const keyHandler = (e: KeyboardEvent) => {
    if (e.code === "KeyP") {
      e.preventDefault();
      if (tournamentGameState) {
        tournamentGameState.paused = !tournamentGameState.paused;
        const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
        if (tournamentGameState.paused) {
          gameStatus.innerHTML = `<p style="color: orange;">⏸️ ゲーム一時停止</p>`;
        } else {
          gameStatus.innerHTML = `<p style="color: green;">▶️ ゲーム再開</p>`;
        }
      }
    }
    if (e.code === "KeyR") {
      e.preventDefault();
      resetTournamentGame();
    }
  };

  // 一度だけイベントリスナーを追加
  window.removeEventListener("keydown", keyHandler);
  window.addEventListener("keydown", keyHandler);

  // ゲームループ開始
  tournamentGameLoop();
}

// トーナメントゲームループ
function tournamentGameLoop() {
  if (!tournamentGameState || tournamentGameState.gameEnded) return;

  const state = tournamentGameState;
  const W = state.canvas.width;
  const H = state.canvas.height;
  const PADDLE_SPEED = 6;
  const PADDLE_W = 12;
  const PADDLE_H = 80;
  const BALL_R = 8;

  if (!state.paused) {
    // キー入力処理
    if (keys["KeyW"]) state.leftY -= PADDLE_SPEED;
    if (keys["KeyS"]) state.leftY += PADDLE_SPEED;
    if (keys["ArrowUp"]) state.rightY -= PADDLE_SPEED;
    if (keys["ArrowDown"]) state.rightY += PADDLE_SPEED;
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
      resetTournamentBall(1);
    }
    if (state.ballX > W + BALL_R) {
      state.scoreL++;
      resetTournamentBall(-1);
    }

    // 勝利判定（5点先取）
    if (state.scoreL >= 5 || state.scoreR >= 5) {
      const winner = state.scoreL >= 5 ? state.player1 : state.player2;
      const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
      gameStatus.innerHTML = `<p style="color: gold; font-size: 18px;">🏆 ${winner} の勝利！</p>`;

      // 自動でスコアを送信
      autoSubmitTournamentResult(winner, state.scoreL, state.scoreR);
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

  state.animationId = requestAnimationFrame(tournamentGameLoop);
}

// トーナメントゲームのボールリセット
function resetTournamentBall(dir: number) {
  if (!tournamentGameState) return;
  const W = tournamentGameState.canvas.width;
  const H = tournamentGameState.canvas.height;

  tournamentGameState.ballX = W / 2;
  tournamentGameState.ballY = H / 2;
  tournamentGameState.vx = 5 * dir;
  tournamentGameState.vy = ((Math.random() * 2) + 2) * (Math.random() < 0.5 ? 1 : -1);
}

// 自動スコア送信
async function autoSubmitTournamentResult(winner: string, scoreL: number, scoreR: number) {
  if (!tournamentGameState) return;

  try {
    const response = await fetch(`http://localhost:3000/tournaments/${tournamentGameState.tournamentId}/matches/${tournamentGameState.matchId}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        winner_alias: winner,
        player1_score: scoreL,
        player2_score: scoreR
      })
    });

    const data = await response.json();
    const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;

    if (response.ok) {
      gameStatus.innerHTML += `<p style="color: green;">✅ 結果が自動記録されました</p>`;

      // 3秒後にトーナメント画面に戻る
      setTimeout(() => {
        window.location.hash = "/tournament";
      }, 3000);
    } else {
      gameStatus.innerHTML += `<p style="color: red;">❌ 結果の記録に失敗しました: ${data.error}</p>`;
    }
  } catch (error) {
    const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
    gameStatus.innerHTML += `<p style="color: red;">❌ ネットワークエラーが発生しました</p>`;
  }
}

// トーナメントゲームリセット
function resetTournamentGame() {
  if (!tournamentGameState) return;

  tournamentGameState.scoreL = 0;
  tournamentGameState.scoreR = 0;
  tournamentGameState.gameEnded = false;
  resetTournamentBall(Math.random() < 0.5 ? 1 : -1);

  const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
  gameStatus.innerHTML = `<p style="color: green;">ゲームリセット！ 先に5点取った方の勝利です</p>`;
}

// トーナメントゲーム終了（手動）
async function endTournamentGame() {
  if (!tournamentGameState || tournamentGameState.gameEnded) return;

  const result = confirm("試合を手動で終了しますか？現在のスコアで勝者を決定します。");
  if (!result) return;

  const state = tournamentGameState;
  let winner: string;

  if (state.scoreL > state.scoreR) {
    winner = state.player1;
  } else if (state.scoreR > state.scoreL) {
    winner = state.player2;
  } else {
    // 同点の場合は引き分け処理（とりあえず左プレイヤーを勝者とする）
    winner = state.player1;
  }

  state.gameEnded = true;
  const gameStatus = document.getElementById("gameStatus") as HTMLDivElement;
  gameStatus.innerHTML = `<p style="color: orange;">🏁 手動終了: ${winner} の勝利</p>`;

  // 結果を送信
  await autoSubmitTournamentResult(winner, state.scoreL, state.scoreR);
}

// グローバル関数として定義（onclickで使用）
(window as any).checkPlayers = checkPlayers;
(window as any).loadTournamentDetails = loadTournamentDetails;
(window as any).startTournament = startTournament;
(window as any).showResultForm = showResultForm;
(window as any).submitResult = submitResult;
(window as any).startTournamentMatch = startTournamentMatch;
(window as any).resetTournamentGame = resetTournamentGame;
(window as any).endTournamentGame = endTournamentGame;

window.addEventListener("hashchange", render);

// 初期化時にrenderを呼び出し
render();
