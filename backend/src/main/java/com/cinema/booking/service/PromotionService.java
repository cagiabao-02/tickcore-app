package com.cinema.booking.service;

import com.cinema.booking.dto.request.PromotionRequest;
import com.cinema.booking.dto.request.PromotionValidationRequest;
import com.cinema.booking.dto.request.SearchRequest;
import com.cinema.booking.dto.response.MessageResponse;
import com.cinema.booking.dto.response.PageResponse;
import com.cinema.booking.dto.response.PromotionResponse;
import com.cinema.booking.dto.response.PromotionValidationResponse;
import com.cinema.booking.entity.Promotion;
import com.cinema.booking.entity.PromotionType;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.BookingRepository;
import com.cinema.booking.repository.PromotionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Kiểm tra mã giảm và quản trị promotion, giữ usedCount do giao dịch booking quản lý. */
@Service
public class PromotionService {
    private final PromotionRepository promotions;
    private final BookingRepository bookings;
    private final ZoneId businessZone;

    public PromotionService(PromotionRepository promotions, BookingRepository bookings,
        @Value("${booking.time-zone:Asia/Ho_Chi_Minh}") String timeZone) {
        this.promotions = promotions;
        this.bookings = bookings;
        this.businessZone = ZoneId.of(timeZone);
    }

    @Transactional(readOnly = true)
    public PromotionValidationResponse validatePromotion(PromotionValidationRequest request) {
        if (request.subtotal() == null || request.subtotal() < 0) {
            return invalid("booking.promoInvalid", null);
        }
        String code = normalizeCode(request.code());
        Promotion promotion = code == null ? null : promotions.findByCodeIgnoreCase(code).orElse(null);
        if (promotion == null) return invalid("booking.promoInvalid", null);
        Instant now = Instant.now();
        if (!promotion.isActive() || now.isBefore(promotion.getStartsAt()) || !now.isBefore(promotion.getEndsAt())
            || (promotion.getUsageLimit() != null && promotion.getUsedCount() >= promotion.getUsageLimit())) {
            return invalid("booking.promoExpired", null);
        }
        if (request.subtotal() < promotion.getMinOrderAmount()) {
            return invalid("booking.promoMinOrder", promotion.getMinOrderAmount());
        }
        long discount = discount(promotion, request.subtotal());
        return new PromotionValidationResponse(true, discount, "booking.promoSuccess", null);
    }

