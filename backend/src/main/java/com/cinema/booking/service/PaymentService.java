package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ PaymentService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class PaymentService {
    /** USER: ghi nhận kết quả giả lập, cập nhật trạng thái đơn; không tích hợp thanh toán thật. */
    public PaymentSimulationResponse simulatePayment(PaymentRequest request) {
        // TODO: chỉ xác nhận sau kết quả mô phỏng được chọn; không dùng nút phía client làm bằng chứng chuyển tiền thật.
        // Khi tích hợp cổng thật, xác minh webhook/chữ ký, số tiền, mã đơn; cập nhật idempotent trong transaction.
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}
