# components/personas/

## 目的
ペルソナ管理UI。ギルドごとのBot人格(ペルソナ)切替・CRUD・アバター設定。

## 主要ファイル
- `PersonaCard.tsx` — カード表示。アバタークリックアップロード、トレイトバー、アクティブ/編集/削除ボタン
- `PersonaEditor.tsx` — モーダルフォーム。名前/表示名/説明/システムプロンプト/トレイトスライダー/公開設定
- `AvatarCropModal.tsx` — `react-easy-crop`による円形クロップ → 256x256 PNG

## 依存関係
- フック: `@/hooks/personas/usePersonas` — CRUD + `uploadAvatar` + `setActivePersona`、30秒ポーリング
- 型: `@/types/persona` — `Persona`, `PersonalityTraits`, `PersonaCreate`, `PersonaUpdate`
- API: `@/lib/api` — Rajitan FastAPIバックエンド通信
- ページ: `src/app/personas/page.tsx` (App Router, この中からimport)

## バックエンドAPI
- `GET/POST /api/bot/guilds/{guildId}/personas` — 一覧/作成
- `PUT/DELETE /api/bot/guilds/{guildId}/personas/{id}` — 更新/削除
- `PUT /api/bot/guilds/{guildId}/personas/active` — アクティブ切替
- `POST /api/bot/personas/{id}/avatar` — アバターアップロード

## 制約
- プリセット8種は編集不可（アバター変更のみ可）
- カスタムペルソナは50個/ギルド上限
- テーマシステム準拠: CSS変数 / ユーティリティクラスのみ使用
