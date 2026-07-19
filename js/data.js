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
