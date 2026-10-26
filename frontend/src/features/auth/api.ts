/**
 * API service cho xác thực (auth).
 * Gọi các endpoint: đăng nhập, đăng ký, refresh, quên/đặt lại mật khẩu.
 */
import httpClient from '@/lib/httpClient';
import type { AuthTokens, User, MessageResponse } from './types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  fullName: string;
  password: string;
}

/** Đăng nhập */
export const loginApi = (data: LoginPayload) => httpClient.post<AuthTokens>('/auth/login', data);

/** Đăng ký */
export const registerApi = (data: RegisterPayload) =>
  httpClient.post<{ message: string }>('/auth/register', data);

/** Refresh token */
export const refreshTokenApi = (refreshToken: string) =>
  httpClient.post<AuthTokens>('/auth/refresh', { refreshToken });

/** Đăng xuất */
export const logoutApi = () => httpClient.post<MessageResponse>('/auth/logout');

/** Quên mật khẩu */
export const forgotPasswordApi = (email: string) =>
  httpClient.post<MessageResponse>('/auth/forgot-password', { email });

/** Đặt lại mật khẩu */
export const resetPasswordApi = (token: string, password: string) =>
  httpClient.post<MessageResponse>('/auth/reset-password', { token, password });

/** Lấy thông tin người dùng hiện tại */
export const getMeApi = () => httpClient.get<User>('/users/me');
