/**
 * Tổng hợp tất cả MSW handler cho trình duyệt.
 */
import { authHandlers } from './auth';
import { userHandlers } from './users';
import { movieHandlers } from './movies';
import { showtimeHandlers } from './showtimes';
import { bookingHandlers } from './bookings';
import { comboHandlers, promotionHandlers, reviewHandlers } from './extras';
import { adminHandlers } from './admin';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...movieHandlers,
  ...showtimeHandlers,
  ...bookingHandlers,
  ...comboHandlers,
  ...promotionHandlers,
  ...reviewHandlers,
  ...adminHandlers,
];
