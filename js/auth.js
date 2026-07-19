import {
  getAuth, signInWithCustomToken, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { app } from "./firebase-app.js";
import { AUTH_WORKER_URL, DISCORD_CLIENT_ID } from "./auth-config.js";

const auth = getAuth(app);
const PROFILE_KEY = "recipe-share:profile";

function callbackUrl() {
  // 全ページが同じフォルダにある前提: .../auth-callback.html
  const dir = window.location.pathname.replace(/[^/]*$/, "");
  return window.location.origin + dir + "auth-callback.html";
}

export function loginWithDiscord() {
  const redirectUri = callbackUrl();
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(DISCORD_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
  window.location.href = authUrl;
}

export async function completeDiscordLogin(code) {
  const redirectUri = callbackUrl();
  const res = await fetch(AUTH_WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirectUri })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "login_failed");
  await signInWithCustomToken(auth, data.firebaseToken);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
  return data.profile;
}

export async function logout() {
  await signOut(auth);
  localStorage.removeItem(PROFILE_KEY);
}

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

export function onAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user ? getProfile() : null);
  });
}
