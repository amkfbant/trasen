# ft_transcendence

## 🚀クイックスタート

### 1. リポジトリクローン
```bash
git clone <repository-url> ft_transcendence
cd ft_transcendence
```

### 2. 環境セットアップ
```bash
make setup
```

### 3. 開発サーバー起動
```bash
make dev
```

## 🛠️ 開発環境

### 必要なツール
- Node.js 16.0.0↑
- npm
- Docker & Docker Compose

## 🧪 テスト

```bash
# カバレッジ付きテスト（Makefileから自動でnpm run test:coverageを実行）
make test

# テスト詳細が必要な場合は直接実行
npm run test:api
npm run test:coverage
npm run test:watch
```

## 🐳 Docker

```bash
# 開発サーバー起動（Docker）
make dev

# コンテナ起動（バックグラウンド）
make docker-up

# コンテナ停止
make docker-down

# ビルド
make docker-build
```

## 📝 利用可能なコマンド

### Makeコマンド（メイン）
```bash
make setup          # 初回セットアップ
make dev            # 開発サーバー起動
make test           # テスト実行
make docker-build   # Dockerビルド
make docker-up      # コンテナ起動
make docker-down    # コンテナ停止
make docker-restart # コンテナを再ビルド&起動
make clean          # クリーンアップ
make help           # ヘルプ表示
```

### NPMスクリプト（テスト詳細）
```bash
npm run test:api        # APIテスト
npm run test:coverage   # カバレッジ付きテスト
npm run test:watch      # ウォッチモード
```

### その他
```bash
# 依存関係を再インストール
make clean
make setup
```

### envファイルの用意
```bash
cp .env.example .env
```