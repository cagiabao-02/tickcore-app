package com.cinema.booking.controller;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.ComboService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class ComboController {
    private final ComboService service;
    public ComboController(ComboService service) { this.service = service; }

    /** Công khai: liệt kê combo đang bán. */
    @GetMapping("/combos")
    public List<ComboResponse> listActiveCombos() {
        return service.listActiveCombos();
    }
}
