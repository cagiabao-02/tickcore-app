package com.cinema.booking.controller;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class PaymentController {
    private final PaymentService service;
    public PaymentController(PaymentService service) { this.service = service; }

    /** USER: ghi nhận kết quả giả lập, cập nhật trạng thái đơn; không tích hợp thanh toán thật. */
    @PostMapping("/payments/simulate")
    public PaymentSimulationResponse simulatePayment(@Valid @RequestBody PaymentRequest request) {
        return service.simulatePayment(request);
    }
}
