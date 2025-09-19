const tournamentSessionService = require('../services/tournament-session-service');

class TournamentSessionController {
  // トーナメント参加（トークン生成）
  async joinTournament(request, reply) {
    try {
      const { tournamentId, alias } = request.body;
      
      if (!tournamentId || !alias) {
        return reply.status(400).send({ 
          error: 'Tournament ID and alias are required' 
        });
      }

      // 現在のユーザー情報を取得（ログイン時のみ）
      let userId = null;
      const authHeader = request.headers.authorization;
      console.log('Auth header:', authHeader);
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const jwt = require('jsonwebtoken');
          const token = authHeader.substring(7);
          console.log('Token:', token);
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          console.log('Decoded token:', decoded);
          userId = decoded.userId;
          console.log('Extracted userId:', userId);
        } catch (error) {
          // 認証エラーは無視（匿名参加を許可）
          console.log('No valid authentication, proceeding as anonymous:', error.message);
        }
      }

      // トーナメントセッション作成
      const session = await tournamentSessionService.createTournamentSession(
        tournamentId, 
        alias, 
        userId
      );

      // トーナメント参加者として追加
      await tournamentSessionService.addTournamentPlayer(tournamentId, alias, userId);

      reply.send({
        message: 'Successfully joined tournament',
        session: {
          token: session.token,
          tournamentId: session.tournamentId,
          alias: session.alias,
          userId: session.userId,
          expiresAt: session.expiresAt
        }
      });
    } catch (error) {
      console.error('Error joining tournament:', error);
      reply.status(400).send({ error: error.message });
    }
  }

  // トークン検証
  async validateToken(request, reply) {
    try {
      const { token } = request.body;
      
      if (!token) {
        return reply.status(400).send({ error: 'Token is required' });
      }

      const sessionInfo = await tournamentSessionService.validateTournamentToken(token);
      
      reply.send({
        valid: true,
        session: sessionInfo
      });
    } catch (error) {
      console.error('Token validation error:', error);
      reply.status(401).send({ 
        valid: false, 
        error: error.message 
      });
    }
  }

  // セッション情報取得
  async getSessionInfo(request, reply) {
    try {
      const { sessionId } = request.params;
      
      const sessionInfo = await tournamentSessionService.getSessionInfo(sessionId);
      
      reply.send({
        session: sessionInfo
      });
    } catch (error) {
      console.error('Error getting session info:', error);
      reply.status(404).send({ error: error.message });
    }
  }

  // トーナメント参加者一覧取得
  async getTournamentPlayers(request, reply) {
    try {
      const { tournamentId } = request.params;
      
      const players = await tournamentSessionService.getTournamentPlayers(tournamentId);
      
      reply.send({
        players
      });
    } catch (error) {
      console.error('Error getting tournament players:', error);
      reply.status(400).send({ error: error.message });
    }
  }

  // セッション削除（トーナメント終了時）
  async deleteSession(request, reply) {
    try {
      const { sessionId } = request.params;
      
      const result = await tournamentSessionService.deleteSession(sessionId);
      
      reply.send({
        message: 'Session deleted successfully',
        deleted: result.deleted
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      reply.status(400).send({ error: error.message });
    }
  }

  // 期限切れセッションのクリーンアップ
  async cleanupExpiredSessions(request, reply) {
    try {
      const result = await tournamentSessionService.cleanupExpiredSessions();
      
      reply.send({
        message: 'Expired sessions cleaned up',
        cleaned: result.cleaned
      });
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      reply.status(400).send({ error: error.message });
    }
  }
}

module.exports = new TournamentSessionController();
