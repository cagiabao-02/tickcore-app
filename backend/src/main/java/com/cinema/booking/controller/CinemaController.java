package com.cinema.booking.controller;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.CinemaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class CinemaController {
    private final CinemaService service;
    public CinemaController(CinemaService service) { this.service = service; }

    /** Công khai: liệt kê thành phố có rạp. */
    @GetMapping("/cities")
    public List<CityResponse> listCities() {
        return service.listCities();
    }

    /** Công khai: lọc rạp theo thành phố. */
    @GetMapping("/cinemas")
    public List<CinemaResponse> listCinemas(@RequestParam(value = "city", required = false) Long city) {
        return service.listCinemas(city);
    }

    /** Công khai: lấy chi tiết rạp. */
    @GetMapping("/cinemas/{id}")
    public CinemaResponse getCinema(@PathVariable("id") Long id) {
        return service.getCinema(id);
    }
}
