package com.cinema.booking.controller.admin;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class AdminPromotionController {
    private final PromotionService service;
    public AdminPromotionController(PromotionService service) { this.service = service; }

    /** ADMIN: lọc và phân trang promotions. */
    @GetMapping("/admin/promotions")
    public PageResponse<PromotionResponse> searchPromotions(@ModelAttribute SearchRequest query) {
        return service.searchPromotions(query);
    }

    /** ADMIN: tạo promotions, kiểm tra dữ liệu và liên kết. */
    @PostMapping("/admin/promotions")
    public PromotionResponse createPromotion(@Valid @RequestBody PromotionRequest request) {
        return service.createPromotion(request);
    }

    /** ADMIN: cập nhật promotions; kiểm tra xung đột nếu là suất chiếu. */
    @PutMapping("/admin/promotions/{id}")
    public PromotionResponse updatePromotion(@PathVariable("id") Long id, @Valid @RequestBody PromotionRequest request) {
        return service.updatePromotion(id, request);
    }

    /** ADMIN: xóa promotions, kiểm tra các dữ liệu liên quan. */
    @DeleteMapping("/admin/promotions/{id}")
    public MessageResponse deletePromotion(@PathVariable("id") Long id) {
        return service.deletePromotion(id);
    }
}
