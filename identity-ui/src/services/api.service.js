import TokenService from "./token.service";
import { API_BASE } from "../config";

let isRefreshing = false;
let pendingQueue = [];

async function apiRequest(endpoint, options = {}) {
  const doRequest = async (token) =>
    fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  let token = TokenService.getAccess();
  let res = await doRequest(token);

  // 401 → thử refresh
  if (res.status === 401 && TokenService.getRefresh()) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Backend: RefreshRequest { refreshToken }
          body: JSON.stringify({ refreshToken: TokenService.getRefresh() }),
        });
        if (!refreshRes.ok) throw new Error("Refresh failed");
        const data = await refreshRes.json();
        // Backend: AuthenticationResponse { accessToken, refreshToken, ... }
        const newAccess  = data.result?.accessToken;
        const newRefresh = data.result?.refreshToken;
        TokenService.setTokens(newAccess, newRefresh);
        token = newAccess;
        pendingQueue.forEach((cb) => cb(token));
        pendingQueue = [];
      } catch {
        TokenService.clear();
        window.dispatchEvent(new Event("auth:logout"));
        return res;
      } finally {
        isRefreshing = false;
      }
    } else {
      await new Promise((resolve) => pendingQueue.push(resolve));
      token = TokenService.getAccess();
    }
    res = await doRequest(token);
  }

  return res;
}

export default apiRequest;