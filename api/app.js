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
    // テスト環境では固定のシークレット、本番では環境変数を使用
    const jwtSecret = process.env.NODE_ENV === 'test'
      ? 'test-secret-key-for-testing-only'
      : (process.env.JWT_SECRET || 'your-secret-key');
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      jwtSecret,
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

// トーナメント関連API

// トーナメント作成
fastify.post('/tournaments', async (request, reply) => {
  try {
    const { name, max_players = 4 } = request.body;

    if (!name || name.trim().length === 0) {
      return reply.status(400).send({ error: 'Tournament name is required' });
    }

    // 有効な参加者数かチェック
    const validSizes = [2, 4, 8, 16];
    if (!validSizes.includes(max_players)) {
      return reply.status(400).send({ error: 'Invalid tournament size. Must be 2, 4, 8, or 16 players' });
    }

    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO tournaments (name, max_players) VALUES (?, ?)',
        [name.trim(), max_players],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    return {
      message: 'Tournament created successfully',
      tournament: { id: result.id, name: name.trim(), max_players }
    };
  } catch (error) {
    console.error('Tournament creation error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// トーナメント詳細取得
fastify.get('/tournaments/:id', async (request, reply) => {
  try {
    const { id } = request.params;

    const tournament = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM tournaments WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!tournament) {
      return reply.status(404).send({ error: 'Tournament not found' });
    }

    return { tournament };
  } catch (error) {
    console.error('Get tournament error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// トーナメント参加（エイリアス登録）
fastify.post('/tournaments/:id/join', async (request, reply) => {
  try {
    const { id } = request.params;
    const { alias } = request.body;

    if (!alias || alias.trim().length === 0) {
      return reply.status(400).send({ error: 'Alias is required' });
    }

    // トーナメント存在確認
    const tournament = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM tournaments WHERE id = ? AND status = "waiting"',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!tournament) {
      return reply.status(404).send({ error: 'Tournament not found or not accepting players' });
    }

    // 参加者数確認
    const playerCount = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM tournament_players WHERE tournament_id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });

    if (playerCount >= tournament.max_players) {
      return reply.status(400).send({ error: 'Tournament is full' });
    }

    // エイリアス重複確認
    const existingAlias = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM tournament_players WHERE tournament_id = ? AND alias = ?',
        [id, alias.trim()],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingAlias) {
      return reply.status(400).send({ error: 'Alias already taken in this tournament' });
    }

    // 参加者登録
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO tournament_players (tournament_id, alias) VALUES (?, ?)',
        [id, alias.trim()],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    return {
      message: 'Successfully joined tournament',
      player: { alias: alias.trim() }
    };
  } catch (error) {
    console.error('Join tournament error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// トーナメント参加者一覧取得
fastify.get('/tournaments/:id/players', async (request, reply) => {
  try {
    const { id } = request.params;

    const players = await new Promise((resolve, reject) => {
      db.all(
        'SELECT alias, joined_at FROM tournament_players WHERE tournament_id = ? ORDER BY joined_at ASC',
        [id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    return { players };
  } catch (error) {
    console.error('Get players error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// トーナメント一覧取得
fastify.get('/tournaments', async (request, reply) => {
  try {
    const tournaments = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id, name, status, max_players, created_at FROM tournaments ORDER BY created_at DESC',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    return { tournaments };
  } catch (error) {
    console.error('Get tournaments error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// 可変人数対応のブラケット生成関数
function generateBracket(players, tournamentId) {
  const totalPlayers = players.length;
  const matches = [];

  if (totalPlayers === 2) {
    // 2人: 決勝のみ
    matches.push({
      tournament_id: tournamentId,
      round: 1,
      match_number: 1,
      player1_alias: players[0].alias,
      player2_alias: players[1].alias
    });
  } else if (totalPlayers === 4) {
    // 4人: 準決勝2試合
    matches.push(
      {
        tournament_id: tournamentId,
        round: 1,
        match_number: 1,
        player1_alias: players[0].alias,
        player2_alias: players[1].alias
      },
      {
        tournament_id: tournamentId,
        round: 1,
        match_number: 2,
        player1_alias: players[2].alias,
        player2_alias: players[3].alias
      }
    );
  } else if (totalPlayers === 8) {
    // 8人: 1回戦4試合
    for (let i = 0; i < 4; i++) {
      matches.push({
        tournament_id: tournamentId,
        round: 1,
        match_number: i + 1,
        player1_alias: players[i * 2].alias,
        player2_alias: players[i * 2 + 1].alias
      });
    }
  } else if (totalPlayers === 16) {
    // 16人: 1回戦8試合
    for (let i = 0; i < 8; i++) {
      matches.push({
        tournament_id: tournamentId,
        round: 1,
        match_number: i + 1,
        player1_alias: players[i * 2].alias,
        player2_alias: players[i * 2 + 1].alias
      });
    }
  }

  return matches;
}

// トーナメント開始
fastify.post('/tournaments/:id/start', async (request, reply) => {
  try {
    const { id } = request.params;

    // トーナメント存在確認
    const tournament = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM tournaments WHERE id = ? AND status = "waiting"',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!tournament) {
      return reply.status(404).send({ error: 'Tournament not found or already started' });
    }

    // 参加者数確認
    const players = await new Promise((resolve, reject) => {
      db.all(
        'SELECT alias FROM tournament_players WHERE tournament_id = ? ORDER BY joined_at ASC',
        [id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (players.length !== tournament.max_players) {
      return reply.status(400).send({
        error: `Tournament requires exactly ${tournament.max_players} players. Current: ${players.length}`
      });
    }

    // トーナメント状態を開始に変更
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE tournaments SET status = "in_progress", started_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // ブラケット生成
    const initialMatches = generateBracket(players, id);

    // 試合をデータベースに挿入
    for (const match of initialMatches) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO matches (tournament_id, round, match_number, player1_alias, player2_alias) VALUES (?, ?, ?, ?, ?)',
          [match.tournament_id, match.round, match.match_number, match.player1_alias, match.player2_alias],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    return {
      message: 'Tournament started successfully',
      tournament_size: tournament.max_players,
      initial_matches: initialMatches.map(m => ({
        round: m.round,
        match: m.match_number,
        player1: m.player1_alias,
        player2: m.player2_alias
      }))
    };
  } catch (error) {
    console.error('Start tournament error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// 試合結果記録
fastify.post('/tournaments/:tournamentId/matches/:matchId/result', async (request, reply) => {
  try {
    const { tournamentId, matchId } = request.params;
    const { winner_alias, player1_score, player2_score } = request.body;

    if (!winner_alias || player1_score === undefined || player2_score === undefined) {
      return reply.status(400).send({ error: 'Winner and scores are required' });
    }

    // 試合結果を記録
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE matches SET
         winner_alias = ?,
         player1_score = ?,
         player2_score = ?,
         status = "completed",
         completed_at = CURRENT_TIMESTAMP
         WHERE id = ? AND tournament_id = ?`,
        [winner_alias, player1_score, player2_score, matchId, tournamentId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // 同じラウンドの他の試合が完了しているかチェック
    const currentMatch = await new Promise((resolve, reject) => {
      db.get('SELECT round FROM matches WHERE id = ?', [matchId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const roundMatches = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM matches WHERE tournament_id = ? AND round = ?',
        [tournamentId, currentMatch.round],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const allCompleted = roundMatches.every(match => match.status === 'completed');

    if (allCompleted) {
      // トーナメント情報を取得して次のラウンドを決定
      const tournament = await new Promise((resolve, reject) => {
        db.get('SELECT max_players FROM tournaments WHERE id = ?', [tournamentId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      const winners = roundMatches.map(match => match.winner_alias);
      const totalRounds = Math.log2(tournament.max_players);
      const isLastRound = currentMatch.round === totalRounds;

      if (isLastRound) {
        // 最終ラウンド完了、トーナメント終了
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE tournaments SET status = "completed", completed_at = CURRENT_TIMESTAMP WHERE id = ?',
            [tournamentId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });

        return {
          message: 'Tournament completed!',
          champion: winner_alias
        };
      } else {
        // 次のラウンドの試合を生成
        const nextRound = currentMatch.round + 1;
        const matchesInNextRound = winners.length / 2;

        for (let i = 0; i < matchesInNextRound; i++) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO matches (tournament_id, round, match_number, player1_alias, player2_alias) VALUES (?, ?, ?, ?, ?)',
              [tournamentId, nextRound, i + 1, winners[i * 2], winners[i * 2 + 1]],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }

        const roundName = nextRound === totalRounds ? '決勝' :
                         nextRound === totalRounds - 1 ? '準決勝' :
                         `第${nextRound}ラウンド`;

        return {
          message: `Match result recorded. ${roundName} matches created!`,
          next_round: nextRound,
          next_matches: Array.from({ length: matchesInNextRound }, (_, i) => ({
            round: nextRound,
            match: i + 1,
            player1: winners[i * 2],
            player2: winners[i * 2 + 1]
          }))
        };
      }
    }

    return { message: 'Match result recorded successfully' };
  } catch (error) {
    console.error('Record match result error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// トーナメント詳細（試合状況含む）取得
fastify.get('/tournaments/:id/matches', async (request, reply) => {
  try {
    const { id } = request.params;

    const matches = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM matches WHERE tournament_id = ? ORDER BY round ASC, match_number ASC',
        [id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    return { matches };
  } catch (error) {
    console.error('Get tournament matches error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// fastifyインスタンスをエクスポート
module.exports = fastify;