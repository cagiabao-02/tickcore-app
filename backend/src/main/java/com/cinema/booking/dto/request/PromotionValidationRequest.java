package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số PromotionValidationRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record PromotionValidationRequest(
    String code,
    Long subtotal
) {}
