import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, getDoc,
  serverTimestamp, orderBy, query, limit
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
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
    createdAt: serverTimestamp()
  });
  return docRef.id;
}
