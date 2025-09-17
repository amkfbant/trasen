const fastify = require('fastify')({ logger: true });

// CORSを有効にする（フロントエンドからのアクセスを許可）
fastify.register(require('@fastify/cors'), {
  origin: true
});

// ヘルスチェック用エンドポイント
fastify.get('/', async (request, reply) => {
  return { message: 'ft_transcendence API is running!' };
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