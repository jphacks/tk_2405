# ディレクトリ構造とファイルについての説明
MoveNetsと呼ばれる事前学習済pose-detectionモデルを用いて体の位置を推定しpush upを数えるアプリです。
tensorflow.jsのボディトラッキングを試したい場合は以下のコマンドを実行してください
```sh
pnpm install
pnpm vite
```
ローカルで実行ファイルを生成したい場合は追加で以下のコマンドを実行してください
```sh
pnpm vite build
```
そうすることでdistディレクトリが生成されます。それを動かすだけで試せます。

## libディレクトリについて
index.htmlとapp.jsから構築され、CDNを用いて必要ライブラリをインポートして実装されています。

## srcディレクトリについて
viteでのpreview用に作られたディレクトリで使っているのはpose-detection.jsxとmain, appのみです。