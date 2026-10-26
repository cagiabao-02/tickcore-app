/**
 * Quản lý lưu trữ token JWT (accessToken, refreshToken).
 * Hỗ trợ cả localStorage (ghi nhớ đăng nhập) và sessionStorage.
 */

const ACCESS_TOKEN_KEY = 'tc_access_token';
const REFRESH_TOKEN_KEY = 'tc_refresh_token';
const REMEMBER_ME_KEY = 'tc_remember_me';

/** Lấy storage phù hợp dựa vào lựa chọn "ghi nhớ đăng nhập" */
function getStorage(): Storage {
  const remember = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  return remember ? localStorage : sessionStorage;
}

/** Lưu cặp token sau khi đăng nhập */
export function saveTokens(accessToken: string, refreshToken: string, rememberMe: boolean): void {
  clearTokens();
  localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/** Lấy access token hiện tại */
export function getAccessToken(): string | null {
  return getStorage().getItem(ACCESS_TOKEN_KEY);
}

/** Lấy refresh token hiện tại */
export function getRefreshToken(): string | null {
  return getStorage().getItem(REFRESH_TOKEN_KEY);
}

/** Giữ nguyên lựa chọn lưu phiên khi làm mới token. */
export function remembersSession(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
}

/** Xóa toàn bộ token khi đăng xuất */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** Kiểm tra có token hay không (dùng nhanh cho UI) */
export function hasToken(): boolean {
  return getAccessToken() !== null;
}
