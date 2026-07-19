// Discord OAuth / Cloudflare Worker の公開設定。
// Client Secretはここには絶対に書かない(Worker側の環境変数にだけ保存する)。

export const DISCORD_CLIENT_ID = "1528358100329828442";

// Cloudflare Workerをデプロイした後のURL + パス。
export const AUTH_WORKER_URL = "https://wasshoi-discord-auth.cook-king.workers.dev/auth/discord";

// Discordなどにリンクを貼った時に写真とレシピ名がプレビュー表示されるようにするための、
// Worker側の共有ページのベースURL(末尾スラッシュなし)。AUTH_WORKER_URLと同じドメインです。
export const SHARE_LINK_BASE = "https://wasshoi-discord-auth.cook-king.workers.dev";
