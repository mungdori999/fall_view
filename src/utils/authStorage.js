const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessTokenPayload() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;

  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;

    const base64 = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");

    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const json = new TextDecoder("utf-8").decode(bytes);

    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getMemberName() {
  const name = getAccessTokenPayload()?.name;

  return typeof name === "string" && name.trim() ? name.trim() : "참가자";
}

export function getAccessToken() {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid token");
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    // 화면 복원용 만료 확인이며, 실제 권한 검증은 백엔드가 수행합니다.
    if (typeof exp !== "number" || exp * 1000 <= Date.now()) {
      throw new Error("Expired token");
    }
    return token;
  } catch {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
      /* Storage unavailable */
    }
    return null;
  }
}

export function saveAccessToken(accessToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
