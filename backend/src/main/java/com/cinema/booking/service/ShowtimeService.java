package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ ShowtimeService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class ShowtimeService {
    /** Công khai: lấy lịch chiếu theo phim, rạp và ngày. */
    public List<ShowtimeResponse> searchShowtimes(ShowtimeSearchRequest query) {
        // TODO: chủ dự án tự cài đặt.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
    /** ADMIN: lọc và phân trang showtimes. */
    public PageResponse<ShowtimeResponse> searchShowtimes(SearchRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Công khai: lấy thông tin suất chiếu. */
    public ShowtimeResponse getShowtime(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Công khai: lấy ghế cùng trạng thái và giá theo cấu hình. */
    public SeatMapResponse getSeatMap(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: tạo showtimes, kiểm tra dữ liệu và liên kết. */
    public ShowtimeResponse createShowtime(ShowtimeRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: cập nhật showtimes; kiểm tra xung đột nếu là suất chiếu. */
    public ShowtimeResponse updateShowtime(Long id, ShowtimeRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: xóa showtimes, kiểm tra các dữ liệu liên quan. */
    public MessageResponse deleteShowtime(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: API bổ sung cho yêu cầu giá vé chưa có trong bảng hợp đồng gốc. */
    public List<TicketPricingResponse> getPricing() {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: lưu giá ghế, phụ thu định dạng và cuối tuần. */
    public List<TicketPricingResponse> savePricing(List<TicketPricingResponse> request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Tính giá theo loại ghế, định dạng và cuối tuần. */
    public Long calculatePrice(Long showtimeId, String seatType) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Kiểm tra khoảng giờ giao nhau trong cùng phòng, kể cả khi sửa suất chiếu. */
    public Boolean checkRoomConflict(ShowtimeRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}
