# わっしょい みんなの料理人

完全無料(GitHub Pages + Firebase無料枠 + Cloudflare Workers無料枠)で動く、身内10人程度向けの
レシピ共有サイトです。GitHubライクなUI + Discordログイン + 管理者ページを備えています。

## 機能
- Discordアカウントでログインして投稿(なりすまし防止)
- レシピ投稿(写真・材料・分量・作り方・調理時間・人数分)
- 一覧表示(新着順)・キーワード検索・詳細ページ
- 自分の投稿は編集・削除が可能。管理者は全レシピを編集・削除可能
- いいね機能(1人1回、ログインしていれば誰でも押せる)
- 管理者ページ(`admin.html`): 全レシピの一覧・編集・削除
- ダークモード切替

---

## まずローカルで動作確認する(Firebase/Discord未設定でもOK)

`js/firebase-config.js` が初期値のままの場合、自動的に**ローカルモード**で動きます。
データはブラウザの`localStorage`に保存され、ログインなしで投稿・削除・管理画面すべてを試せます。

1. このフォルダをパソコンにダウンロード
2. フォルダ内で簡易サーバーを起動(`type="module"`を使うため、直接ファイルを開くのはNG)
   ```bash
   python3 -m http.server 8000
   ```
3. ブラウザで `http://localhost:8000` にアクセス

動作確認できたら、以下の順番で本番設定をします。

**① Firebase設定 → ② Discord + Cloudflare Worker設定 → ③ GitHub Pagesで公開**

---

## ① Firebaseの設定

### 1. Firebaseプロジェクトを作る
1. https://console.firebase.google.com/ にアクセスしGoogleアカウントでログイン
2. 「プロジェクトを追加」→ 名前を入力(例: `wasshoi-recipe`)→ 作成
3. 料金プランは自動で **Spark(無料)**。クレジットカード登録も不要

### 2. Firestore Database を有効化
1. 「構築」→「Firestore Database」→「データベースの作成」
2. ロケーション: `asia-northeast1` (東京)
3. 「本番環境モード」で作成 → 作成後「ルール」タブに `firestore.rules` の内容を貼り付けて公開

### 3. Authentication を有効化(Discordログインの受け皿)
1. 「構築」→「Authentication」→「始める」
2. 「Sign-in method」タブで「カスタム認証」が使えるように、特に追加設定は不要です
   (このプロジェクトはCloudflare Worker側で発行した「カスタムトークン」でログインするので、
   Firebaseコンソール側でDiscordプロバイダーを探す必要はありません)

### 4. サービスアカウントの秘密鍵を発行(Worker側で使用)
1. 「プロジェクトの設定」→「サービス アカウント」タブ →「新しい秘密鍵の生成」
2. ダウンロードされたJSON内の `client_email` と `private_key` を後で使うのでメモ
   (このファイルは他人に渡さないこと。GitHubにpushしないこと)

### 5. Webアプリを登録して設定値を取得
※ 2026年2月からFirebase Storageは無料プランで使えなくなりましたが、このサイトは
写真をFirestoreに直接保存する方式なので**Storageは不要**です。有効化しなくてOKです。

1. 「プロジェクトの設定」→「全般」→「マイアプリ」→ `</>` (ウェブ) アイコン
2. ニックネームを入力(例: `recipe-web`)→ 登録
3. 表示された `firebaseConfig` を `js/firebase-config.js` に貼り付け

```js
export const firebaseConfig = {
  apiKey: "実際の値",
  authDomain: "実際の値",
  projectId: "実際の値",
  storageBucket: "実際の値",
  messagingSenderId: "実際の値",
  appId: "実際の値"
};
```

---

## ② Discordログイン + 管理者ページの設定

Discordログインには「認証コードをFirebase用トークンに変換する」小さな仲介プログラムが必要です。
これは同梱の `discord-auth-worker` フォルダにあり、**Cloudflare Workers**(無料、カード登録不要)で動かします。

詳しい手順は `discord-auth-worker/README.md` にまとめてあります。ざっくりした流れ:

