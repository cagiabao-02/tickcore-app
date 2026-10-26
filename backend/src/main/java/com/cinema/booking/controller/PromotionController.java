package com.cinema.booking.controller;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class PromotionController {
    private final PromotionService service;
    public PromotionController(PromotionService service) { this.service = service; }

    /** USER: kiểm tra hiệu lực, lượt dùng, mức tối thiểu và giảm tối đa. */
    @PostMapping("/promotions/validate")
    public PromotionValidationResponse validatePromotion(@Valid @RequestBody PromotionValidationRequest request) {
        return service.validatePromotion(request);
    }
}
