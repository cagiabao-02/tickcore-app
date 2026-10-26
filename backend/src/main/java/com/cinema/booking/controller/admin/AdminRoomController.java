package com.cinema.booking.controller.admin;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class AdminRoomController {
    private final RoomService service;
    public AdminRoomController(RoomService service) { this.service = service; }

    /** ADMIN: lọc và phân trang rooms. */
    @GetMapping("/admin/rooms")
    public PageResponse<RoomResponse> searchRooms(@ModelAttribute SearchRequest query) {
        return service.searchRooms(query);
    }

    /** ADMIN: tạo rooms, kiểm tra dữ liệu và liên kết. */
    @PostMapping("/admin/rooms")
    public RoomResponse createRoom(@Valid @RequestBody RoomRequest request) {
        return service.createRoom(request);
    }

    /** ADMIN: cập nhật rooms; kiểm tra xung đột nếu là suất chiếu. */
    @PutMapping("/admin/rooms/{id}")
    public RoomResponse updateRoom(@PathVariable("id") Long id, @Valid @RequestBody RoomRequest request) {
        return service.updateRoom(id, request);
    }

    /** ADMIN: xóa rooms, kiểm tra các dữ liệu liên quan. */
    @DeleteMapping("/admin/rooms/{id}")
    public MessageResponse deleteRoom(@PathVariable("id") Long id) {
        return service.deleteRoom(id);
    }

    /** ADMIN: kiểm tra hàng, cột, loại ghế và lưu sơ đồ phòng. */
    @PutMapping("/admin/rooms/{id}/seat-layout")
    public SeatLayoutResponse saveSeatLayout(@PathVariable("id") Long id, @Valid @RequestBody SeatLayoutResponse request) {
        return service.saveSeatLayout(id, request);
    }
}
