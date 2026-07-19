import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
