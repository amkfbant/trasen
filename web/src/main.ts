import { initGame } from "./game.js";
import { currentRoute } from './router/routes.js';
import { TournamentUI } from './components/tournament-ui.js';
import { FormHandlers } from './components/form-handlers.js';
import { TournamentFunctions } from './components/tournament-functions.js';
import { TournamentGame } from './game/tournament-game.js';

const app = document.getElementById("app")!;

// Initialize tournament game keys
TournamentGame.initKeys();

// Expose tournament functions globally for onclick handlers
(window as any).tournamentFunctions = TournamentFunctions;
(window as any).loadTournamentList = () => TournamentFunctions.loadTournamentList();
(window as any).checkPlayers = () => TournamentFunctions.checkPlayers();
(window as any).loadTournamentDetails = () => TournamentFunctions.loadTournamentDetails();
(window as any).resetTournamentGame = () => TournamentGame.reset();
(window as any).endTournamentGame = () => TournamentGame.end();

function render() {
  const { path: route, params } = currentRoute();
  console.log("[route]", route);

  if (route === "/") {
    app.innerHTML = TournamentUI.generateHomePageHTML();
  } else if (route === "/register") {
    app.innerHTML = TournamentUI.generateRegisterPageHTML();
    FormHandlers.setupRegisterForm();
  } else if (route === "/login") {
    app.innerHTML = TournamentUI.generateLoginPageHTML();
    FormHandlers.setupLoginForm();
  } else if (route === "/about") {
    app.innerHTML = TournamentUI.generateAboutPageHTML();
  } else if (route === "/game" || route.startsWith("/game")) {
    app.innerHTML = TournamentUI.generateGamePageHTML();
    const canvas = document.getElementById("game") as HTMLCanvasElement;
    initGame(canvas);
  } else if (route.startsWith("/tournament-match")) {
    const tournamentId = params.get('tournamentId');
    const matchId = params.get('matchId');
    const player1 = params.get('player1');
    const player2 = params.get('player2');

    if (!tournamentId || !matchId || !player1 || !player2) {
      app.innerHTML = `
        <nav>
          <a href="#/tournament">← トーナメントに戻る</a>
        </nav>
        <div style="text-align: center; margin: 50px;">
          <h2>❌ エラー</h2>
          <p>試合情報が不完全です。トーナメント画面に戻ってやり直してください。</p>
        </div>
      `;
      return;
    }

    app.innerHTML = TournamentUI.generateTournamentGamePageHTML(tournamentId, matchId, player1, player2);
    const canvas = document.getElementById("tournamentGame") as HTMLCanvasElement;
    TournamentGame.init(canvas, tournamentId, matchId, player1, player2);
  } else if (route === "/tournament") {
    app.innerHTML = TournamentUI.generateTournamentPageHTML();
    FormHandlers.setupCreateTournamentForm();
    FormHandlers.setupJoinTournamentForm();
    TournamentFunctions.loadTournamentList();
  } else {
    app.innerHTML = `<h2>404</h2><p>Pong DEMO not found: <code>${route}</code></p>`;
  }
}

window.addEventListener("hashchange", render);

render();
