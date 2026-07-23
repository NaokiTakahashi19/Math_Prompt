# 生成問題ビューア インストール手順書

## 1. 概要

生成された中学数学の問題ファイル（`.txt`）を、Markdown、TeX数式、TikZ図としてブラウザに表示する静的Webアプリです。

サーバー側のプログラムやデータベースは不要です。Webサーバーにフォルダを置くだけで動作します。

公開中のページ：

https://naokitakahashi19.github.io/Math_Prompt/question-viewer/

## 2. 配布ファイル

```text
question-viewer/
├── index.html   Webアプリ本体
└── README.md    この手順書
```

`index.html`は、実行時に次のライブラリをインターネット上のCDNから読み込みます。

- MathJax 3.2.2：TeX数式の表示
- Marked 15.0.12：Markdownの変換
- DOMPurify 3.4.12：変換したHTMLの無害化
- TikZJax v1：TikZ図のSVG変換

したがって、ビューアを利用する端末にはインターネット接続が必要です。

## 3. 動作環境

- Chrome、Edge、Safari、Firefoxの比較的新しいバージョン
- HTTPSまたはHTTPで配信できるWebサーバー
- 問題ファイルを配信するサーバーでCORSが許可されていること

`index.html`をFinderから直接ダブルクリックして開く方法（`file://`）は使用しないでください。ブラウザのセキュリティ制限により、問題ファイルを取得できない場合があります。

## 4. 一般的なWebサーバーへの設置

1. 配布ZIPを解凍します。
2. `question-viewer`フォルダをWebサーバーの公開フォルダへアップロードします。
3. ブラウザで次の形式のURLを開きます。

```text
https://example.com/question-viewer/
```

追加のインストールコマンドやビルド作業はありません。

## 5. GitHub Pagesへの設置

1. GitHub Pagesを使用するリポジトリを用意します。
2. リポジトリの公開対象ブランチに`question-viewer`フォルダを追加します。
3. GitHubのリポジトリ画面で「Settings」→「Pages」を開きます。
4. 公開するブランチとフォルダを選択して保存します。
5. デプロイ完了後、次の形式で開きます。

```text
https://ユーザー名.github.io/リポジトリ名/question-viewer/
```

現在の設置例：

```text
https://naokitakahashi19.github.io/Math_Prompt/question-viewer/
```

## 6. ローカルでの確認

Python 3がインストールされている場合は、`question-viewer`フォルダがある場所で次を実行します。

```bash
python3 -m http.server 8000
```

ブラウザで次を開きます。

```text
http://localhost:8000/question-viewer/
```

停止するときは、コマンドを実行した画面で`Ctrl+C`を押します。

## 7. 使用方法

1. 入力欄に問題ファイルのURLを貼り付けます。
2. 「表示」を押します。
3. 問題、解答、解説、数式、表、図がレンダリングされます。

対応する問題URLの例：

```text
https://naokitakahashi19.github.io/Math_Prompt/Math_Question/m-jh1-A-01-02b-01.txt
```

問題URLを指定した状態で直接開く場合は、ビューアURLの後ろに`?url=`を付けます。問題URLはURLエンコードしてください。

```text
https://naokitakahashi19.github.io/Math_Prompt/question-viewer/?url=https%3A%2F%2Fnaokitakahashi19.github.io%2FMath_Prompt%2FMath_Question%2Fm-jh1-A-01-02b-01.txt
```

## 8. CORSについて

ビューアと問題ファイルが異なるドメインにある場合、問題ファイル側のサーバーが外部からの取得を許可している必要があります。

レスポンスヘッダーの例：

```http
Access-Control-Allow-Origin: *
```

GitHub Pages上の問題ファイルは、この用途でそのまま利用できます。

「Failed to fetch」または「ファイルを取得できませんでした」と表示される場合は、次を確認してください。

- 問題ファイルのURLをブラウザで直接開けるか
- 問題ファイルがHTTPSで配信されているか
- 問題ファイル側のCORSが許可されているか
- 社内ネットワークでCDNへの接続が遮断されていないか

## 9. TikZ図について

TikZ図はブラウザ内でSVGへ変換します。初回表示は数式だけの問題より時間がかかり、端末や通信環境によっては数十秒かかることがあります。

TikZコードに未対応のパッケージや構文が含まれる場合は、図を表示できないことがあります。

## 10. 更新方法

新しい配布版へ更新するときは、Webサーバー上の`index.html`を新しいファイルで置き換えます。`README.md`は動作には使用しませんが、最新版を一緒に保管してください。
