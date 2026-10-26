/**
 * Hook debounce giá trị - trì hoãn cập nhật giá trị đầu vào.
 * Dùng cho tìm kiếm, tránh gọi API liên tục khi gõ.
 */
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
