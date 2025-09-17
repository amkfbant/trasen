const fastify = require('fastify')({ logger: true });

// CORSを有効にする（フロントエンドからのアクセスを許可）
fastify.register(require('@fastify/cors'), {
  origin: true
});

// メモリ上にユーザーを保存
const users = [];

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

  // ユーザー名の重複チェック
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return reply.status(400).send({ error: 'Username already exists' });
  }

  // パスワードをハッシュ化
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash(password, 10);

  // ユーザーを保存
  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword,
    createdAt: new Date()
  };
  users.push(newUser);

  // パスワードを除いてレスポンス
  const { password: _, ...userResponse } = newUser;
  return { message: 'User registered successfully', user: userResponse };
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