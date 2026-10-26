package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ ComboService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class ComboService {
    /** Công khai: liệt kê combo đang bán. */
    public List<ComboResponse> listActiveCombos() {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: lọc và phân trang combos. */
    public PageResponse<ComboResponse> searchCombos(SearchRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: tạo combos, kiểm tra dữ liệu và liên kết. */
    public ComboResponse createCombo(ComboRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: cập nhật combos; kiểm tra xung đột nếu là suất chiếu. */
    public ComboResponse updateCombo(Long id, ComboRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: xóa combos, kiểm tra các dữ liệu liên quan. */
    public MessageResponse deleteCombo(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}
