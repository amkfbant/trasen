const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// データベースファイルのパス
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'ft_transcendence.db');

// データディレクトリが存在しない場合は作成
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o750 });
  console.log('データディレクトリを作成しました:', dataDir);
}

// データディレクトリの権限を設定
try {
  fs.chmodSync(dataDir, 0o750);
} catch (err) {
  console.warn('データディレクトリの権限設定に失敗:', err.message);
}

// データベース接続
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('データベース接続エラー:', err.message);
  } else {
    console.log('SQLiteデータベースに接続しました');
    
    // データベースファイルの権限を設定
    try {
      fs.chmodSync(dbPath, 0o666);
      console.log('データベースファイルの権限を設定しました');
    } catch (chmodErr) {
      console.warn('データベースファイルの権限設定に失敗:', chmodErr.message);
    }
  }
});

// テーブル作成
function initDatabase() {
  // usersテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      bio TEXT,
      is_online BOOLEAN DEFAULT 0,
      last_active DATETIME,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      total_games INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('usersテーブル作成エラー:', err.message);
    } else {
      console.log('usersテーブルを作成/確認しました');
    }
  });

  // usersテーブルにbioカラムを追加（既存テーブル用）
  db.run(`ALTER TABLE users ADD COLUMN bio TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('bioカラム追加エラー:', err.message);
    }
  });

  // usersテーブルに統計カラムを追加（既存テーブル用）
  db.run(`ALTER TABLE users ADD COLUMN wins INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('winsカラム追加エラー:', err.message);
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN losses INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('lossesカラム追加エラー:', err.message);
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN total_games INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('total_gamesカラム追加エラー:', err.message);
    }
  });

  // friendsテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

  // tournamentsテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      max_players INTEGER DEFAULT 8,
      status TEXT DEFAULT 'waiting',
      started_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('tournamentsテーブル作成エラー:', err.message);
    } else {
      console.log('tournamentsテーブルを作成/確認しました');
    }
  });

  // tournamentsテーブルにstarted_atカラムを追加（既存テーブル用）
  db.run(`ALTER TABLE tournaments ADD COLUMN started_at DATETIME`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('started_atカラム追加エラー:', err.message);
    }
  });

  // tournament_playersテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS tournament_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      player_alias TEXT NOT NULL,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('tournament_playersテーブル作成エラー:', err.message);
    } else {
      console.log('tournament_playersテーブルを作成/確認しました');
    }
  });

  // tournament_sessionsテーブル（トークン管理）
  db.run(`
    CREATE TABLE IF NOT EXISTS tournament_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT UNIQUE NOT NULL,
      tournament_id INTEGER NOT NULL,
      alias TEXT NOT NULL,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('tournament_sessionsテーブル作成エラー:', err.message);
    } else {
      console.log('tournament_sessionsテーブルを作成/確認しました');
    }
  });

  // matchesテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER,
      session_token_hash TEXT,
      player1_alias TEXT NOT NULL,
      player2_alias TEXT NOT NULL,
      player1_id INTEGER,
      player2_id INTEGER,
      winner_alias TEXT,
      winner_id INTEGER,
      player1_score INTEGER,
      player2_score INTEGER,
      round INTEGER DEFAULT 1,
      match_number INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending',
      completed_at DATETIME,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
      FOREIGN KEY (player1_id) REFERENCES users(id),
      FOREIGN KEY (player2_id) REFERENCES users(id),
      FOREIGN KEY (winner_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('matchesテーブル作成エラー:', err.message);
    } else {
      console.log('matchesテーブルを作成/確認しました');
    }
  });

  // matchesテーブルに必要なカラムを追加（既存テーブル用）
  db.run(`ALTER TABLE matches ADD COLUMN round INTEGER DEFAULT 1`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('roundカラム追加エラー:', err.message);
    }
  });

  db.run(`ALTER TABLE matches ADD COLUMN match_number INTEGER DEFAULT 1`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('match_numberカラム追加エラー:', err.message);
    }
  });

  db.run(`ALTER TABLE matches ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('statusカラム追加エラー:', err.message);
    }
  });

  db.run(`ALTER TABLE matches ADD COLUMN completed_at DATETIME`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('completed_atカラム追加エラー:', err.message);
    }
  });

    // match_historyテーブルは削除済み - matchesテーブルに統一
}

module.exports = { db, initDatabase };