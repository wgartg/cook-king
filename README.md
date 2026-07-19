# わっしょい みんなの料理人

完全無料(GitHub Pages + Firebase無料枠)で動く、身内10人程度向けのシンプルなレシピ共有サイトです。
GitHubライクなUI(リポジトリカード風の一覧、README風の詳細ページ、ダークモード切替)を採用しています。

## 機能
- レシピ投稿(写真・材料・分量・作り方・調理時間・人数分)
- 一覧表示(新着順)
- キーワード検索(料理名・材料名で絞り込み)
- 詳細ページ

いいね・コメント・ログインは省いてあります(将来Discord連携を想定した設計にしてありますが、今回は未実装です)。

---

## まずローカルで動作確認する(Firebase設定前でもOK)

`js/firebase-config.js` が未設定(初期値のまま)の場合、自動的に**ローカルモード**で動きます。
投稿データはブラウザの`localStorage`に保存され、他の人とは共有されませんが、UIや操作感はすべて確認できます。

1. このフォルダをパソコンにダウンロード
2. `type="module"` を使っているため、`index.html` を直接ダブルクリックでは動きません。フォルダ内で簡易サーバーを立ち上げてください。
   - Pythonがある場合: フォルダ内で `python3 -m http.server 8000` を実行
   - Node.jsがある場合: `npx serve .` などでも可
3. ブラウザで `http://localhost:8000` にアクセス
4. 投稿ページの黄色い帯で「ローカルモード」と表示されていればOK。投稿・一覧・検索・詳細が一通り動くか確認できます。

動作確認できたら、下記手順でFirebaseを設定すれば、そのまま本番(複数人での共有)に切り替わります。
`firebase-config.js` に正しい値を入れるだけで、コードの変更は不要です。

## セットアップ手順(Firebase本番設定)

### 1. Firebaseプロジェクトを作る
1. https://console.firebase.google.com/ にアクセスし、Googleアカウントでログイン
2. 「プロジェクトを追加」→ 適当な名前(例: `uchi-recipe`)を入力 → 作成
3. 料金プランは **Spark(無料)** のままでOK。クレジットカード登録も不要です。

### 2. Firestore Database を有効化
1. 左メニュー「構築」→「Firestore Database」→「データベースの作成」
2. ロケーションは `asia-northeast1` (東京) を推奨
3. 「本番環境モード」で作成
4. 作成後、「ルール」タブを開き、このプロジェクトの `firestore.rules` の内容を貼り付けて公開

### 3. Webアプリを追加して設定値を取得
※ 2026年2月からFirebase Storageは無料プラン(Spark)では使えなくなり、クレジットカード登録が必須のBlazeプランが必要になりました。
このプロジェクトでは**Storageを使わず、圧縮した写真をFirestoreのドキュメントに直接保存**する方式にしてあるので、
クレジットカード登録は不要です(Storageの有効化手順はスキップしてください)。

1. プロジェクトのトップ(歯車アイコン →「プロジェクトの設定」)→「全般」タブ
2. 下の方の「マイアプリ」→ `</>` (ウェブ) アイコンをクリック
3. アプリのニックネームを適当に入力(例: `recipe-web`)→ アプリを登録
4. 表示された `firebaseConfig` の中身を、このプロジェクトの `js/firebase-config.js` にコピー&ペースト

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

### 4. GitHub Pagesで公開する
1. GitHubで新しいリポジトリを作成(例: `recipe-share`)
2. このフォルダの中身一式(`index.html`, `post.html`, `detail.html`, `css/`, `js/` など)をリポジトリにpush
3. リポジトリの「Settings」→「Pages」→ Source を `main` ブランチ / `/ (root)` に設定 → 保存
4. 数分後、`https://ユーザー名.github.io/recipe-share/` でアクセス可能になります

これで、10人程度が同時にアクセスしても問題ない無料のレシピ共有サイトが完成です。

---

## 今のセキュリティについて(重要)
今の設定は「誰でも投稿できる」形になっています(ログイン機能が無いため)。
身内だけで使う分には基本的に問題ありませんが、URLとFirebaseの設定値(`firebase-config.js`の中身)が漏れると、
第三者が直接データを書き込める点だけ理解しておいてください。公開リポジトリにpushする場合はご注意ください
(非公開リポジトリ + GitHub Pages の限定公開設定、または後述のDiscord連携での認証追加をおすすめします)。

## 将来のDiscord連携について
Firebase Authは標準でDiscordログインに対応していないため、Discord連携を追加する場合は以下のどちらかが必要になります。

1. **Firebase Cloud Functions(要Blazeプラン、無料枠内なら課金なし)** を使って、DiscordのOAuthコールバックを受け取り、
   Firebase Custom Token を発行する仕組みを作る
2. **外部の認証サービス(例: Auth0, Supabase Auth)** に乗り換え、Discord Provider経由でログインさせる

データ構造はすでに `authorName` フィールドを持たせているので、認証を追加する際はここを
「投稿したDiscordユーザーのID/名前」に差し替えるだけで対応できます。今回はこの部分は据え置きにしてあります。

## ファイル構成
```
recipe-share/
├── index.html          # 一覧・検索
├── post.html            # 投稿フォーム
├── detail.html           # 詳細ページ
├── css/style.css         # スタイル
├── js/
│   ├── firebase-config.js  # ← ここに自分のFirebase設定を入れる
│   ├── data.js             # 設定の有無でローカル/Firebaseを自動切り替え(編集不要)
│   ├── local-store.js      # ローカルモード用(localStorage、編集不要)
│   └── firebase-store.js   # Firebase本番用(編集不要)
├── firestore.rules      # Firestoreセキュリティルール
```

## 写真について
写真はブラウザ上で自動的に幅900px・JPEG品質72%程度まで圧縮してからFirestoreに保存しています
(Storageを使わないための工夫です)。1レシピあたり数百KB程度になるので、Firestoreの無料枠(1GiB)内で
数千件規模のレシピ+写真を保存できます。あまりに巨大な写真をアップロードした場合はご注意ください。
