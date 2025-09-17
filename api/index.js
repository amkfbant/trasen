const fastify = require('fastify')({ logger: true });

// CORSを有効にする（フロントエンドからのアクセスを許可）
fastify.register(require('@fastify/cors'), {
  origin: true
});

// データベース設定
const { db, initDatabase } = require('./database');

// データベース初期化
initDatabase();

// ヘルスチェック用エンドポイント
fastify.get('/', async (request, reply) => {
  return { message: 'ft_transcendence API is running!' };
});

// ユーザー登録エンドポイント
fastify.post('/register', async (request, reply) => {
  const { username, password } = request.body;

  // バリデーション
  if (!username || !password) {
    return reply.status(400).send({ error: 'Username and password are required' });
  }

  try {
    // ユーザー名の重複チェック
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return reply.status(400).send({ error: 'Username already exists' });
    }

    // パスワードをハッシュ化
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーをデータベースに保存
    const userId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // 作成されたユーザー情報を取得
    const newUser = await new Promise((resolve, reject) => {
      db.get('SELECT id, username, created_at FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    return { message: 'User registered successfully', user: newUser };
  } catch (error) {
    console.error('Registration error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// ログインエンドポイント
fastify.post('/login', async (request, reply) => {
  const { username, password } = request.body;

  // バリデーション
  if (!username || !password) {
    return reply.status(400).send({ error: 'Username and password are required' });
  }

  try {
    // ユーザーを検索
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return reply.status(401).send({ error: 'Invalid username or password' });
    }

    // パスワード確認
    const bcrypt = require('bcrypt');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return reply.status(401).send({ error: 'Invalid username or password' });
    }

    // JWTトークン生成
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      'your-secret-key', // 本来は環境変数から取得
      { expiresIn: '24h' }
    );

    // パスワードを除いてレスポンス
    const { password: _, ...userResponse } = user;
    return {
      message: 'Login successful',
      user: userResponse,
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// サーバーを起動
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server started on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();