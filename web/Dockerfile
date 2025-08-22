FROM node:20-alpine
WORKDIR /usr/src/app

# まず shared を入れる（単一ソース）
COPY packages/shared ./packages/shared

# 既存のファイルをコピー
COPY web/package.json ./
COPY web/tsconfig.json ./
COPY web/index.html ./
COPY web/src ./src

# 依存（TypeScript/http-server）をインストール
RUN npm install --no-audit --no-fund typescript http-server

# コンパイル（dist にJSを出力）
RUN rm -rf dist && npx tsc

# index.html を dist に
RUN mkdir -p dist && cp index.html dist/index.html

EXPOSE 5173
CMD ["npx", "http-server", "dist", "-p", "5173"]
