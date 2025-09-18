const userService = require('../services/user-service');

class UserController {
  // ユーザー登録
  async register(request, reply) {
    try {
      const { username, password } = request.body;
      const user = await userService.createUser(username, password);

      reply.send({
        message: 'User registered successfully',
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // ユーザーログイン
  async login(request, reply) {
    try {
      const { username, password } = request.body;
      const user = await userService.authenticateUser(username, password);

      // ログイン時にオンライン状態を更新
      await userService.updateOnlineStatus(user.id, true);

      reply.send({
        message: 'Login successful',
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // プロフィール取得
  async getProfile(request, reply) {
    try {
      const userId = parseInt(request.params.userId);
      const profile = await userService.getUserProfile(userId);

      reply.send({
        profile
      });
    } catch (error) {
      reply.status(404).send({ error: error.message });
    }
  }

  // プロフィール更新
  async updateProfile(request, reply) {
    try {
      const userId = parseInt(request.params.userId);
      const profileData = request.body;

      const result = await userService.updateProfile(userId, profileData);

      reply.send(result);
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // ユーザー検索
  async searchUsers(request, reply) {
    try {
      const { q } = request.query;
      if (!q || q.length < 2) {
        return reply.status(400).send({ error: 'Query must be at least 2 characters' });
      }

      const users = await userService.searchUsers(q);

      reply.send({
        users
      });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // 友達リスト取得
  async getFriends(request, reply) {
    try {
      const userId = parseInt(request.params.userId);
      const friends = await userService.getFriends(userId);

      reply.send({
        friends
      });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // 友達申請送信
  async sendFriendRequest(request, reply) {
    try {
      const userId = parseInt(request.params.userId);
      const { friendId } = request.body;

      const result = await userService.sendFriendRequest(userId, friendId);

      reply.send(result);
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // 友達申請承認
  async acceptFriendRequest(request, reply) {
    try {
      const userId = parseInt(request.params.userId);
      const requestId = parseInt(request.params.requestId);

      const result = await userService.acceptFriendRequest(userId, requestId);

      reply.send(result);
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // オンライン状態更新
  async updateOnlineStatus(request, reply) {
    try {
      const userId = parseInt(request.params.userId);
      const { isOnline } = request.body;

      const result = await userService.updateOnlineStatus(userId, isOnline);

      reply.send(result);
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // 試合履歴取得
  async getMatchHistory(request, reply) {
    try {
      const userId = parseInt(request.params.userId);
      const limit = parseInt(request.query.limit) || 20;

      const history = await userService.getMatchHistory(userId, limit);

      reply.send({
        match_history: history
      });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // 統計取得
  async getUserStats(request, reply) {
    try {
      const userId = parseInt(request.params.userId);

      const stats = await userService.getUserStats(userId);

      reply.send({
        stats
      });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  // 試合履歴記録
  async recordMatch(request, reply) {
    try {
      const matchData = request.body;

      const result = await userService.recordMatchHistory(matchData);

      reply.send(result);
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }
}

module.exports = new UserController();