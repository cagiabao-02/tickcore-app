/**
 * Hook đếm ngược thời gian giữ ghế.
 * Nhận expiresAt (ISO string), trả về số giây còn lại và trạng thái hết hạn.
 */
import { useState, useEffect, useCallback } from 'react';

interface CountdownResult {
  /** Số giây còn lại */
  seconds: number;
  /** Phút hiển thị */
  minutes: number;
  /** Giây hiển thị (phần dư sau phút) */
  displaySeconds: number;
  /** Đã hết thời gian chưa */
  isExpired: boolean;
  /** Chuỗi hiển thị "MM:SS" */
  display: string;
}

export function useCountdown(expiresAt: string | null): CountdownResult {
  const calcRemaining = useCallback(() => {
    if (!expiresAt) return 0;
    const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    return diff;
  }, [expiresAt]);

  const [seconds, setSeconds] = useState<number>(calcRemaining);

  useEffect(() => {
    setSeconds(calcRemaining());
    const interval = setInterval(() => {
      const remaining = calcRemaining();
      setSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [calcRemaining]);

  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;

  return {
    seconds,
    minutes,
    displaySeconds,
    isExpired: seconds <= 0,
    display,
  };
}
