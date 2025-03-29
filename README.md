# skillShop

## セキュリティアップデート手順

### 依存パッケージの脆弱性チェック

```bash
# コンテナ内で脆弱性チェックを実行
docker compose exec web npm audit
```

### 脆弱性の修正

1. 脆弱性が検出された場合、以下のコマンドで修正を試みます：
```bash
# 自動修正を実行
docker compose exec web npm audit fix
```

2. 自動修正で解決しない場合、特定のパッケージを手動で更新します：
```bash
# 例：Next.jsの更新
docker compose exec web npm install next@最新バージョン
```

### アプリケーションの再起動

```bash
# コンテナを再起動して変更を反映
docker compose restart web
```

### 注意事項

- 重大な脆弱性（Critical）が検出された場合は、即座に対応が必要です
- パッケージの更新後は、アプリケーションの動作確認を行ってください
- 依存関係の互換性に問題がある場合は、`package.json`の依存関係を手動で調整する必要があります