1. Discord Developer Portalでアプリを作成し、Client ID / Client Secretを取得
2. `discord-auth-worker` フォルダで `npm install` → `wrangler login` → 秘密情報を登録 → `wrangler deploy`
3. デプロイされたWorkerのURLと、Discord Client IDを `recipe-share/js/auth-config.js` に貼り付け

```js
export const DISCORD_CLIENT_ID = "実際のClient ID";
export const AUTH_WORKER_URL = "https://your-worker.workers.dev/auth/discord";
```

4. 管理者にしたい人のDiscordユーザーIDを `discord-auth-worker/wrangler.toml` の
   `ADMIN_DISCORD_IDS` にカンマ区切りで設定(Discordの開発者モードをONにしてIDをコピー)

管理者に設定された人がDiscordでログインすると、右上に「🛡 Admin」ボタンが表示され、
`admin.html` から全レシピの削除ができるようになります。管理者でなくても、自分が投稿した
レシピは詳細ページから削除できます。

---

## ③ GitHub Pagesで公開する
1. GitHubで新しいリポジトリを作成(例: `wasshoi-recipe`)
2. `recipe-share` フォルダの中身一式をリポジトリにpush(`discord-auth-worker`フォルダは
   Cloudflare側にデプロイするものなので、こちらは含めなくてOKです)
3. 「Settings」→「Pages」→ Source を `main` ブランチ / `/ (root)` に設定 → 保存
4. 数分後、`https://ユーザー名.github.io/wasshoi-recipe/` でアクセス可能
5. Discord Developer Portalの「OAuth2 > Redirects」に、実際に公開されたURLの
   `auth-callback.html` を追加するのを忘れずに
   (例: `https://ユーザー名.github.io/wasshoi-recipe/auth-callback.html`)

---

## セキュリティについて
- 投稿にはDiscordログインが必須なので、匿名の荒らし投稿は防げます
- 削除は「投稿した本人」と「管理者」のみに制限されています(Firestoreのルールで強制)
- `js/firebase-config.js` や `js/auth-config.js` の中身(APIキー・Client ID)はリポジトリに
  含まれますが、これらは公開されても直接悪用されるものではありません(Discordの
  Client **Secret** やFirebaseのサービスアカウント秘密鍵は絶対にリポジトリに含めず、
  Cloudflare Workerの`wrangler secret put`でのみ管理してください)

## 写真について
写真はブラウザ上で自動的に幅900px・JPEG品質72%程度まで圧縮してからFirestoreに保存しています
(Storageを使わないための工夫です)。1レシピあたり数百KB程度になるので、Firestoreの無料枠(1GiB)内で
数千件規模のレシピ+写真を保存できます。

## ファイル構成
```
recipe-share/
├── index.html            # 一覧・検索
├── post.html              # 投稿フォーム(ログイン必須)
├── detail.html             # 詳細ページ(削除ボタン付き)
├── admin.html              # 管理者ページ
├── auth-callback.html      # Discordログイン後のコールバック処理
├── css/style.css           # スタイル
├── js/
│   ├── firebase-config.js   # ← Firebaseの設定値を入れる
│   ├── auth-config.js       # ← Discord Client ID / Worker URLを入れる
│   ├── firebase-app.js      # Firebase初期化の共通化(編集不要)
│   ├── data.js               # ローカル/Firebaseの自動切り替え(編集不要)
│   ├── local-store.js        # ローカルモード用(編集不要)
│   ├── firebase-store.js     # Firebase本番用(編集不要)
│   ├── auth.js                # Discordログイン処理(編集不要)
│   ├── auth-ui.js             # ヘッダーのログイン状態表示(編集不要)
│   └── theme.js               # ダークモード切替(編集不要)
└── firestore.rules         # Firestoreセキュリティルール

discord-auth-worker/       # Cloudflare Workerプロジェクト(別途デプロイ)
├── src/worker.js
├── wrangler.toml
├── package.json
└── README.md               # Workerのデプロイ手順
```
