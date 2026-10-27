package com.cinema.booking.service;

import com.cinema.booking.dto.request.ComboRequest;
import com.cinema.booking.dto.request.SearchRequest;
import com.cinema.booking.dto.response.ComboResponse;
import com.cinema.booking.dto.response.MessageResponse;
import com.cinema.booking.dto.response.PageResponse;
import com.cinema.booking.entity.Combo;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.BookingComboRepository;
import com.cinema.booking.repository.ComboRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Nghiệp vụ danh mục combo và snapshot giá được BookingService ghi khi tạo đơn. */
@Service
public class ComboService {
    private final ComboRepository combos;
    private final BookingComboRepository bookingCombos;

    public ComboService(ComboRepository combos, BookingComboRepository bookingCombos) {
        this.combos = combos;
        this.bookingCombos = bookingCombos;
    }

    @Transactional(readOnly = true)
    public List<ComboResponse> listActiveCombos() {
        return combos.findByActiveTrueOrderByNameAsc().stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ComboResponse> searchCombos(SearchRequest query) {
        int page = Math.max(0, query.page() == null ? 0 : query.page());
        int size = Math.min(100, Math.max(1, query.size() == null ? 20 : query.size()));
        Page<Combo> found = combos.search(trim(query.keyword()), PageRequest.of(page, size, Sort.by("name")));
        return new PageResponse<>(found.getContent().stream().map(this::response).toList(), found.getNumber(),
            found.getSize(), found.getTotalElements(), found.getTotalPages());
    }

    @Transactional
    public ComboResponse createCombo(ComboRequest request) {
        Combo combo = Combo.create();
        apply(combo, request, true);
        return response(combos.saveAndFlush(combo));
    }

    @Transactional
    public ComboResponse updateCombo(Long id, ComboRequest request) {
        Combo combo = combos.findByIdForUpdate(id).orElseThrow(() -> new NotFoundException("COMBO_NOT_FOUND", "Không tìm thấy combo."));
        apply(combo, request, false);
        return response(combos.saveAndFlush(combo));
    }

    @Transactional
    public MessageResponse deleteCombo(Long id) {
        Combo combo = combos.findByIdForUpdate(id).orElseThrow(() -> new NotFoundException("COMBO_NOT_FOUND", "Không tìm thấy combo."));
        if (bookingCombos.existsByComboId(id)) {
            combo.setActive(false);
            combos.save(combo);
            return new MessageResponse("Combo đã được ngừng bán để giữ lịch sử đơn hàng.");
        }
        combos.delete(combo);
        return new MessageResponse("Đã xóa combo.");
    }

    private void apply(Combo combo, ComboRequest request, boolean creating) {
        String name = trim(request.name());
        if (name == null) invalid("name", "Tên combo không được để trống.");
        if (request.price() == null || request.price() < 0) invalid("price", "Giá combo phải là số nguyên không âm.");
        combo.setName(name);
        combo.setDescription(trim(request.description()));
        combo.setImageUrl(trim(request.imageUrl()));
        combo.setPrice(request.price());
        if (request.active() != null) combo.setActive(request.active());
        else if (creating) combo.setActive(true);
    }

    private ComboResponse response(Combo combo) {
        return new ComboResponse(combo.getId(), combo.getName(), combo.getDescription(), combo.getImageUrl(), combo.getPrice(), combo.isActive());
    }
    private Combo findCombo(Long id) {
        return combos.findById(id).orElseThrow(() -> new NotFoundException("COMBO_NOT_FOUND", "Không tìm thấy combo."));
    }
    private String trim(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private void invalid(String field, String message) {
        throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_COMBO_" + field.toUpperCase(), message);
    }
}
