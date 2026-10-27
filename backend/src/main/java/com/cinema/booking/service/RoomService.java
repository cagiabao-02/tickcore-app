package com.cinema.booking.service;

import com.cinema.booking.dto.request.RoomRequest;
import com.cinema.booking.dto.request.SearchRequest;
import com.cinema.booking.dto.response.MessageResponse;
import com.cinema.booking.dto.response.PageResponse;
import com.cinema.booking.dto.response.RoomResponse;
import com.cinema.booking.dto.response.SeatLayoutResponse;
import com.cinema.booking.dto.response.SeatLayoutResponseSeatsItem;
import com.cinema.booking.entity.Cinema;
import com.cinema.booking.entity.Room;
import com.cinema.booking.entity.Seat;
import com.cinema.booking.entity.SeatType;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.BookingSeatRepository;
import com.cinema.booking.repository.CinemaRepository;
import com.cinema.booking.repository.RoomRepository;
import com.cinema.booking.repository.SeatAllocationRepository;
import com.cinema.booking.repository.SeatRepository;
import com.cinema.booking.repository.ShowtimeRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** CRUD phòng và sơ đồ ghế; ghế lịch sử được lưu lại thay vì xóa. */
@Service
public class RoomService {
    private final RoomRepository rooms;
    private final CinemaRepository cinemas;
    private final SeatRepository seats;
    private final SeatAllocationRepository allocations;
    private final BookingSeatRepository bookingSeats;
    private final ShowtimeRepository showtimes;

    public RoomService(RoomRepository rooms, CinemaRepository cinemas, SeatRepository seats,
        SeatAllocationRepository allocations, BookingSeatRepository bookingSeats, ShowtimeRepository showtimes) {
        this.rooms = rooms;
        this.cinemas = cinemas;
        this.seats = seats;
        this.allocations = allocations;
        this.bookingSeats = bookingSeats;
        this.showtimes = showtimes;
    }

