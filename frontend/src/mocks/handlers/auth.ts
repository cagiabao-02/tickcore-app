/**
 * MSW handler cho xác thực (auth).
 * Xử lý: đăng nhập, đăng ký, refresh token, đăng xuất, quên/đặt lại mật khẩu.
 */
import { http, HttpResponse, delay } from 'msw';
import { mockUsers, mockPasswords } from '../data';

/** Tạo mock JWT token */
function createMockToken(userId: number, role: string): string {
  return btoa(JSON.stringify({ userId, role, exp: Date.now() + 3600000 }));
}

/** Lấy user từ mock token */
export function getUserFromToken(authHeader: string | null): (typeof mockUsers)[0] | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(atob(authHeader.replace('Bearer ', ''))) as {
      userId: number;
      exp: number;
    };
    if (!payload.exp || payload.exp <= Date.now()) return null;
    return mockUsers.find((u) => u.id === payload.userId && !u.locked) || null;
  } catch {
    return null;
  }
}

export const authHandlers = [
  // Đăng nhập
  http.post('/api/v1/auth/login', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { email: string; password: string };
    const user = mockUsers.find((u) => u.email === body.email);

    if (!user || mockPasswords[body.email] !== body.password) {
      return HttpResponse.json(
        {
          status: 401,
          code: 'AUTH_FAILED',
          message: 'Email hoặc mật khẩu không đúng',
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      );
    }

    if (user.locked) {
      return HttpResponse.json(
        {
          status: 403,
          code: 'ACCOUNT_LOCKED',
          message: 'Tài khoản đã bị khóa',
          timestamp: new Date().toISOString(),
        },
        { status: 403 },
      );
    }

    return HttpResponse.json({
      accessToken: createMockToken(user.id, user.role),
      refreshToken: createMockToken(user.id, user.role) + '_refresh',
      expiresIn: 3600,
    });
  }),

  // Đăng ký
  http.post('/api/v1/auth/register', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { email: string; fullName: string; password: string };

    if (mockUsers.some((u) => u.email === body.email)) {
      return HttpResponse.json(
        {
          status: 409,
          code: 'EMAIL_EXISTS',
          message: 'Email đã được sử dụng',
          timestamp: new Date().toISOString(),
        },
        { status: 409 },
      );
    }

    mockUsers.push({
      id: Math.max(0, ...mockUsers.map((u) => u.id)) + 1,
      email: body.email,
      fullName: body.fullName,
      phone: null,
      dateOfBirth: null,
      avatarUrl: null,
      role: 'USER',
      locked: false,
      createdAt: new Date().toISOString(),
    });
    mockPasswords[body.email] = body.password;
    return HttpResponse.json({ message: 'Đăng ký thành công' }, { status: 201 });
  }),

  // Refresh token
  http.post('/api/v1/auth/refresh', async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { refreshToken: string };
    try {
      const payload = JSON.parse(atob(body.refreshToken.replace('_refresh', ''))) as {
        userId: number;
      };
      const user = mockUsers.find((u) => u.id === payload.userId);
      if (!user || user.locked || !body.refreshToken.endsWith('_refresh'))
        throw new Error('Invalid');
      return HttpResponse.json({
        accessToken: createMockToken(user.id, user.role),
        refreshToken: createMockToken(user.id, user.role) + '_refresh',
        expiresIn: 3600,
      });
    } catch {
      return HttpResponse.json(
        {
          status: 401,
          code: 'INVALID_TOKEN',
          message: 'Token không hợp lệ',
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      );
    }
  }),

  // Đăng xuất
  http.post('/api/v1/auth/logout', async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Đã đăng xuất' });
  }),

  // Quên mật khẩu
  http.post('/api/v1/auth/forgot-password', async () => {
    await delay(800);
    return HttpResponse.json({ message: 'Đã gửi email hướng dẫn đặt lại mật khẩu' });
  }),

  // Đặt lại mật khẩu
  http.post('/api/v1/auth/reset-password', async () => {
    await delay(500);
    return HttpResponse.json({ message: 'Đặt lại mật khẩu thành công' });
  }),
];
