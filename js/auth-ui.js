import { isLocalMode } from "./data.js";

export async function mountAuthArea() {
  const area = document.getElementById("auth-area");
  if (!area) return;

  if (isLocalMode) {
    area.innerHTML = `<span style="font-size:.72rem; color:var(--text-muted); font-family:var(--mono);">local-mode(ログイン無効)</span>`;
    return { profile: null };
  }

  const { onAuth, loginWithDiscord, logout, getProfile } = await import("./auth.js");

  function render(profile) {
    if (profile) {
      area.innerHTML = `
        <div style="display:flex; align-items:center; gap:.5rem;">
          <img src="${profile.avatarUrl}" alt="" style="width:24px;height:24px;border-radius:50%;">
          <span style="font-size:.8rem;">${profile.username}</span>
          ${profile.isAdmin ? '<a href="admin.html" class="btn" style="padding:.3rem .7rem;">🛡 Admin</a>' : ""}
          <button id="logout-btn" class="btn" style="padding:.3rem .7rem;">Logout</button>
        </div>`;
      document.getElementById("logout-btn").addEventListener("click", async () => {
        await logout();
        window.location.reload();
      });
    } else {
      area.innerHTML = `<button id="login-btn" class="btn btn-primary">Discordでログイン</button>`;
      document.getElementById("login-btn").addEventListener("click", loginWithDiscord);
    }
  }

  render(getProfile());
  onAuth(render);
  return { profile: getProfile() };
}