    @Transactional(readOnly = true)
    public PageResponse<RoomResponse> searchRooms(SearchRequest query) {
        int page = Math.max(0, query.page() == null ? 0 : query.page());
        int size = Math.min(100, Math.max(1, query.size() == null ? 20 : query.size()));
        Page<Room> found = rooms.search(query.cinemaId(), trim(query.keyword()), PageRequest.of(page, size, Sort.by("name")));
        return new PageResponse<>(found.getContent().stream().map(this::response).toList(), found.getNumber(),
            found.getSize(), found.getTotalElements(), found.getTotalPages());
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Room room = Room.create();
        apply(room, request, true);
        room = rooms.saveAndFlush(room);
        List<Seat> initialSeats = new ArrayList<>();
        for (int row = 0; row < room.getTotalRows(); row++)
            for (int column = 1; column <= room.getTotalColumns(); column++)
                initialSeats.add(Seat.create(room.getId(), rowLabel(row), column, SeatType.STANDARD));
        seats.saveAll(initialSeats);
        return response(room);
    }

    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = rooms.findByIdForUpdate(id)
            .orElseThrow(() -> new NotFoundException("ROOM_NOT_FOUND", "Không tìm thấy phòng."));
        Long previousCinemaId = room.getCinemaId();
        int previousRows = room.getTotalRows();
        int previousColumns = room.getTotalColumns();
        apply(room, request, false);
        if (!room.getCinemaId().equals(previousCinemaId) && showtimes.existsByRoomId(id)) {
            throw new BusinessException(HttpStatus.CONFLICT, "ROOM_HAS_SHOWTIME_HISTORY",
                "Không thể chuyển phòng sang rạp khác sau khi đã có lịch sử suất chiếu.");
        }
        room = rooms.saveAndFlush(room);
        if (room.getTotalRows() != previousRows || room.getTotalColumns() != previousColumns) {
            reconcileLayout(room, resizedLayout(room));
        }
        return response(room);
    }

    @Transactional
    public MessageResponse deleteRoom(Long id) {
        Room room = rooms.findByIdForUpdate(id)
            .orElseThrow(() -> new NotFoundException("ROOM_NOT_FOUND", "Không tìm thấy phòng."));
        if (showtimes.existsByRoomId(id)) throw new BusinessException(HttpStatus.CONFLICT, "ROOM_IN_USE",
            "Phòng đã có lịch sử suất chiếu nên không thể xóa.");
        List<Seat> roomSeats = seats.findByRoomIdOrderByRowLabelAscSeatNumberAsc(id);
        if (roomSeats.stream().anyMatch(seat -> allocations.existsBySeatId(seat.getId()) || bookingSeats.existsBySeatId(seat.getId())))
            throw new BusinessException(HttpStatus.CONFLICT, "ROOM_HAS_TICKET_HISTORY", "Phòng còn dữ liệu vé và không thể xóa.");
        seats.deleteAll(roomSeats);
        rooms.delete(room);
        return new MessageResponse("Đã xóa phòng.");
    }

    @Transactional
    public SeatLayoutResponse saveSeatLayout(Long id, SeatLayoutResponse request) {
        Room room = rooms.findByIdForUpdate(id)
            .orElseThrow(() -> new NotFoundException("ROOM_NOT_FOUND", "Không tìm thấy phòng."));
        reconcileLayout(room, request);
        return layout(room);
    }

    private void apply(Room room, RoomRequest request, boolean creating) {
        String name = required(request.name(), "name");
        if (request.cinemaId() == null) invalid("cinemaId", "Cần chọn rạp.");
        Cinema cinema = cinemas.findById(request.cinemaId()).orElseThrow(() -> new NotFoundException("CINEMA_NOT_FOUND", "Không tìm thấy rạp."));
        int rows = request.totalRows() == null ? 0 : request.totalRows();
        int columns = request.totalColumns() == null ? 0 : request.totalColumns();
        validateDimensions(rows, columns);
        boolean duplicate = creating ? rooms.existsByCinemaIdAndNameIgnoreCase(cinema.getId(), name)
            : rooms.existsByCinemaIdAndNameIgnoreCaseAndIdNot(cinema.getId(), name, room.getId());
        if (duplicate) throw new BusinessException(HttpStatus.CONFLICT, "ROOM_NAME_EXISTS", "Tên phòng đã tồn tại trong rạp.");
        room.setCinemaId(cinema.getId());
        room.setName(name);
        room.setTotalRows(rows);
        room.setTotalColumns(columns);
    }

    private void reconcileLayout(Room room, SeatLayoutResponse request) {
        validateDimensions(request.rows() == null ? 0 : request.rows(), request.columns() == null ? 0 : request.columns());
        if (request.rows() != room.getTotalRows() || request.columns() != room.getTotalColumns()) invalid("seatLayout", "Kích thước sơ đồ phải khớp kích thước phòng.");
        if (request.seats() == null || request.seats().size() != request.rows() * request.columns()) invalid("seatLayout", "Sơ đồ cần khai báo đủ một ô cho mỗi hàng và cột.");
        Map<String, SeatType> desired = new HashMap<>();
        for (SeatLayoutResponseSeatsItem item : request.seats()) {
            if (item == null || item.row() == null || item.column() == null || item.column() < 1 || item.column() > request.columns()) invalid("seatLayout", "Vị trí ghế không hợp lệ.");
            int rowIndex = rowIndex(item.row());
            if (rowIndex < 0 || rowIndex >= request.rows()) invalid("seatLayout", "Hàng ghế không hợp lệ.");
            SeatType type;
            try { type = SeatType.valueOf(item.type().toUpperCase(Locale.ROOT)); }
            catch (RuntimeException ex) { invalid("seatLayout", "Loại ghế không hợp lệ."); return; }
            String key = key(item.row(), item.column());
            if (desired.putIfAbsent(key, type) != null) invalid("seatLayout", "Sơ đồ có vị trí ghế bị lặp.");
        }
        List<Seat> existing = seats.findByRoomIdOrderByRowLabelAscSeatNumberAsc(room.getId());
        Map<String, Seat> byPosition = new HashMap<>();
        existing.forEach(seat -> byPosition.put(key(seat.getRowLabel(), seat.getSeatNumber()), seat));
        for (Seat seat : existing) {
            SeatType nextType = desired.get(key(seat.getRowLabel(), seat.getSeatNumber()));
            if (nextType == null) {
                if (allocations.existsBySeatId(seat.getId())) throw new BusinessException(HttpStatus.CONFLICT, "SEAT_IN_USE", "Không thể bỏ ghế đang được giữ hoặc gắn với đơn chưa giải phóng.");
                seat.setActive(false);
            } else {
                if (allocations.existsBySeatId(seat.getId()) && seat.getSeatType() != nextType) throw new BusinessException(HttpStatus.CONFLICT, "SEAT_IN_USE", "Không thể đổi loại ghế đang được giữ hoặc bán.");
                seat.setSeatType(nextType);
                seat.setActive(true);
            }
        }
        seats.saveAll(existing);
        List<Seat> added = new ArrayList<>();
        for (Map.Entry<String, SeatType> entry : desired.entrySet()) {
            if (byPosition.containsKey(entry.getKey())) continue;
            String[] position = entry.getKey().split(":");
            added.add(Seat.create(room.getId(), position[0], Integer.parseInt(position[1]), entry.getValue()));
        }
        seats.saveAll(added);
    }

    private SeatLayoutResponse resizedLayout(Room room) {
        Map<String, SeatType> existing = new HashMap<>();
        seats.findByRoomIdAndActiveTrueOrderByRowLabelAscSeatNumberAsc(room.getId())
            .forEach(seat -> existing.put(key(seat.getRowLabel(), seat.getSeatNumber()), seat.getSeatType()));
        List<SeatLayoutResponseSeatsItem> desired = new ArrayList<>();
        for (int row = 0; row < room.getTotalRows(); row++) {
            for (int column = 1; column <= room.getTotalColumns(); column++) {
                String label = rowLabel(row);
                SeatType type = existing.getOrDefault(key(label, column), SeatType.STANDARD);
                desired.add(new SeatLayoutResponseSeatsItem(label, column, type.name()));
            }
        }
        return new SeatLayoutResponse(room.getTotalRows(), room.getTotalColumns(), desired);
    }

    private RoomResponse response(Room room) {
        Cinema cinema = cinemas.findById(room.getCinemaId()).orElseThrow(() -> new NotFoundException("CINEMA_NOT_FOUND", "Không tìm thấy rạp."));
        int totalSeats = Math.toIntExact(seats.countByRoomIdAndActiveTrueAndSeatTypeNot(room.getId(), SeatType.AISLE));
        return new RoomResponse(room.getId(), room.getName(), cinema.getId(), cinema.getName(), room.getTotalRows(), room.getTotalColumns(), totalSeats, layout(room));
    }
    private SeatLayoutResponse layout(Room room) {
        List<SeatLayoutResponseSeatsItem> items = seats.findByRoomIdAndActiveTrueOrderByRowLabelAscSeatNumberAsc(room.getId())
            .stream().map(seat -> new SeatLayoutResponseSeatsItem(seat.getRowLabel(), seat.getSeatNumber(), seat.getSeatType().name())).toList();
        return new SeatLayoutResponse(room.getTotalRows(), room.getTotalColumns(), items);
    }
    private Room findRoom(Long id) { return rooms.findById(id).orElseThrow(() -> new NotFoundException("ROOM_NOT_FOUND", "Không tìm thấy phòng.")); }
    private void validateDimensions(int rows, int columns) {
        if (rows < 1 || rows > 26 || columns < 1 || columns > 30) invalid("dimensions", "Phòng cần từ 1 đến 26 hàng và 1 đến 30 cột.");
    }
    private String rowLabel(int index) { return String.valueOf((char) ('A' + index)); }
    private int rowIndex(String label) {
        if (label.length() != 1) return -1;
        char value = Character.toUpperCase(label.charAt(0));
        return value >= 'A' && value <= 'Z' ? value - 'A' : -1;
    }
    private String key(String row, Integer column) { return row.toUpperCase(Locale.ROOT) + ":" + column; }
    private String required(String value, String field) { String result = trim(value); if (result == null) invalid(field, "Trường này không được để trống."); return result; }
    private String trim(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private void invalid(String field, String message) { throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_ROOM_" + field.toUpperCase(Locale.ROOT), message); }
}
