/**
 * API service cho hồ sơ cá nhân.
 */
import httpClient from '@/lib/httpClient';
import type { User, MessageResponse } from './types';

/** Cập nhật hồ sơ */
export const updateProfileApi = (data: {
  fullName: string;
  phone: string;
  dateOfBirth: string | null;
  avatarUrl?: string | null;
}) => httpClient.put<User>('/users/me', data);

/** Đổi mật khẩu */
export const changePasswordApi = (data: { currentPassword: string; newPassword: string }) =>
  httpClient.put<MessageResponse>('/users/me/password', data);
