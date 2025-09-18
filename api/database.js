const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// データベースファイルのパス（永続化ディレクトリ）
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'ft_transcendence.db');

// データディレクトリが存在しない場合は作成
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('データディレクトリを作成しました:', dataDir);
}

// データベース接続
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('データベース接続エラー:', err.message);
  } else {
    console.log('SQLiteデータベースに接続しました');
  }
});

// テーブル作成
function initDatabase() {
  // usersテーブル（User Management拡張）
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      bio TEXT,
      is_online BOOLEAN DEFAULT FALSE,
      last_active DATETIME,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      total_games INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('usersテーブル作成エラー:', err.message);
    } else {
      console.log('usersテーブルを作成/確認しました');
    }
  });

  // tournamentsテーブル - トーナメント大会の基本情報
  db.run(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT CHECK(status IN ('waiting', 'in_progress', 'completed')) DEFAULT 'waiting',
      max_players INTEGER DEFAULT 4,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME
    )
  `, (err) => {
    if (err) {
      console.error('tournamentsテーブル作成エラー:', err.message);
    } else {
      console.log('tournamentsテーブルを作成/確認しました');
    }
  });

  // tournament_playersテーブル - トーナメント参加者（エイリアス）
  db.run(`
    CREATE TABLE IF NOT EXISTS tournament_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      alias TEXT NOT NULL,
      user_id INTEGER,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      eliminated_at DATETIME,
      final_rank INTEGER,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(tournament_id, alias)
    )
  `, (err) => {
    if (err) {
      console.error('tournament_playersテーブル作成エラー:', err.message);
    } else {
      console.log('tournament_playersテーブルを作成/確認しました');
    }
  });

  // matchesテーブル - 試合結果
  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      round INTEGER NOT NULL DEFAULT 1,
      match_number INTEGER NOT NULL DEFAULT 1,
      player1_alias TEXT NOT NULL,
      player2_alias TEXT NOT NULL,
      winner_alias TEXT,
      player1_score INTEGER DEFAULT 0,
      player2_score INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
      started_at DATETIME,
      completed_at DATETIME,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
    )
  `, (err) => {
    if (err) {
      console.error('matchesテーブル作成エラー:', err.message);
    } else {
      console.log('matchesテーブルを作成/確認しました');
    }
  });

  // friendsテーブル - 友達システム
  db.run(`
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      accepted_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (friend_id) REFERENCES users(id),
      UNIQUE(user_id, friend_id)
    )
  `, (err) => {
    if (err) {
      console.error('friendsテーブル作成エラー:', err.message);
    } else {
      console.log('friendsテーブルを作成/確認しました');
    }
  });

  // match_historyテーブル - 試合履歴（1v1含む）
  db.run(`
    CREATE TABLE IF NOT EXISTS match_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1_id INTEGER NOT NULL,
      player2_id INTEGER NOT NULL,
      player1_alias TEXT NOT NULL,
      player2_alias TEXT NOT NULL,
      winner_id INTEGER,
      player1_score INTEGER DEFAULT 0,
      player2_score INTEGER DEFAULT 0,
      game_type TEXT CHECK(game_type IN ('tournament', '1v1', 'practice')) DEFAULT '1v1',
      tournament_id INTEGER,
      match_id INTEGER,
      duration_seconds INTEGER,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player1_id) REFERENCES users(id),
      FOREIGN KEY (player2_id) REFERENCES users(id),
      FOREIGN KEY (winner_id) REFERENCES users(id),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
      FOREIGN KEY (match_id) REFERENCES matches(id)
    )
  `, (err) => {
    if (err) {
      console.error('match_historyテーブル作成エラー:', err.message);
    } else {
      console.log('match_historyテーブルを作成/確認しました');
    }
  });

}

module.exports = { db, initDatabase };