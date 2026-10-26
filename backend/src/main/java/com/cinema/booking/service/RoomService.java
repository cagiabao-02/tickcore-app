package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ RoomService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class RoomService {
    /** ADMIN: lọc và phân trang rooms. */
    public PageResponse<RoomResponse> searchRooms(SearchRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: tạo rooms, kiểm tra dữ liệu và liên kết. */
    public RoomResponse createRoom(RoomRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: cập nhật rooms; kiểm tra xung đột nếu là suất chiếu. */
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: xóa rooms, kiểm tra các dữ liệu liên quan. */
    public MessageResponse deleteRoom(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: kiểm tra hàng, cột, loại ghế và lưu sơ đồ phòng. */
    public SeatLayoutResponse saveSeatLayout(Long id, SeatLayoutResponse request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}