    @Transactional(readOnly = true)
    public PageResponse<PromotionResponse> searchPromotions(SearchRequest query) {
        int page = Math.max(0, query.page() == null ? 0 : query.page());
        int size = Math.min(100, Math.max(1, query.size() == null ? 20 : query.size()));
        Boolean active = parseActive(query.status());
        Page<Promotion> found = promotions.search(trim(query.keyword()), active,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startsAt")));
        return new PageResponse<>(found.getContent().stream().map(this::response).toList(), found.getNumber(),
            found.getSize(), found.getTotalElements(), found.getTotalPages());
    }

    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        Promotion promotion = Promotion.create();
        apply(promotion, request, true);
        try { return response(promotions.saveAndFlush(promotion)); }
        catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new BusinessException(HttpStatus.CONFLICT, "PROMOTION_CODE_EXISTS", "Mã giảm giá đã tồn tại.");
        }
    }

    @Transactional
    public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
        Promotion promotion = promotions.findByIdForUpdate(id)
            .orElseThrow(() -> new NotFoundException("PROMOTION_NOT_FOUND", "Không tìm thấy mã giảm giá."));
        apply(promotion, request, false);
        try { return response(promotions.saveAndFlush(promotion)); }
        catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new BusinessException(HttpStatus.CONFLICT, "PROMOTION_CODE_EXISTS", "Mã giảm giá đã tồn tại.");
        }
    }

    @Transactional
    public MessageResponse deletePromotion(Long id) {
        Promotion promotion = promotions.findByIdForUpdate(id)
            .orElseThrow(() -> new NotFoundException("PROMOTION_NOT_FOUND", "Không tìm thấy mã giảm giá."));
        if (promotion.getUsedCount() > 0 || bookings.existsByPromotionId(id)) {
            promotion.setActive(false);
            promotions.save(promotion);
            return new MessageResponse("Mã giảm giá đã được ngừng sử dụng để giữ lịch sử đơn hàng.");
        }
        promotions.delete(promotion);
        return new MessageResponse("Đã xóa mã giảm giá.");
    }

    @Transactional(readOnly = true)
    public Long calculateDiscount(PromotionValidationRequest request) {
        return validatePromotion(request).discountAmount();
    }

    private void apply(Promotion promotion, PromotionRequest request, boolean creating) {
        String code = normalizeCode(request.code());
        if (code == null) invalidField("code", "Mã giảm giá không được để trống.");
        if (creating) {
            if (promotions.findByCodeIgnoreCase(code).isPresent()) conflictCode();
        } else if (promotions.existsByCodeIgnoreCaseAndIdNot(code, promotion.getId())) conflictCode();
        PromotionType type;
        try { type = PromotionType.valueOf(request.type()); }
        catch (RuntimeException ex) { invalidField("type", "Kiểu giảm giá không hợp lệ."); return; }
        if (request.value() == null || request.value() <= 0
            || (type == PromotionType.PERCENTAGE && request.value() > 100)) {
            invalidField("value", "Giá trị phần trăm từ 1 đến 100; số tiền giảm phải lớn hơn 0.");
        }
        if (request.minOrderAmount() == null || request.minOrderAmount() < 0) invalidField("minOrderAmount", "Đơn tối thiểu phải không âm.");
        if (request.maxDiscount() != null && request.maxDiscount() < 0) invalidField("maxDiscount", "Mức giảm tối đa phải không âm.");
        if (request.usageLimit() != null && request.usageLimit() < promotion.getUsedCount()) {
            invalidField("usageLimit", "Giới hạn lượt không được thấp hơn số lượt đã giữ hoặc sử dụng.");
        }
        LocalDate startDate = parseDate(request.startDate(), "startDate");
        LocalDate endDate = parseDate(request.endDate(), "endDate");
        if (endDate.isBefore(startDate)) invalidField("endDate", "Ngày kết thúc không được trước ngày bắt đầu.");
        promotion.setCode(code);
        promotion.setType(type);
        promotion.setValue(request.value());
        promotion.setMinOrderAmount(request.minOrderAmount());
        promotion.setMaxDiscount(request.maxDiscount());
        promotion.setStartsAt(startDate.atStartOfDay(businessZone).toInstant());
        promotion.setEndsAt(endDate.plusDays(1).atStartOfDay(businessZone).toInstant().minusNanos(1000));
        promotion.setUsageLimit(request.usageLimit());
        if (request.active() != null) promotion.setActive(request.active());
        else if (creating) promotion.setActive(true);
    }

    private long discount(Promotion promotion, long subtotal) {
        long value = promotion.getType() == PromotionType.PERCENTAGE
            ? BigDecimal.valueOf(subtotal).multiply(BigDecimal.valueOf(promotion.getValue()))
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN).longValueExact()
            : promotion.getValue().longValue();
        if (promotion.getMaxDiscount() != null) value = Math.min(value, promotion.getMaxDiscount());
        return Math.min(value, subtotal);
    }

    private PromotionResponse response(Promotion promotion) {
        return new PromotionResponse(promotion.getId(), promotion.getCode(), promotion.getType().name(),
            promotion.getValue(), promotion.getMinOrderAmount(), promotion.getMaxDiscount(),
            promotion.getStartsAt().atZone(businessZone).toLocalDate().toString(),
            promotion.getEndsAt().atZone(businessZone).toLocalDate().toString(), promotion.getUsageLimit(),
            promotion.getUsedCount(), promotion.isActive());
    }
    private PromotionValidationResponse invalid(String message, Long minimum) {
        return new PromotionValidationResponse(false, 0L, message, minimum);
    }
    private LocalDate parseDate(String value, String field) {
        try { return LocalDate.parse(value); }
        catch (RuntimeException ex) { invalidField(field, "Ngày phải theo định dạng YYYY-MM-DD."); return null; }
    }
    private Boolean parseActive(String status) {
        if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) return null;
        if (status.equalsIgnoreCase("ACTIVE") || status.equalsIgnoreCase("true")) return true;
        if (status.equalsIgnoreCase("INACTIVE") || status.equalsIgnoreCase("false")) return false;
        invalidField("status", "Bộ lọc trạng thái không hợp lệ.");
        return null;
    }
    private String normalizeCode(String code) { return code == null || code.isBlank() ? null : code.trim().toUpperCase(Locale.ROOT); }
    private String trim(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private void conflictCode() { throw new BusinessException(HttpStatus.CONFLICT, "PROMOTION_CODE_EXISTS", "Mã giảm giá đã tồn tại."); }
    private void invalidField(String field, String message) {
        throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_PROMOTION_" + field.toUpperCase(Locale.ROOT), message);
    }
}
