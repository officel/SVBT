# pnpm の使い方

> アクションで GITHUB_TOKEN を使用するとリポジトリとのすべてのやり取りは Github-actions ボットによって実行されます。
> Github-actions ボットによる操作は、新しいワークフローの実行をトリガーすることはできません。

[Github actions workflow not triggering with tag push · community · Discussion #27028](https://github.com/orgs/community/discussions/27028#discussioncomment-3254360)

## 依存関係

```sh
pnpm install
pnpm outdated
pnpm up --latest
pnpm audit
pnpm audit --fix
```

不要な依存関係を `package.json` から削除した後は、`pnpm install` でロックファイルとインストール済み依存関係を同期します。

## 開発・検証

```sh
pnpm test
pnpm run typecheck
pnpm run package
pnpm run vscode:vsix
```

`pnpm run vscode:publish` で Marketplace に公開します。VSIX は webpack のバンドルを含むため、依存関係の収集を無効化しています。

`pnpm-workspace.yaml` がないこのリポジトリでは、`pnpm list --depth 0` でプロジェクトの依存関係を確認できます。
