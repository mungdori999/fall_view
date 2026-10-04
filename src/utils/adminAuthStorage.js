const ADMIN_TOKEN_KEY = "adminAccessToken";

// 화면 복원용 확인입니다. 실제 서명과 관리자 권한은 서버가 검증합니다.
export function isAdminToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const { role, exp } = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return role === "ADMIN" && typeof exp === "number" && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getAdminToken() {
  try {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (isAdminToken(token)) return token;
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch { /* Storage unavailable */ }
  return null;
}

export function saveAdminToken(token) {
  if (!isAdminToken(token)) throw new Error("Invalid admin token");
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}
