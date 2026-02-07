# Rajitan WebUI

Rajitan Discord Botの管理コンソール兼ホームページ。

## 機能

- **ホームページ**: Rajitanの紹介、機能説明、コマンド一覧
- **ダッシュボード**: Bot状態、最近のアクティビティ、クイックアクション
- **設定**: サーバーごとの自動機能設定、キャラクター選択
- **統計**: アクティビティ推移、サーバー別統計

## セットアップ

### 1. 依存関係インストール

```bash
npm install
```

### 2. 環境変数設定

`.env.example`をコピーして`.env.local`を作成:

```bash
cp .env.example .env.local
```

必要な値を設定:

- `NEXTAUTH_SECRET`: ランダムな文字列（`openssl rand -base64 32`で生成可能）
- `DISCORD_CLIENT_ID`: Discord Developer Portalで作成したOAuth2アプリのClient ID
- `DISCORD_CLIENT_SECRET`: 同上のClient Secret

### 3. Discord OAuth設定

1. [Discord Developer Portal](https://discord.com/developers/applications)でアプリを作成
2. OAuth2 > General > Redirectsに`http://localhost:3000/api/auth/callback/discord`を追加
3. Client IDとClient Secretを`.env.local`に設定

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能。

## Vercelデプロイ

1. GitHubにpush
2. Vercelでリポジトリをインポート
3. 環境変数を設定:
   - `NEXTAUTH_URL`: デプロイ先URL（例: `https://rajitan.vercel.app`）
   - `NEXTAUTH_SECRET`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
4. Discord Developer Portalで本番URLをリダイレクト先に追加

## 技術スタック

- Next.js 15
- TypeScript
- Tailwind CSS 4
- NextAuth.js (Discord OAuth)
