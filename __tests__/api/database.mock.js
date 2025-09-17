const sqlite3 = require('sqlite3').verbose();

// テスト用インメモリデータベースの作成
const createTestDatabase = () => {
  const db = new sqlite3.Database(':memory:');

  // テーブル作成を同期的に実行
  db.serialize(() => {
    // usersテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

  });

  return db;
};

// データベースモジュールのモック
const mockDatabase = () => {
  const testDb = createTestDatabase();

  // database.jsのモック（相対パス調整）
  jest.doMock('../../api/database', () => ({
    db: testDb,
    initDatabase: () => {
      // テスト用では何もしない（既にテーブルが作成済み）
    }
  }));

  return testDb;
};

module.exports = { createTestDatabase, mockDatabase };