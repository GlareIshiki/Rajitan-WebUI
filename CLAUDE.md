# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Rajitan Discord Botの管理コンソール＋ホームページ。Next.js 15 (App Router) + React 19 + TailwindCSS 4 + TypeScript。
主要機能は **LeveMagi**（ツリーメタファーのプロジェクト管理 + ゲーミフィケーション）と **ペルソナ管理**（Botの人格切替 + アバター設定）。

## Commands

```bash
npm run dev      # 開発サーバー (localhost:3000)
npm run build    # 本番ビルド（品質ゲート — テストフレームワーク未導入）
npm run start    # 本番サーバー
npm run lint     # ESLint
```

## Environment Variables

```
NEXTAUTH_URL, NEXTAUTH_SECRET         # NextAuth設定
DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET  # Discord OAuth
NEXT_PUBLIC_RAJITAN_API_URL            # Rajitan FastAPIバックエンド (default: http://localhost:8000)
```

## Architecture

### ルーティング (App Router)

- `/` — ランディングページ（未ログイン向け）
- `/dashboard` — Bot稼働状況・統計（要認証）
- `/levemagi` — プロジェクト管理 + ゲーミフィケーション（要認証）
- `/calendar` — カレンダー + Google Calendar連携（要認証）
- `/personas` — ペルソナ管理: プリセット8種 + カスタム50個/ギルド（要認証）
- `/settings` — テーマ・自動機能設定（要認証）
- `/stats` — 統計詳細（要認証）

### テーマシステム (`ThemeProvider.tsx`)

**2軸制御**: テーマカラー(6色: purple/cyan/pink/green/amber/rose) × モード(dark/light)

CSS変数を `<html>` に注入。コンポーネントからは `useTheme()` フックか CSS変数で参照。

- テーマ: `--theme-primary`, `--theme-accent`, `--theme-glow`, `--theme-particle`
- モード: `--mode-bg`, `--mode-text`, `--mode-text-secondary`, `--mode-border`, `--mode-bg-card`, `--mode-bg-secondary`

`globals.css` にユーティリティクラス定義: `.bg-app`, `.text-primary`, `.text-muted`, `.card`, `.btn-primary`, `.btn-secondary` 等。

**重要**: ハードコードされた色（`bg-[#2a2a2a]`, `text-gray-400` 等）はテーマ非対応。新規コードでは必ずCSS変数またはユーティリティクラスを使う。

### 認証 (`src/lib/auth.ts`)

NextAuth + Discord OAuth。セッションに `accessToken` と `id` を含む。

```typescript
const token = (session as { accessToken?: string } | null)?.accessToken;
```

### APIクライアント (`src/lib/api.ts`)

Rajitan FastAPIバックエンドとの通信。**snake_case ↔ camelCase自動変換**あり（特殊: `total_xp` ↔ `totalXP`）。

```typescript
api.get<T>(path, token?)
api.post<T>(path, body, token?)
api.put<T>(path, body, token?)
api.delete<T>(path, token?)
api.uploadFile<T>(path, file, token?)   // multipart/form-data（アバター等）
```

### ペルソナ管理

ギルドごとにBotの人格（ペルソナ）を切り替えるシステム。Feature Slice構成。

- **型定義**: `src/types/persona.ts` — `Persona`, `PersonalityTraits`（5トレイト: friendliness/humor/energy/formality/helpfulness, 各0-1.0）
- **フック**: `src/hooks/personas/usePersonas.ts` — CRUD + `uploadAvatar` + `setActivePersona`、30秒ポーリング
- **コンポーネント**: `src/components/personas/` — 詳細は `CLAUDE.md` 参照
  - `PersonaCard` — カード表示 + アバタークリックアップロード + トレイトバー
  - `PersonaEditor` — モーダルフォーム（名前/表示名/説明/システムプロンプト/トレイトスライダー/公開設定）
  - `AvatarCropModal` — `react-easy-crop` による円形クロップ → 256x256 PNG

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
- 未認証時: localStorage フォールバック（初回ログイン時に自動マイグレーション）
- **楽観的更新**: UIを即座に更新し、APIコールはバックグラウンド

**ゲーミフィケーション**:
- Leaf完了 → XP獲得（`actualHours + bonusHours`、Nuts所属は2倍）
- レベルコスト: `level² × 10` XP → ガチャチケット付与
- フェーズ判定: green → yellow → red → fire（`milestones.ts`）

## Deployment

Vercelにデプロイ。`git push` で自動ビルド・デプロイ。
Discord OAuthのリダイレクトURLに本番URLの追加が必要。

## 関連リポジトリ

- **Rajitan-Discord** (`../Rajitan-Discord/`) — FastAPIバックエンド + Discord Bot本体 (Python)
  - ペルソナAPI: `rajitan/web/routes/personas.py`
  - LeveMagi CRUD: `rajitan/storage/levemagi_client.py`
  - API routes: `rajitan/web/routes/levemagi.py`, `rajitan/web/routes/bot.py`
