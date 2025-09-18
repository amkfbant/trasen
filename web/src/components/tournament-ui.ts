export class TournamentUI {
  static generateHomePageHTML(): string {
    return `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/register">Register</a> |
        <a href="#/login">Login</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a> |
        <a href="#/about">About</a>
      </nav>
      <h2>Welcome to ft_transcendence</h2>
      <p>A modern web-based Pong game with tournament system.</p>
      <ul>
        <li><a href="#/register">ユーザー登録</a> - 新規ユーザー登録</li>
        <li><a href="#/login">ログイン</a> - 既存ユーザーログイン</li>
        <li><a href="#/game">ゲーム</a> - Pongゲームをプレイ</li>
        <li><a href="#/tournament">トーナメント</a> - トーナメントシステム</li>
      </ul>
    `;
  }

  static generateRegisterPageHTML(): string {
    return `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/register">Register</a> |
        <a href="#/login">Login</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a> |
        <a href="#/about">About</a>
      </nav>
      <h2>Register</h2>
      <form id="registerForm">
        <div style="margin: 10px 0;">
          <label for="regUsername">Username:</label><br>
          <input type="text" id="regUsername" name="username" required
                 style="padding: 8px; width: 300px; margin-top: 5px;">
        </div>
        <div style="margin: 10px 0;">
          <label for="regPassword">Password:</label><br>
          <input type="password" id="regPassword" name="password" required
                 style="padding: 8px; width: 300px; margin-top: 5px;">
        </div>
        <div style="margin: 10px 0;">
          <button type="submit" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px;">
            Register
          </button>
        </div>
      </form>
    `;
  }

  static generateLoginPageHTML(): string {
    return `
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
                 style="padding: 8px; width: 300px; margin-top: 5px;">
        </div>
        <div style="margin: 10px 0;">
          <label for="loginPassword">Password:</label><br>
          <input type="password" id="loginPassword" name="password" required
                 style="padding: 8px; width: 300px; margin-top: 5px;">
        </div>
        <div style="margin: 10px 0;">
          <button type="submit" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px;">
            Login
          </button>
        </div>
      </form>
    `;
  }

  static generateGamePageHTML(): string {
    return `
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
  }

  static generateAboutPageHTML(): string {
    return `
      <nav>
        <a href="#/">Home</a> |
        <a href="#/register">Register</a> |
        <a href="#/login">Login</a> |
        <a href="#/game">Game</a> |
        <a href="#/tournament">Tournament</a> |
        <a href="#/about">About</a>
      </nav>
      <h2>About ft_transcendence</h2>
      <p>42 School project - A modern web-based Pong game with tournaments.</p>
    `;
  }

  static generateTournamentPageHTML(): string {
    return `
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
            <select id="maxPlayers" name="max_players" style="padding: 8px; width: 200px; margin-top: 5px;">
              <option value="2">2人</option>
              <option value="4" selected>4人</option>
              <option value="8">8人</option>
              <option value="16">16人</option>
            </select>
          </div>
          <button type="submit" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px;">
            トーナメント作成
          </button>
        </form>
      </div>

      <!-- トーナメント参加フォーム -->
      <div style="margin-bottom: 30px; padding: 20px; border: 2px solid #ddd; border-radius: 8px;">
        <h3>トーナメントに参加</h3>
        <form id="joinTournamentForm">
          <div style="margin: 10px 0;">
            <label for="tournamentId">トーナメントID:</label><br>
            <input type="number" id="tournamentId" name="tournamentId" required
                   style="padding: 8px; width: 200px; margin-top: 5px;">
          </div>
          <div style="margin: 10px 0;">
            <label for="playerAlias">プレイヤー名 (エイリアス):</label><br>
            <input type="text" id="playerAlias" name="alias" required
                   style="padding: 8px; width: 300px; margin-top: 5px;">
          </div>
          <button type="submit" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px;">
            参加
          </button>
        </form>
      </div>

      <!-- トーナメント一覧 -->
      <div style="margin-bottom: 30px;">
        <h3>トーナメント一覧</h3>
        <button onclick="loadTournamentList()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; margin-bottom: 15px;">
          一覧を更新
        </button>
        <div id="tournamentList">
          <p class="muted">「一覧を更新」ボタンをクリックしてトーナメント一覧を読み込んでください。</p>
        </div>
      </div>

      <!-- トーナメント進行管理 -->
      <div style="padding: 20px; border: 2px solid #ddd; border-radius: 8px;">
        <h3>トーナメント進行管理</h3>
        <div style="margin: 10px 0;">
          <label for="manageTournamentId">管理するトーナメントID:</label><br>
          <input type="number" id="manageTournamentId" style="padding: 8px; width: 200px; margin-top: 5px;">
          <button onclick="checkPlayers()" style="padding: 8px 15px; background: #17a2b8; color: white; border: none; border-radius: 4px; margin-left: 10px;">
            参加者確認
          </button>
          <button onclick="loadTournamentDetails()" style="padding: 8px 15px; background: #ffc107; color: black; border: none; border-radius: 4px; margin-left: 5px;">
            詳細表示
          </button>
        </div>
        <div id="tournamentDetails">
          <p class="muted">トーナメントIDを入力して「参加者確認」または「詳細表示」をクリックしてください。</p>
        </div>
      </div>
    `;
  }

  static generateTournamentGamePageHTML(tournamentId: string, matchId: string, player1: string, player2: string): string {
    return `
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
  }
}