const bcrypt = require('bcrypt');
const { db } = require('../database');

class UserService {
  // ユーザー存在チェック
  async findUserByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // ユーザー作成
  async createUser(username, password) {
    // バリデーション
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // 重複チェック
    const existingUser = await this.findUserByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザー保存
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, username });
        }
      );
    });
  }

  // ユーザー認証
  async authenticateUser(username, password) {
    // バリデーション
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // ユーザー検索
    const user = await this.findUserByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // パスワード検証
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    return { id: user.id, username: user.username };
  }
}

module.exports = new UserService();