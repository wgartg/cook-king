// Firebase未設定時のフォールバック。ブラウザのlocalStorageをDB代わりに使う。
// 本番用ではないが、Firebaseの設定前にUI/動作をそのまま確認できる。

const KEY = "recipe-share:recipes";
const DEVICE_KEY = "recipe-share:local-device-id";

export function getLocalUserId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = "local-" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

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
  const record = { id, likedBy: [], likesCount: 0, bookmarkedBy: [], comments: [], ...fields, createdAt: Date.now() };
  list.push(record);
  writeAll(list);
  return id;
}

export async function updateRecipe(id, fields) {
  const list = readAll();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...fields };
  writeAll(list);
}

export async function deleteRecipe(id) {
  writeAll(readAll().filter(r => r.id !== id));
}

export async function toggleLike(id, uid, isLiked) {
  const list = readAll();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return;
  const likedBy = new Set(list[idx].likedBy || []);
  if (isLiked) likedBy.delete(uid); else likedBy.add(uid);
  list[idx].likedBy = [...likedBy];
  list[idx].likesCount = likedBy.size;
  writeAll(list);
}

export async function toggleBookmark(id, uid, isBookmarked) {
  const list = readAll();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return;
  const set = new Set(list[idx].bookmarkedBy || []);
  if (isBookmarked) set.delete(uid); else set.add(uid);
  list[idx].bookmarkedBy = [...set];
  writeAll(list);
}

export async function listComments(recipeId) {
  const r = readAll().find(x => x.id === recipeId);
  return (r && r.comments) || [];
}

export async function addComment(recipeId, fields) {
  const list = readAll();
  const idx = list.findIndex(r => r.id === recipeId);
  if (idx === -1) return;
  const id = "c_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const comment = { id, ...fields, createdAt: Date.now() };
  list[idx].comments = [...(list[idx].comments || []), comment];
  writeAll(list);
  return id;
}

export async function deleteComment(recipeId, commentId) {
  const list = readAll();
  const idx = list.findIndex(r => r.id === recipeId);
  if (idx === -1) return;
  list[idx].comments = (list[idx].comments || []).filter(c => c.id !== commentId);
  writeAll(list);
}
