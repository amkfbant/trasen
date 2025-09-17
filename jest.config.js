module.exports = {
  // テスト環境の設定
  testEnvironment: 'node',

  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],

  // カバレッジの設定
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // カバレッジ対象ファイル
  collectCoverageFrom: [
    'api/*.js',
    'web/**/*.js',
    '!api/index.js', // エントリーポイントは除外
    '!api/server.js', // サーバー起動スクリプトは除外
    '!jest.config.js',
    '!coverage/**',
    '!__tests__/**', // テストファイルは除外
    '!**/node_modules/**'
  ],

  // テスト前後の設定
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

  // タイムアウト設定（データベース操作があるため長めに設定）
  testTimeout: 10000,

  // 詳細な出力
  verbose: true,

  // モック設定
  clearMocks: true,
  resetMocks: false,

  // プロジェクト設定（複数コンポーネント対応）
  projects: [
    {
      displayName: 'api',
      testMatch: ['<rootDir>/__tests__/api/**/*.test.js'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
      moduleDirectories: ['node_modules', 'api/node_modules']
    },
    {
      displayName: 'web',
      testMatch: ['<rootDir>/__tests__/web/**/*.test.js'],
      testEnvironment: 'jsdom', // フロントエンド用
      setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
      moduleDirectories: ['node_modules', 'web/node_modules']
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/__tests__/integration/**/*.test.js'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
      moduleDirectories: ['node_modules', 'api/node_modules', 'web/node_modules']
    }
  ]
};