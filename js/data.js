import { firebaseConfig } from "./firebase-config.js";

export const isLocalMode = !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY";

// Safari(特にiOS)ではtop-level awaitで代入したexport constを他モジュールが
// 参照すると「Cannot access 'X' before initialization」というTDZエラーになる
// ケースがあるため、遅延読み込み+関数呼び出しの形にして回避する。
let implPromise = null;
function loadImpl() {
  if (!implPromise) {
    implPromise = isLocalMode ? import("./local-store.js") : import("./firebase-store.js");
  }
  return implPromise;
}

export async function listRecipes(...args) {
  const impl = await loadImpl();
  return impl.listRecipes(...args);
}

export async function getRecipe(...args) {
  const impl = await loadImpl();
  return impl.getRecipe(...args);
}

export async function createRecipe(...args) {
  const impl = await loadImpl();
  return impl.createRecipe(...args);
}

export async function updateRecipe(...args) {
  const impl = await loadImpl();
  return impl.updateRecipe(...args);
}

export async function deleteRecipe(...args) {
  const impl = await loadImpl();
  return impl.deleteRecipe(...args);
}

export async function toggleLike(...args) {
  const impl = await loadImpl();
  return impl.toggleLike(...args);
}

// ローカルモードのみ有効(Firebaseモードではnullを返す)
export async function getLocalUserId(...args) {
  const impl = await loadImpl();
  return impl.getLocalUserId ? impl.getLocalUserId(...args) : null;
}
