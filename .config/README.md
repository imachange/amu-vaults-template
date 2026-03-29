# `.config` README
.config ディレクトリは、ローカル開発で使う各種設定（フック・タスク・Lint 設定等）を集約した場所です。

## 目的
- リポジトリ内で共通に使うローカル設定をまとめ、開発フロー（コミット/プッシュ/スキャン等）を安定化させること。

## 前提
- Node.js と `pnpm` が利用可能であること（`commitlint` は `_amu` 側に定義）。

## クイックスタート
- 設定の検証: `lefthook validate --verbose`
- フックのインストール: `lefthook install`
- コミット時の動作確認（無効なメッセージでブロックされることを確認）:
  - `LEFTHOOK_VERBOSE=1 git commit --amend -m "fea"`

## 主要ファイル（このディレクトリ内）
- [.config/lefthook.toml](.config/lefthook.toml#L1) — Git フック設定（`pre-commit` / `pre-push` / `commit-msg`）
- [.config/mise/config.toml](.config/mise/config.toml#L1) — `mise` によるタスク定義（ローカルタスクランナー）
 - [.config/mise/tasks/](.config/mise/tasks/) — タスク用スクリプト群（`pre-commit` 等）
 - [.config/mise/tasks/cz](.config/mise/tasks/cz) — commitizen 用の `mise` タスク（対話的コミットを起動）
 - [.config/.czrc](.config/.czrc) — commitizen (cz) の設定（`_amu` 内の adapter を指す）
- [.config/commitlint.config.js](.config/commitlint.config.js#L1) — `commitlint` のルール設定（日本語メッセージ + カスタムルール）
- [.config/gitleaks.toml](.config/gitleaks.toml#L1) — gitleaks のスキャン設定

## 主要タスク（簡潔説明）
- `mise` のタスク（現在は `.config/mise/tasks/` にファイルとして定義）:
  - `pre-commit`: ステージされた変更に対する lint / テスト等の短いチェック
  - `pre-push`: プッシュ前の統合的な検査（簡易 CI 相当）
  - `full-scan`: リポジトリ全体のセキュリティスキャン等を実行 (gitleaks など)
  - `reviewdog`: 静的解析結果を PR に投稿するラッパー
  - `cz`: 対話的コミットヘルパー（commitizen）。`mise run cz` で起動します。`prepare-commit-msg` フックは `mise run cz {1}` を呼ぶよう設定されています（フック実行時は端末 stdin が接続されます）。

## Mise の file-tasks について
- 現在、`mise` のタスクは `.config/mise/tasks/` にファイルとして配置されています。ファイル名がタスク名になり、拡張子は不要です。
- 各タスクファイルの先頭に MISE メタデータをコメントとして記述してください（例を以下に示します）。

### 例（タスクファイル先頭に記述）:
```
#MISE description="Build the CLI"
#MISE alias="b"
#MISE sources=["Cargo.toml", "src/**/*.rs"]
#MISE outputs=["target/debug/mycli"]
#MISE env={RUST_BACKTRACE = "1"}
#MISE depends=["lint", "test"]
#MISE tools={rust="1.50.0"}
```

- 手動実行: `mise run <task>`（例: `mise run pre-commit`）

- `lefthook` のフック（.config/lefthook.toml に定義）:
  - `commit-msg` → `commitlint`: `commitlint` を実行し、カスタムルールでコミットヘッダが末尾に `#<issue>` を含むことを検証

## トラブルシューティング
- `lefthook validate` で設定エラーを確認してください。
- フックが反映されない場合は `lefthook install` を実行し、`LEFTHOOK_VERBOSE=1` を付けて実行ログを確認してください。
- 個別タスクは `mise run <task>` で手動実行できます（例: `mise run commit-msg`）。

## 運用上の注意
- 開発者が `--no-verify` を使うとフックをスキップできます。
- ルールを変更したら `.config/commitlint.config.js` や `.config/lefthook.toml` を更新してください。
- この README の内容は `.config` 配下に限定しています。

## .config の構成
- **Lefthook**: Git フックの設定。フック定義は [.config/lefthook.toml](.config/lefthook.toml#L1) にあります。`pre-commit` / `pre-push` / `commit-msg` の各フックをここで定義しています。
  - 補足: `prepare-commit-msg` は `mise run cz {1}` を呼び、対話的な commitizen を起動するよう設定しています（`.config/.czrc` を参照）。
- **Mise**: リポジトリ内のタスクランナーです。`lefthook` から `mise run <task>` で呼び出されます。設定は [.config/mise/config.toml](.config/mise/config.toml#L1) にあり、主要タスク（`pre-commit` / `pre-push` / `commit-msg` など）が定義されています。
- **commitlint**: コミットメッセージ検証ツール。設定は [.config/commitlint.config.js](.config/commitlint.config.js#L1) にあります。実行は `_amu` パッケージ経由で `pnpm --prefix _amu exec commitlint` を使います。
- **_amu**: 開発依存をまとめたサブパッケージ（`_amu/package.json`）。`commitlint` 等はここに入っています。
- **pnpm**: パッケージマネージャ。依存のインストールや `commitlint` 実行に使用します。

## 各ツールの概要とよく使うコマンド
- **Lefthook (ローカルフック管理)**:
  - 設定検証: `lefthook validate --verbose`
  - フックのインストール: `lefthook install`
  - フックの直接実行: `lefthook run <hook> <args>`（例: `lefthook run commit-msg .git/COMMIT_EDITMSG`）
- **Mise (タスク実行)**:
  - タスク一覧と定義: [.config/mise/config.toml](.config/mise/config.toml#L1)
  - タスク実行: `mise run <task>`（例: `mise run pre-commit`）
- **commitlint (コミットメッセージ検証)**:
  - 直接実行: `pnpm --prefix _amu exec commitlint --config ../.config/commitlint.config.js --edit .git/COMMIT_EDITMSG`
  - 設定ファイル: [.config/commitlint.config.js](.config/commitlint.config.js#L1)

- **commitizen (cz)**:
  - 対話的起動 (ローカル): `mise run cz`
  - `_amu` 側の依存をインストールするには: `pnpm --prefix _amu install`
  - 備考: `prepare-commit-msg` フックは `mise run cz {1}` を呼び、通常の `git commit` 実行時に対話プロンプトが起動します。手動で起動する場合は `mise run cz` を使用してください。

## トラブルシューティング / デバッグ
- `lefthook validate` で設定エラーが出た場合はエラーメッセージを確認し、`.config/lefthook.toml` の構文（TOML）を修正してください。
- フックが走らない / 期待通り動かない場合:
  - `lefthook install` を再実行
  - `LEFTHOOK_VERBOSE=1` を付けて詳細ログを見る
  - individual hook を `lefthook run` で直接試す（上記参照）
  - 一時的にフックを無効化するには `git commit --no-verify` を使用できます（チームでは注意）。

## 運用上の注意 
- CI 側でも同じ検証を実行することを推奨します（例: mise を使った CI ジョブ）。