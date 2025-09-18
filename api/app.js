const fastify = require('fastify')({ logger: true });

// CORSを有効にする
fastify.register(require('@fastify/cors'), {
  origin: true
});

// データベース初期化
const { initDatabase } = require('./database');
initDatabase();

// コントローラーのインポート
const userController = require('./controllers/user-controller');
const tournamentController = require('./controllers/tournament-controller');

// ヘルスチェック
fastify.get('/', async (request, reply) => {
  return { message: 'ft_transcendence API is running!' };
});

// ユーザー関連ルート
fastify.post('/register', userController.register.bind(userController));
fastify.post('/login', userController.login.bind(userController));

// トーナメント関連ルート
fastify.post('/tournaments', tournamentController.createTournament.bind(tournamentController));
fastify.get('/tournaments/:id', tournamentController.getTournament.bind(tournamentController));
fastify.get('/tournaments', tournamentController.getAllTournaments.bind(tournamentController));
fastify.post('/tournaments/:id/join', tournamentController.joinTournament.bind(tournamentController));
fastify.get('/tournaments/:id/players', tournamentController.getTournamentPlayers.bind(tournamentController));
fastify.post('/tournaments/:id/start', tournamentController.startTournament.bind(tournamentController));
fastify.get('/tournaments/:id/matches', tournamentController.getTournamentMatches.bind(tournamentController));
fastify.post('/tournaments/:tournamentId/matches/:matchId/result', tournamentController.recordMatchResult.bind(tournamentController));

module.exports = fastify;