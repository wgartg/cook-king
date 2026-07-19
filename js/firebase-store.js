import {
  getFirestore, collection, addDoc, getDocs, doc, getDoc, deleteDoc, updateDoc,
  serverTimestamp, orderBy, query, limit, arrayUnion, arrayRemove, increment
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { app } from "./firebase-app.js";

const db = getFirestore(app);

// 画像はFirebase Storage(要Blazeプラン/カード登録)を使わず、
// 圧縮したBase64文字列としてFirestoreドキュメントに直接保存する。
// (Firestoreは無料枠のままStorageを使わずに写真付きレシピを保存できる)

export async function listRecipes() {
  const q = query(collection(db, "recipes"), orderBy("createdAt", "desc"), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getRecipe(id) {
  const snap = await getDoc(doc(db, "recipes", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createRecipe(fields) {
  const docRef = await addDoc(collection(db, "recipes"), {
    ...fields,
    likedBy: [],
    likesCount: 0,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateRecipe(id, fields) {
  await updateDoc(doc(db, "recipes", id), { ...fields });
}

export async function deleteRecipe(id) {
  await deleteDoc(doc(db, "recipes", id));
}

export async function toggleLike(id, uid, isLiked) {
  await updateDoc(doc(db, "recipes", id), {
    likedBy: isLiked ? arrayRemove(uid) : arrayUnion(uid),
    likesCount: increment(isLiked ? -1 : 1)
  });
}
