const tournamentService = require('../services/tournament-service');

class TournamentController {
  // トーナメント作成
  async createTournament(request, reply) {
    try {
      const { name, max_players } = request.body;
      const tournament = await tournamentService.createTournament(name, max_players);

      reply.send({
        message: 'Tournament created successfully',
        tournament
      });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // トーナメント取得
  async getTournament(request, reply) {
    try {
      const { id } = request.params;
      const tournament = await tournamentService.getTournament(id);

      if (!tournament) {
        return reply.status(404).send({ error: 'Tournament not found' });
      }

      reply.send({ tournament });
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  }

  // トーナメント一覧取得
  async getAllTournaments(request, reply) {
    try {
      const tournaments = await tournamentService.getAllTournaments();
      reply.send({ tournaments });
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  }

  // トーナメント参加
  async joinTournament(request, reply) {
    try {
      const { id } = request.params;
      const { alias, user_id } = request.body;

      const result = await tournamentService.joinTournament(id, alias, user_id);

      reply.send({
        message: 'Successfully joined tournament',
        player: result
      });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // トーナメント参加者一覧
  async getTournamentPlayers(request, reply) {
    try {
      const { id } = request.params;
      const players = await tournamentService.getTournamentPlayers(id);
      reply.send({ players });
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  }

  // トーナメント開始
  async startTournament(request, reply) {
    try {
      const { id } = request.params;
      const result = await tournamentService.startTournament(id);
      reply.send(result);
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // 試合一覧取得
  async getTournamentMatches(request, reply) {
    try {
      const { id } = request.params;
      const matches = await tournamentService.getTournamentMatches(id);
      reply.send({ matches });
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  }

  // 試合結果記録
  async recordMatchResult(request, reply) {
    try {
      const { tournamentId, matchId } = request.params;
      const { winner_alias, player1_score, player2_score } = request.body;

      const result = await tournamentService.recordMatchResult(
        tournamentId,
        matchId,
        winner_alias,
        player1_score,
        player2_score
      );

      reply.send(result);
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }
}

module.exports = new TournamentController();