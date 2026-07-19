// Firebase未設定時のフォールバック。ブラウザのlocalStorageをDB代わりに使う。
// 本番用ではないが、Firebaseの設定前にUI/動作をそのまま確認できる。

const KEY = "recipe-share:recipes";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export async function listRecipes() {
  return readAll().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getRecipe(id) {
  return readAll().find(r => r.id === id) || null;
}

export async function createRecipe(fields) {
  const list = readAll();
  const id = "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const record = { id, ...fields, createdAt: Date.now() };
  list.push(record);
  writeAll(list);
  return id;
}
