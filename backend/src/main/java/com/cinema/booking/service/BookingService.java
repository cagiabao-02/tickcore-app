package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ BookingService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class BookingService {
    /** USER: kiểm tra hold còn hạn, giá combo và điều kiện mã, tạo đơn chờ. */
    public BookingResponse createBooking(CreateBookingRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** USER: lọc vé theo trạng thái và phân trang. */
    public PageResponse<BookingResponse> getMyBookings(SearchRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** USER: chỉ lấy đơn thuộc tài khoản hiện tại. */
    public BookingResponse getBookingDetail(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** USER: chỉ hủy vé của mình khi còn trên 2 giờ trước suất chiếu. */
    public BookingResponse cancelBooking(Long id) {
        // TODO: cho phép chủ đơn hủy PENDING để quay lại sửa; vé CONFIRMED vẫn áp dụng mốc trên 2 giờ.
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: lọc đơn theo ngày, phim, trạng thái. */
    public PageResponse<BookingResponse> searchBookings(SearchRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: hủy đơn và nhả ghế theo quy tắc quản trị. */
    public BookingResponse cancelBookingAsAdmin(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Đổi trạng thái đơn chưa thanh toán hết hạn và nhả ghế. */
    public void expirePendingBookings() {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}
