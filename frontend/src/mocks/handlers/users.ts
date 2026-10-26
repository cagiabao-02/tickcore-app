/**
 * MSW handler cho người dùng (user profile).
 */
import { http, HttpResponse, delay } from 'msw';
import { mockPasswords } from '../data';
import { mockError } from '../validation';
import { getUserFromToken } from './auth';

export const userHandlers = [
  // Lấy thông tin người dùng hiện tại
  http.get('/api/v1/users/me', async ({ request }) => {
    await delay(300);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user) {
      return HttpResponse.json(
        {
          status: 401,
          code: 'UNAUTHORIZED',
          message: 'Chưa đăng nhập',
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      );
    }
    return HttpResponse.json(user);
  }),

  // Cập nhật hồ sơ
  http.put('/api/v1/users/me', async ({ request }) => {
    await delay(400);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );

    const body = (await request.json()) as Pick<
      typeof user,
      'fullName' | 'phone' | 'dateOfBirth' | 'avatarUrl'
    >;
    user.fullName = body.fullName;
    user.phone = body.phone;
    user.dateOfBirth = body.dateOfBirth;
    if (body.avatarUrl !== undefined) user.avatarUrl = body.avatarUrl;
    return HttpResponse.json(user);
  }),

  // Đổi mật khẩu
  http.put('/api/v1/users/me/password', async ({ request }) => {
    await delay(400);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );
    const body = (await request.json()) as { currentPassword: string; newPassword: string };
    if (mockPasswords[user.email] !== body.currentPassword)
      return mockError(400, 'INVALID_PASSWORD', 'Mật khẩu hiện tại không đúng');
    if (body.newPassword.length < 6)
      return mockError(400, 'INVALID_PASSWORD', 'Mật khẩu phải có ít nhất 6 ký tự');
    mockPasswords[user.email] = body.newPassword;
    return HttpResponse.json({ message: 'Đổi mật khẩu thành công' });
  }),
];
