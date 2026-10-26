/**
 * HTTP client dùng Axios cho toàn bộ project.
 * - Tự gắn base URL từ biến môi trường.
 * - Interceptor tự gắn header Authorization.
 * - Gặp 401 thì thử refresh token một lần, thất bại thì đăng xuất.
 * - Chuẩn hóa lỗi thành ApiError.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import i18n from '@/i18n';
import type { ApiError, AuthTokens } from '@/types';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  remembersSession,
} from './tokenStorage';

/** Axios instance duy nhất cho toàn bộ project */
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Cờ đánh dấu đang refresh token, tránh gọi lặp */
let isRefreshing = false;
/** Hàng đợi các request chờ refresh xong */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/** Xử lý hàng đợi sau khi refresh thành công hoặc thất bại */
function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
}

/** Request interceptor: gắn token vào header */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

/** Response interceptor: xử lý 401 và chuẩn hóa lỗi */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Nếu lỗi 401 và chưa thử refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.startsWith('/auth/')
    ) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        handleLogout();
        return Promise.reject(normalizeError(error));
      }
      if (isRefreshing) {
        // Đã có request đang refresh, xếp vào hàng đợi
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest._retry = true;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return httpClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<AuthTokens>(
          `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/refresh`,
          { refreshToken },
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        saveTokens(accessToken, newRefreshToken, remembersSession());
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return httpClient(originalRequest);
      } catch {
        processQueue(normalizeError(error), null);
        handleLogout();
        return Promise.reject(normalizeError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

/** Đăng xuất và chuyển về trang login kèm redirect path */
function handleLogout(): void {
  clearTokens();
  const currentPath = window.location.pathname + window.location.search;
  if (window.location.pathname !== '/login') {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
}

/** Chuẩn hóa mọi lỗi Axios thành dạng ApiError */
function normalizeError(error: AxiosError<ApiError>): ApiError {
  if (error.response?.data?.code) {
    const data = error.response.data;
    return {
      ...data,
      message: i18n.t(`apiErrors.${data.code}`, { defaultValue: i18n.t(data.message) }),
      details: data.details || {},
      timestamp: data.timestamp || new Date().toISOString(),
    };
  }
  if (error.response) {
    return {
      status: error.response.status,
      code: 'UNKNOWN_ERROR',
      message: i18n.t('common.error'),
      timestamp: new Date().toISOString(),
    };
  }
  return {
    status: 0,
    code: 'NETWORK_ERROR',
    message: i18n.t('common.networkError'),
    timestamp: new Date().toISOString(),
  };
}

export default httpClient;
