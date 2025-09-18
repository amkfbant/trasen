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

  // ユーザーIDで検索
  async findUserById(userId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // ユーザー検索（username, email, display_name）
  async searchUsers(query) {
    // Input validation and sanitization
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid search query');
    }

    const sanitizedQuery = query.trim();
    if (sanitizedQuery.length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    // Escape LIKE wildcards: %, _, and \
    function escapeLikePattern(str) {
      return str.replace(/([%_\\])/g, '\\$1');
    }
    const likeQuery = `%${escapeLikePattern(sanitizedQuery)}%`;
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT id, username, display_name, avatar_url, is_online, wins, losses, total_games
        FROM users
        WHERE username LIKE ? ESCAPE '\\'
           OR display_name LIKE ? ESCAPE '\\'
           OR email LIKE ? ESCAPE '\\'
        LIMIT 20
      `, [likeQuery, likeQuery, likeQuery], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
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

  // プロフィール更新
  async updateProfile(userId, profileData) {
    const { display_name, email, bio, avatar_url } = profileData;

    // バリデーション
    if (email) {
      const existingEmail = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE users
        SET display_name = COALESCE(?, display_name),
            email = COALESCE(?, email),
            bio = COALESCE(?, bio),
            avatar_url = COALESCE(?, avatar_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [display_name, email, bio, avatar_url, userId], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('User not found'));
        else resolve({ message: 'Profile updated successfully' });
      });
    });
  }

  // オンライン状態更新
  async updateOnlineStatus(userId, isOnline) {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE users
        SET is_online = ?,
            last_active = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [isOnline, userId], function(err) {
        if (err) reject(err);
        else resolve({ message: 'Online status updated' });
      });
    });
  }

  // 統計更新
  async updateUserStats(userId, result) {
    return new Promise((resolve, reject) => {
      const { wins = 0, losses = 0 } = result;
      db.run(`
        UPDATE users
        SET wins = wins + ?,
            losses = losses + ?,
            total_games = total_games + 1
        WHERE id = ?
      `, [wins, losses, userId], function(err) {
        if (err) reject(err);
        else resolve({ message: 'User stats updated' });
      });
    });
  }

  // ユーザープロフィール取得（公開情報）
  async getUserProfile(userId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT id, username, display_name, avatar_url, bio,
               is_online, wins, losses, total_games, created_at
        FROM users
        WHERE id = ?
      `, [userId], (err, row) => {
        if (err) reject(err);
        else if (!row) reject(new Error('User not found'));
        else resolve(row);
      });
    });
  }

  // 友達リスト取得
  async getFriends(userId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_online,
               f.status, f.created_at as friend_since
        FROM friends f
        JOIN users u ON (f.friend_id = u.id)
        WHERE f.user_id = ? AND f.status = 'accepted'
        ORDER BY u.display_name, u.username
      `, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // 友達申請送信
  async sendFriendRequest(userId, friendId) {
    if (userId === friendId) {
      throw new Error('Cannot add yourself as friend');
    }

    // 相手が存在するかチェック
    const friend = await this.findUserById(friendId);
    if (!friend) {
      throw new Error('User not found');
    }

    // 既存の関係をチェック
    const existing = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM friends
        WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
      `, [userId, friendId, friendId, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existing) {
      if (existing.status === 'accepted') {
        throw new Error('Already friends');
      } else if (existing.status === 'pending') {
        throw new Error('Friend request already sent');
      } else if (existing.status === 'blocked') {
        throw new Error('Cannot send friend request');
      }
    }

    // 友達申請作成
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO friends (user_id, friend_id, status)
        VALUES (?, ?, 'pending')
      `, [userId, friendId], function(err) {
        if (err) reject(err);
        else resolve({ message: 'Friend request sent', id: this.lastID });
      });
    });
  }

  // Database helper methods for async/await pattern
  async _runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes, lastID: this.lastID });
      });
    });
  }

  async _getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async _beginTransaction() {
    return this._runQuery('BEGIN TRANSACTION');
  }

  async _commitTransaction() {
    return this._runQuery('COMMIT');
  }

  async _rollbackTransaction() {
    return this._runQuery('ROLLBACK');
  }

  // 友達申請一覧取得
  async getFriendRequests(userId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT f.id, f.user_id, f.created_at,
               u.username, u.display_name, u.avatar_url, u.is_online
        FROM friends f
        JOIN users u ON f.user_id = u.id
        WHERE f.friend_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC
      `, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // 友達申請承認
  async acceptFriendRequest(userId, requestId) {
    try {
      await this._beginTransaction();

      // Race condition protection: Lock and verify the friend request exists and is still pending
      const requestData = await this._getQuery(`
        SELECT user_id, friend_id, status
        FROM friends
        WHERE id = ? AND friend_id = ? AND status = 'pending'
      `, [requestId, userId]);

      if (!requestData) {
        await this._rollbackTransaction();
        throw new Error('Friend request not found or already processed');
      }

      // Check if reverse relationship already exists (race condition protection)
      const existingReverse = await this._getQuery(`
        SELECT id FROM friends
        WHERE user_id = ? AND friend_id = ? AND status = 'accepted'
      `, [userId, requestData.user_id]);

      if (existingReverse) {
        await this._rollbackTransaction();
        throw new Error('Friend relationship already exists');
      }

      // Update the original request to accepted
      const updateResult = await this._runQuery(`
        UPDATE friends
        SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP
        WHERE id = ? AND friend_id = ? AND status = 'pending'
      `, [requestId, userId]);

      if (updateResult.changes === 0) {
        await this._rollbackTransaction();
        throw new Error('Friend request was modified by another process');
      }

      // Create reverse relationship with duplicate protection
      try {
        await this._runQuery(`
          INSERT INTO friends (user_id, friend_id, status, accepted_at)
          VALUES (?, ?, 'accepted', CURRENT_TIMESTAMP)
        `, [userId, requestData.user_id]);
      } catch (insertError) {
        // Handle unique constraint violation (if exists)
        if (
          insertError.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
          insertError.code === 'SQLITE_CONSTRAINT'
        ) {
          await this._rollbackTransaction();
          throw new Error('Friend relationship already exists');
        }
        throw insertError;
      }

      await this._commitTransaction();
      return { message: 'Friend request accepted' };

    } catch (error) {
      try {
        await this._rollbackTransaction();
      } catch (rollbackError) {
        console.error('Failed to rollback transaction:', rollbackError);
      }
      throw error;
    }
  }

  // 試合履歴取得
  async getMatchHistory(userId, limit = 20) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT mh.*,
               p1.username as player1_username, p1.display_name as player1_display_name,
               p2.username as player2_username, p2.display_name as player2_display_name,
               w.username as winner_username, w.display_name as winner_display_name,
               t.name as tournament_name
        FROM match_history mh
        LEFT JOIN users p1 ON mh.player1_id = p1.id
        LEFT JOIN users p2 ON mh.player2_id = p2.id
        LEFT JOIN users w ON mh.winner_id = w.id
        LEFT JOIN tournaments t ON mh.tournament_id = t.id
        WHERE mh.player1_id = ? OR mh.player2_id = ?
        ORDER BY mh.played_at DESC
        LIMIT ?
      `, [userId, userId, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // 試合履歴記録（トークン方式対応）
  async recordMatchHistory(matchData) {
    const {
      player1_id, player2_id, player1_alias, player2_alias,
      winner_id, winner_alias, player1_score, player2_score, game_type,
      tournament_id, match_id, duration_seconds, session_token_hash
    } = matchData;

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 試合記録（新しいmatchesテーブル）
        db.run(`
          INSERT INTO matches (
            tournament_id, session_token_hash, player1_alias, player2_alias,
            player1_id, player2_id, winner_alias, winner_id,
            player1_score, player2_score
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          tournament_id, session_token_hash, player1_alias, player2_alias,
          player1_id, player2_id, winner_alias, winner_id,
          player1_score, player2_score
        ], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          const matchId = this.lastID;

          // ログインユーザーの統計更新（player1_idが存在する場合のみ）
          if (player1_id) {
            const p1Result = { wins: winner_id === player1_id ? 1 : 0, losses: winner_id === player1_id ? 0 : 1 };
            db.run(`
              UPDATE users
              SET wins = wins + ?, losses = losses + ?, total_games = total_games + 1
              WHERE id = ?
            `, [p1Result.wins, p1Result.losses, player1_id], (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }

              // プレイヤー2の統計更新（player2_idが存在する場合のみ）
              if (player2_id) {
                const p2Result = { wins: winner_id === player2_id ? 1 : 0, losses: winner_id === player2_id ? 0 : 1 };
                db.run(`
                  UPDATE users
                  SET wins = wins + ?, losses = losses + ?, total_games = total_games + 1
                  WHERE id = ?
                `, [p2Result.wins, p2Result.losses, player2_id], (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return reject(err);
                  }

                  db.run('COMMIT', (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return reject(err);
                    }
                    resolve({ message: 'Match recorded successfully', id: matchId });
                  });
                });
              } else {
                db.run('COMMIT', (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return reject(err);
                  }
                  resolve({ message: 'Match recorded successfully', id: matchId });
                });
              }
            });
          } else {
            // 匿名プレイヤーの場合、統計更新なし
            db.run('COMMIT', (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              resolve({ message: 'Match recorded successfully', id: matchId });
            });
          }
        });
      });
    });
  }

  // 詳細統計取得
  async getUserStats(userId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT u.wins, u.losses, u.total_games,
               ROUND(CAST(u.wins AS FLOAT) / NULLIF(u.total_games, 0) * 100, 2) as win_rate
        FROM users u
        WHERE u.id = ?
      `, [userId], (err, userStats) => {
        if (err) return reject(err);
        if (!userStats) return reject(new Error('User not found'));

        // ゲームタイプ別統計
        db.all(`
          SELECT game_type,
                 COUNT(*) as games_played,
                 SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END) as wins,
                 SUM(CASE WHEN winner_id != ? THEN 1 ELSE 0 END) as losses
          FROM match_history
          WHERE player1_id = ? OR player2_id = ?
          GROUP BY game_type
        `, [userId, userId, userId, userId], (err, gameTypeStats) => {
          if (err) return reject(err);

          // 最近のパフォーマンス（最新10試合）
          db.all(`
            SELECT
              CASE WHEN winner_id = ? THEN 1 ELSE 0 END as won,
              played_at
            FROM match_history
            WHERE player1_id = ? OR player2_id = ?
            ORDER BY played_at DESC
            LIMIT 10
          `, [userId, userId, userId], (err, recentMatches) => {
            if (err) return reject(err);

            resolve({
              overall: userStats,
              by_game_type: gameTypeStats || [],
              recent_performance: recentMatches || []
            });
          });
        });
      });
    });
  }
}

module.exports = new UserService();