package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ PromotionService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class PromotionService {
    /** USER: kiểm tra hiệu lực, lượt dùng, mức tối thiểu và giảm tối đa. */
    public PromotionValidationResponse validatePromotion(PromotionValidationRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: lọc và phân trang promotions. */
    public PageResponse<PromotionResponse> searchPromotions(SearchRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: tạo promotions, kiểm tra dữ liệu và liên kết. */
    public PromotionResponse createPromotion(PromotionRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: cập nhật promotions; kiểm tra xung đột nếu là suất chiếu. */
    public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: xóa promotions, kiểm tra các dữ liệu liên quan. */
    public MessageResponse deletePromotion(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Tính số tiền giảm nguyên VND, giới hạn mức tối đa và tổng đơn. */
    public Long calculateDiscount(PromotionValidationRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}
