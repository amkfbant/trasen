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
  // usersテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('usersテーブル作成エラー:', err.message);
    } else {
      console.log('usersテーブルを作成/確認しました');
    }
  });

}

module.exports = { db, initDatabase };