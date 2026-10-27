package com.cinema.booking.util;

import java.util.UUID;
import org.springframework.stereotype.Component;

/** Sinh mã công khai khó đoán cho đơn và từng vé; cơ sở dữ liệu vẫn là lớp bảo vệ duy nhất. */
@Component
public class CodeGenerator {
    public String generateBookingCode() {
        return "TC" + UUID.randomUUID().toString().replace("-", "").toUpperCase(java.util.Locale.ROOT);
    }

    public String generateTicketCode() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
