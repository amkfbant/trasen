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

      reply.send({
        message: 'Login successful',
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }
}

module.exports = new UserController();