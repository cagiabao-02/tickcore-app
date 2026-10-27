package com.cinema.booking.service;

import com.cinema.booking.dto.request.CinemaRequest;
import com.cinema.booking.dto.request.SearchRequest;
import com.cinema.booking.dto.response.CinemaResponse;
import com.cinema.booking.dto.response.CityResponse;
import com.cinema.booking.dto.response.MessageResponse;
import com.cinema.booking.dto.response.PageResponse;
import com.cinema.booking.entity.Cinema;
import com.cinema.booking.entity.City;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.CinemaRepository;
import com.cinema.booking.repository.CityRepository;
import com.cinema.booking.repository.RoomRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CinemaService {
    private final CinemaRepository cinemas;
    private final CityRepository cities;
    private final RoomRepository rooms;

    public CinemaService(CinemaRepository cinemas, CityRepository cities, RoomRepository rooms) {
        this.cinemas = cinemas;
        this.cities = cities;
        this.rooms = rooms;
    }

    @Transactional(readOnly = true)
    public List<CityResponse> listCities() {
        return cities.findAll(Sort.by(Sort.Direction.ASC, "name")).stream().map(this::cityResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CinemaResponse> listCinemas(Long city) {
        if (city != null && !cities.existsById(city)) throw new NotFoundException("CITY_NOT_FOUND", "Không tìm thấy thành phố.");
        List<Cinema> found = city == null ? cinemas.findAll(Sort.by("name")) : cinemas.findByCityIdOrderByNameAsc(city);
        return found.stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public CinemaResponse getCinema(Long id) { return response(findCinema(id)); }

    @Transactional(readOnly = true)
    public PageResponse<CinemaResponse> searchCinemas(SearchRequest query) {
        int page = Math.max(0, query.page() == null ? 0 : query.page());
        int size = Math.min(100, Math.max(1, query.size() == null ? 20 : query.size()));
        Page<Cinema> found = cinemas.search(null, trim(query.keyword()), PageRequest.of(page, size, Sort.by("name")));
        return new PageResponse<>(found.getContent().stream().map(this::response).toList(), found.getNumber(),
            found.getSize(), found.getTotalElements(), found.getTotalPages());
    }

    @Transactional
    public CinemaResponse createCinema(CinemaRequest request) {
        Cinema cinema = Cinema.create();
        apply(cinema, request);
        return response(cinemas.saveAndFlush(cinema));
    }

    @Transactional
    public CinemaResponse updateCinema(Long id, CinemaRequest request) {
        Cinema cinema = findCinema(id);
        apply(cinema, request);
        return response(cinemas.saveAndFlush(cinema));
    }

    @Transactional
    public MessageResponse deleteCinema(Long id) {
        Cinema cinema = findCinema(id);
        if (rooms.countByCinemaId(id) > 0) throw new BusinessException(HttpStatus.CONFLICT, "CINEMA_IN_USE",
            "Rạp còn phòng chiếu. Hãy xử lý phòng trước khi xóa.");
        cinemas.delete(cinema);
        return new MessageResponse("Đã xóa rạp.");
    }

    private void apply(Cinema cinema, CinemaRequest request) {
        String name = required(request.name(), "name");
        String address = required(request.address(), "address");
        if (request.city() == null || request.city().id() == null) invalid("city", "Cần chọn thành phố.");
        City city = cities.findById(request.city().id()).orElseThrow(() ->
            new NotFoundException("CITY_NOT_FOUND", "Không tìm thấy thành phố."));
        cinema.setCityId(city.getId());
        cinema.setName(name);
        cinema.setAddress(address);
        cinema.setPhone(trim(request.phone()));
    }

    private CinemaResponse response(Cinema cinema) {
        City city = cities.findById(cinema.getCityId()).orElseThrow(() -> new NotFoundException("CITY_NOT_FOUND", "Không tìm thấy thành phố."));
        return new CinemaResponse(cinema.getId(), cinema.getName(), cityResponse(city), cinema.getAddress(), cinema.getPhone(),
            Math.toIntExact(rooms.countByCinemaId(cinema.getId())));
    }
    private CityResponse cityResponse(City city) { return new CityResponse(city.getId(), city.getName(), city.getSlug()); }
    private Cinema findCinema(Long id) {
        return cinemas.findById(id).orElseThrow(() -> new NotFoundException("CINEMA_NOT_FOUND", "Không tìm thấy rạp."));
    }
    private String required(String value, String field) {
        String result = trim(value);
        if (result == null) invalid(field, "Trường này không được để trống.");
        return result;
    }
    private String trim(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private void invalid(String field, String message) {
        throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_CINEMA_" + field.toUpperCase(Locale.ROOT), message);
    }
}
