/**
 * Hook theo dõi sơ đồ ghế theo thời gian thực.
 * Mặc định dùng polling mỗi 5 giây để cập nhật trạng thái ghế.
 * TODO: Thay bằng WebSocket/STOMP khi tích hợp Spring Boot.
 */
import { useQuery } from '@tanstack/react-query';
import type { SeatMap } from '@/types';
import { getSeatMapApi } from '@/features/showtimes/api';

interface UseSeatMapRealtimeOptions {
  /** Bật/tắt polling (tắt khi không ở trang chọn ghế) */
  enabled?: boolean;
  /** Khoảng thời gian polling (ms), mặc định 5000 */
  pollInterval?: number;
}

/**
 * Lấy sơ đồ ghế và tự động cập nhật theo thời gian thực.
 * Khi chuyển sang WebSocket, thay polling bằng subscription:
 * ```
 * const stompClient = useStompClient();
 * stompClient.subscribe(`/topic/showtimes/${showtimeId}/seats`, (msg) => {
 *   queryClient.setQueryData(['seatMap', showtimeId], JSON.parse(msg.body));
 * });
 * ```
 */
export function useSeatMapRealtime(
  showtimeId: number | null,
  options: UseSeatMapRealtimeOptions = {},
) {
  const { enabled = true, pollInterval = 5000 } = options;

  return useQuery<SeatMap>({
    queryKey: ['seatMap', showtimeId],
    queryFn: async () => {
      const response = await getSeatMapApi(showtimeId!);
      return response.data;
    },
    enabled: enabled && showtimeId !== null && showtimeId > 0,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}
