.PHONY: setup install test dev clean docker-build docker-up docker-down docker-restart

# 初回セットアップ
setup: install docker-build test
	@echo "✅ セットアップ完了！"
	@echo "開発サーバー起動: make dev"

# 依存関係のインストール
install:
	@echo "📦 依存関係をインストール中..."
	npm install
	cd api && npm install

# テスト実行
test:
	@echo "🧪 テストを実行中..."
	npm run test:api

# 開発サーバー起動
dev:
	@echo "🚀 開発サーバーを起動中..."
	docker-compose up --build

# Docker関連
docker-build:
	@echo "🐳 Dockerイメージをビルド中..."
	docker-compose build

docker-up:
	@echo "🐳 Dockerコンテナを起動中..."
	docker-compose up -d

docker-down:
	@echo "🐳 Dockerコンテナを停止中..."
	docker-compose down

docker-restart: docker-down
	@echo "🐳 Dockerコンテナを再起動中..."
	docker-compose up -d --build

# クリーンアップ
clean:
	@echo "🧹 クリーンアップ中..."
	rm -rf node_modules api/node_modules coverage
	docker-compose down -v
	docker system prune -f

# ヘルプ
help:
	@echo "利用可能なコマンド:"
	@echo "  make setup     - 初回セットアップ"
	@echo "  make install   - 依存関係のインストール"
	@echo "  make test      - テスト実行"
	@echo "  make dev       - 開発サーバー起動"
	@echo "  make docker-restart - コンテナを停止→再ビルド→再起動"
	@echo "  make clean     - クリーンアップ"
