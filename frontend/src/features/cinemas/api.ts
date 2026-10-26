/** Lớp API theo chức năng; giao diện gọi qua hook TanStack Query. */
import httpClient from '@/lib/httpClient';
import type { City, Cinema } from './types';

/** Danh sách thành phố */
export const listCitiesApi = () => httpClient.get<City[]>('/cities');

/** Danh sách rạp (lọc theo thành phố) */
export const listCinemasApi = (cityId?: number) =>
  httpClient.get<Cinema[]>('/cinemas', { params: cityId ? { city: cityId } : {} });
