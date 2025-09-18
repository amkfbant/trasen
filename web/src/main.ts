import { initGame } from "./game.js";
import { currentRoute } from './router/routes.js';
import { TournamentUI } from './components/tournament-ui.js';
import { FormHandlers } from './components/form-handlers.js';
import { TournamentFunctions } from './components/tournament-functions.js';
import { TournamentGame } from './game/tournament-game.js';
import { UserManagementUI } from './components/user-management-ui.js';
import { UserManagementHandlers } from './components/user-management-handlers.js';

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

// Expose logout function
(window as any).logout = () => {
  localStorage.removeItem('currentUser');
  window.location.hash = '#/';
};

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
  } else if (route === "/profile") {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      window.location.hash = '#/login';
      return;
    }
    const user = JSON.parse(currentUser);
    app.innerHTML = UserManagementUI.generateProfilePageHTML(user.id);
    UserManagementHandlers.setupEditProfileForm();
    UserManagementHandlers.loadUserProfile(user.id);
  } else if (route.startsWith("/profile/")) {
    const userId = route.split('/')[2];
    app.innerHTML = UserManagementUI.generateProfilePageHTML(userId);
    UserManagementHandlers.loadUserProfile(userId);
  } else if (route === "/search") {
    app.innerHTML = UserManagementUI.generateSearchPageHTML();
    UserManagementHandlers.setupSearchForm();
  } else if (route === "/friends") {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      window.location.hash = '#/login';
      return;
    }
    app.innerHTML = UserManagementUI.generateFriendsPageHTML();
    UserManagementHandlers.loadFriends();
  } else if (route === "/match-history") {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      window.location.hash = '#/login';
      return;
    }
    app.innerHTML = UserManagementUI.generateMatchHistoryPageHTML();
    UserManagementHandlers.loadMatchHistory();
  } else {
    app.innerHTML = `<h2>404</h2><p>Pong DEMO not found: <code>${route}</code></p>`;
  }
}

window.addEventListener("hashchange", render);

render();
