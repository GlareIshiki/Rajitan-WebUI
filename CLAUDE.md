# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Rajitan Discord Botの管理コンソール＋ホームページ。Next.js 15 (App Router) + React 19 + TailwindCSS 4 + TypeScript。
メイン機能は**LeveMagi**（ツリーメタファーのプロジェクト管理 + ゲーミフィケーション）。

## Commands

```bash
npm run dev      # 開発サーバー (localhost:3000)
npm run build    # 本番ビルド
npm run start    # 本番サーバー
npm run lint     # ESLint
```

テストフレームワークは未導入。ビルド成功が品質ゲート。

## Environment Variables

```
NEXTAUTH_URL, NEXTAUTH_SECRET         # NextAuth設定
DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET  # Discord OAuth
NEXT_PUBLIC_RAJITAN_API_URL            # Rajitan FastAPIバックエンド (default: http://localhost:8000)
```

## Architecture

### ルーティング (App Router)

- `/` — ランディングページ（未ログインユーザー向け）
- `/dashboard` — Bot稼働状況・統計（要認証）
- `/levemagi` — メイン機能：プロジェクト管理（要認証）
- `/calendar` — カレンダー（要認証）
- `/stats` — 統計詳細（要認証）
- `/settings` — 設定（要認証）

### テーマシステム (`ThemeProvider.tsx`)

**2軸制御**: テーマカラー(6色) × モード(dark/light)

CSS変数を `<html>` に注入する方式。コンポーネントからは `useTheme()` フックか CSS変数で参照。

- `--theme-primary`, `--theme-accent`, `--theme-glow`, `--theme-particle`
- `--mode-bg`, `--mode-text`, `--mode-text-secondary`, `--mode-border`
- `--mode-bg-card`, `--mode-bg-secondary`

`globals.css` にユーティリティクラス定義あり: `.bg-app`, `.text-primary`, `.card`, `.btn-primary` 等。

**注意**: ハードコードされた色（`bg-[#2a2a2a]`, `text-gray-400` 等）はテーマ非対応。新規コードでは必ずCSS変数またはユーティリティクラスを使う。

### 認証 (`src/lib/auth.ts`)

NextAuth + Discord OAuth。セッションに `accessToken` と `id` を含む。

```typescript
const token = (session as { accessToken?: string } | null)?.accessToken;
```

### APIクライアント (`src/lib/api.ts`)

Rajitan FastAPIバックエンドとの通信。**snake_case ↔ camelCase自動変換**あり。

```typescript
api.get<T>(path, token?)
api.post<T>(path, body, token?)
api.put<T>(path, body, token?)
api.delete<T>(path, token?)
```

### LeveMagi アーキテクチャ

ツリーメタファーのエンティティ構造:

```
Portal (ポータル: テーマ別ダッシュボード)
  └── Nuts (成果物: プロジェクト)
        ├── Trunk (イシュー: 問題・意思決定)
        │     └── Leaf (タスク: 実作業)
        ├── Leaf (タスク: Trunk紐付けなしも可)
        └── Root (ナレッジ: 学び・知見)
```

**状態管理**: `useLeveMagi()` フック（`src/hooks/levemagi/useLeveMagi.ts`）
- 認証時: FastAPI `/api/levemagi/*` から読み書き
- 未認証時: localStorage フォールバック
- **楽観的更新**: UIを即座に更新し、APIコールはバックグラウンド

**ゲーミフィケーション**:
- Leaf完了 → XP獲得（`actualHours + bonusHours`）
- XP蓄積 → レベルアップ → ガチャチケット付与
- レベルコスト: `level² × 10` XP
- Nuts所属Leafのボーナスは2倍

**型定義**: `src/lib/levemagi/types.ts`
**定数・マスタ**: `src/lib/levemagi/constants.ts`
**XP計算**: `src/lib/levemagi/xp.ts`
**フェーズ判定**: `src/lib/levemagi/milestones.ts`（green → yellow → red → fire）

### データ永続化

```
認証あり → FastAPI (SQLite) が正
認証なし → localStorage (levemagi-data)
初回ログイン時にlocalStorage → APIへ自動マイグレーション
```

## Deployment

Vercelにデプロイ。`git push` で自動ビルド・デプロイ。
Discord OAuthのリダイレクトURLに本番URLの追加が必要。

## 関連リポジトリ

- **Rajitan-Discord** (`../Rajitan-Discord/`) — FastAPIバックエンド + Discord Bot本体 (Python)
  - LeveMagi CRUD: `rajitan/storage/levemagi_client.py`
  - API routes: `rajitan/web/routes/levemagi.py`, `rajitan/web/routes/bot.py`
