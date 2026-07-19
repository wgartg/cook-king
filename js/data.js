import { firebaseConfig } from "./firebase-config.js";

export const isLocalMode = !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY";

let impl;
if (isLocalMode) {
  impl = await import("./local-store.js");
} else {
  impl = await import("./firebase-store.js");
}

export const listRecipes = impl.listRecipes;
export const getRecipe = impl.getRecipe;
export const createRecipe = impl.createRecipe;
export const updateRecipe = impl.updateRecipe;
export const deleteRecipe = impl.deleteRecipe;
export const toggleLike = impl.toggleLike;
export const getLocalUserId = impl.getLocalUserId; // ローカルモードのみ有効(undefined in Firebase mode)
