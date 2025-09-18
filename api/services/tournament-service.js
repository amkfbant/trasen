const { db } = require('../database');

class TournamentService {
  // トーナメント作成
  async createTournament(name, maxPlayers = 4) {
    // バリデーション
    if (!name) {
      throw new Error('Tournament name is required');
    }

    if (![2, 4, 8, 16].includes(maxPlayers)) {
      throw new Error('Max players must be 2, 4, 8, or 16');
    }

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO tournaments (name, max_players) VALUES (?, ?)',
        [name, maxPlayers],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, maxPlayers, status: 'waiting' });
        }
      );
    });
  }

  // トーナメント取得
  async getTournament(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tournaments WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // トーナメント一覧取得
  async getAllTournaments() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tournaments ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // 参加者取得
  async getTournamentPlayers(tournamentId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT alias FROM tournament_players WHERE tournament_id = ? ORDER BY joined_at ASC',
        [tournamentId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // トーナメント参加
  async joinTournament(tournamentId, alias, userId = null) {
    // バリデーション
    if (!alias) {
      throw new Error('Alias is required');
    }

    // トーナメント存在確認
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== 'waiting') {
      throw new Error('Tournament already started or completed');
    }

    // 参加者数確認
    const players = await this.getTournamentPlayers(tournamentId);
    if (players.length >= tournament.max_players) {
      throw new Error('Tournament is full');
    }

    // エイリアス重複確認
    const existingPlayer = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM tournament_players WHERE tournament_id = ? AND alias = ?',
        [tournamentId, alias],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingPlayer) {
      throw new Error('Alias already taken');
    }

    // 参加者追加
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO tournament_players (tournament_id, alias, user_id) VALUES (?, ?, ?)',
        [tournamentId, alias, userId],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, alias });
        }
      );
    });
  }

  // ブラケット生成
  generateBracket(players, tournamentId) {
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
  async startTournament(tournamentId) {
    // トーナメント存在確認
    const tournament = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM tournaments WHERE id = ? AND status = "waiting"',
        [tournamentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!tournament) {
      throw new Error('Tournament not found or already started');
    }

    // 参加者数確認
    const players = await this.getTournamentPlayers(tournamentId);
    if (players.length !== tournament.max_players) {
      throw new Error(`Need exactly ${tournament.max_players} players to start`);
    }

    // ブラケット生成
    const matches = this.generateBracket(players, tournamentId);

    // トランザクション開始
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // トーナメントステータス更新
        db.run(
          'UPDATE tournaments SET status = "in_progress", started_at = CURRENT_TIMESTAMP WHERE id = ?',
          [tournamentId],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }
          }
        );

        // 試合生成
        const stmt = db.prepare(
          'INSERT INTO matches (tournament_id, round, match_number, player1_alias, player2_alias) VALUES (?, ?, ?, ?, ?)'
        );

        matches.forEach(match => {
          stmt.run([
            match.tournament_id,
            match.round,
            match.match_number,
            match.player1_alias,
            match.player2_alias
          ]);
        });

        stmt.finalize((err) => {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          db.run('COMMIT', (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }
            resolve({ message: 'Tournament started successfully' });
          });
        });
      });
    });
  }

  // 試合一覧取得
  async getTournamentMatches(tournamentId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM matches WHERE tournament_id = ? ORDER BY round ASC, match_number ASC',
        [tournamentId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // 試合結果記録と自動進行
  async recordMatchResult(tournamentId, matchId, winnerAlias, player1Score, player2Score) {
    // バリデーション
    if (!winnerAlias || player1Score === undefined || player2Score === undefined) {
      throw new Error('Winner and scores are required');
    }

    // 試合存在確認
    const match = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM matches WHERE id = ? AND tournament_id = ?', [matchId, tournamentId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.status === 'completed') {
      throw new Error('Match already completed');
    }

    // 勝者検証
    if (winnerAlias !== match.player1_alias && winnerAlias !== match.player2_alias) {
      throw new Error('Winner must be one of the match players');
    }

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 試合結果記録
        db.run(
          `UPDATE matches SET
           winner_alias = ?, player1_score = ?, player2_score = ?,
           status = 'completed', completed_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [winnerAlias, player1Score, player2Score, matchId],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }

            // 自動進行処理
            this._autoProgressTournament(tournamentId)
              .then(() => {
                db.run('COMMIT', (commitErr) => {
                  if (commitErr) {
                    db.run('ROLLBACK');
                    return reject(commitErr);
                  }
                  resolve({ message: 'Match result recorded and tournament progressed' });
                });
              })
              .catch((progressErr) => {
                db.run('ROLLBACK');
                reject(progressErr);
              });
          }
        );
      });
    });
  }

  // トーナメント自動進行（内部メソッド）
  async _autoProgressTournament(tournamentId) {
    // 現在のラウンドの完了試合を取得
    const matches = await this.getTournamentMatches(tournamentId);
    const tournament = await this.getTournament(tournamentId);
    const totalRounds = Math.log2(tournament.max_players);

    // ラウンドごとにグループ化
    const matchesByRound = {};
    matches.forEach(match => {
      if (!matchesByRound[match.round]) {
        matchesByRound[match.round] = [];
      }
      matchesByRound[match.round].push(match);
    });

    // 各ラウンドをチェック
    for (let round = 1; round <= totalRounds; round++) {
      const roundMatches = matchesByRound[round] || [];
      const completedMatches = roundMatches.filter(m => m.status === 'completed');
      const pendingMatches = roundMatches.filter(m => m.status === 'pending');

      if (pendingMatches.length > 0) {
        // このラウンドに未完了の試合があれば次のラウンドは作成しない
        break;
      }

      if (completedMatches.length > 0 && round < totalRounds) {
        // 次のラウンドが存在するかチェック
        const nextRoundMatches = matchesByRound[round + 1] || [];
        if (nextRoundMatches.length === 0) {
          // 次のラウンドを作成
          await this._createNextRound(tournamentId, round, completedMatches);
        }
      } else if (round === totalRounds && completedMatches.length > 0) {
        // 最終ラウンド完了 - トーナメント終了
        await this._completeTournament(tournamentId, completedMatches[0]);
      }
    }
  }

  // 次ラウンド作成
  async _createNextRound(tournamentId, currentRound, completedMatches) {
    const nextRound = currentRound + 1;
    const winners = completedMatches.map(match => match.winner_alias);

    const nextRoundMatches = [];
    for (let i = 0; i < winners.length; i += 2) {
      nextRoundMatches.push({
        tournament_id: tournamentId,
        round: nextRound,
        match_number: Math.floor(i / 2) + 1,
        player1_alias: winners[i],
        player2_alias: winners[i + 1]
      });
    }

    // 次ラウンドの試合をDB挿入
    const stmt = db.prepare(
      'INSERT INTO matches (tournament_id, round, match_number, player1_alias, player2_alias) VALUES (?, ?, ?, ?, ?)'
    );

    for (const match of nextRoundMatches) {
      stmt.run([
        match.tournament_id,
        match.round,
        match.match_number,
        match.player1_alias,
        match.player2_alias
      ]);
    }

    stmt.finalize();
  }

  // トーナメント完了
  async _completeTournament(tournamentId, finalMatch) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE tournaments SET status = "completed", completed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [tournamentId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

module.exports = new TournamentService();