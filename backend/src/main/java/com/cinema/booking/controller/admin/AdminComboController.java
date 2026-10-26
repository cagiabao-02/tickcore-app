package com.cinema.booking.controller.admin;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.ComboService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class AdminComboController {
    private final ComboService service;
    public AdminComboController(ComboService service) { this.service = service; }

    /** ADMIN: lọc và phân trang combos. */
    @GetMapping("/admin/combos")
    public PageResponse<ComboResponse> searchCombos(@ModelAttribute SearchRequest query) {
        return service.searchCombos(query);
    }

    /** ADMIN: tạo combos, kiểm tra dữ liệu và liên kết. */
    @PostMapping("/admin/combos")
    public ComboResponse createCombo(@Valid @RequestBody ComboRequest request) {
        return service.createCombo(request);
    }

    /** ADMIN: cập nhật combos; kiểm tra xung đột nếu là suất chiếu. */
    @PutMapping("/admin/combos/{id}")
    public ComboResponse updateCombo(@PathVariable("id") Long id, @Valid @RequestBody ComboRequest request) {
        return service.updateCombo(id, request);
    }

    /** ADMIN: xóa combos, kiểm tra các dữ liệu liên quan. */
    @DeleteMapping("/admin/combos/{id}")
    public MessageResponse deleteCombo(@PathVariable("id") Long id) {
        return service.deleteCombo(id);
    }
}
