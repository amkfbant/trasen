const { db } = require('../database');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TournamentSessionService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  }

  // トーナメント参加時のトークン生成
  async createTournamentSession(tournamentId, alias, userId = null) {
    return new Promise((resolve, reject) => {
      // トークンの有効期限（24時間）
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // JWTトークン生成
      const token = jwt.sign({
        tournamentId: parseInt(tournamentId),
        alias,
        userId,
        exp: Math.floor(expiresAt.getTime() / 1000)
      }, this.JWT_SECRET);

      // トークンハッシュ生成（データベース保存用）
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // データベースにセッション情報を保存
      const query = `
        INSERT INTO tournament_sessions (token_hash, tournament_id, alias, user_id, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(query, [tokenHash, tournamentId, alias, userId, expiresAt.toISOString()], function(err) {
        if (err) {
          console.error('Tournament session creation error:', err);
          reject(err);
        } else {
          resolve({
            token,
            sessionId: this.lastID,
            tournamentId: parseInt(tournamentId),
            alias,
            userId,
            expiresAt: expiresAt.toISOString()
          });
        }
      });
    });
  }

  // トークン検証
  async validateTournamentToken(token) {
    return new Promise((resolve, reject) => {
      try {
        // JWTトークン検証
        const decoded = jwt.verify(token, this.JWT_SECRET);
        
        // トークンハッシュ生成
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        
        // データベースでセッション情報を確認
        const query = `
          SELECT * FROM tournament_sessions 
          WHERE token_hash = ? AND expires_at > datetime('now')
        `;
        
        db.get(query, [tokenHash], (err, row) => {
          if (err) {
            reject(err);
          } else if (!row) {
            reject(new Error('Invalid or expired token'));
          } else {
            resolve({
              sessionId: row.id,
              tournamentId: row.tournament_id,
              alias: row.alias,
              userId: row.user_id,
              expiresAt: row.expires_at
            });
          }
        });
      } catch (error) {
        reject(new Error('Invalid token format'));
      }
    });
  }

  // セッション情報取得
  async getSessionInfo(sessionId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ts.*, t.name as tournament_name
        FROM tournament_sessions ts
        JOIN tournaments t ON ts.tournament_id = t.id
        WHERE ts.id = ?
      `;
      
      db.get(query, [sessionId], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('Session not found'));
        } else {
          resolve(row);
        }
      });
    });
  }

  // セッション削除（トーナメント終了時）
  async deleteSession(sessionId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM tournament_sessions WHERE id = ?';
      
      db.run(query, [sessionId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }

  // 期限切れセッションのクリーンアップ
  async cleanupExpiredSessions() {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM tournament_sessions WHERE expires_at < datetime(\'now\')';
      
      db.run(query, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ cleaned: this.changes });
        }
      });
    });
  }

  // トーナメント参加者一覧取得
  async getTournamentPlayers(tournamentId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT tp.*, u.username, u.display_name, u.avatar_url, u.is_online
        FROM tournament_players tp
        LEFT JOIN users u ON tp.user_id = u.id
        WHERE tp.tournament_id = ?
        ORDER BY tp.created_at ASC
      `;
      
      db.all(query, [tournamentId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // トーナメント参加者追加
  async addTournamentPlayer(tournamentId, alias, userId = null) {
    return new Promise((resolve, reject) => {
      // トーナメント情報と参加者数を取得
      const tournamentQuery = `
        SELECT t.*, COUNT(tp.id) as current_players
        FROM tournaments t
        LEFT JOIN tournament_players tp ON t.id = tp.tournament_id
        WHERE t.id = ?
        GROUP BY t.id
      `;
      
      db.get(tournamentQuery, [tournamentId], (err, tournament) => {
        if (err) {
          reject(err);
        } else if (!tournament) {
          reject(new Error('Tournament not found'));
        } else if (tournament.current_players >= tournament.max_players) {
          reject(new Error('Tournament is full'));
        } else {
          // 重複チェック
          const checkQuery = `
            SELECT * FROM tournament_players 
            WHERE tournament_id = ? AND player_alias = ?
          `;
          
          db.get(checkQuery, [tournamentId, alias], (err, existingPlayer) => {
            if (err) {
              reject(err);
            } else if (existingPlayer) {
              reject(new Error('Alias already taken'));
            } else {
              // 参加者追加
              const insertQuery = `
                INSERT INTO tournament_players (tournament_id, player_alias, user_id)
                VALUES (?, ?, ?)
              `;
              
              db.run(insertQuery, [tournamentId, alias, userId], function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    playerId: this.lastID,
                    tournamentId: parseInt(tournamentId),
                    alias,
                    userId
                  });
                }
              });
            }
          });
        }
      });
    });
  }
}

module.exports = new TournamentSessionService();
