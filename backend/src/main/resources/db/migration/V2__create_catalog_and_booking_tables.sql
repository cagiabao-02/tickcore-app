-- Danh mục rạp/phim và lõi đặt vé. Các thay đổi trạng thái phải chạy trong transaction.
-- seat_allocations là khóa duy nhất cho một ghế trong một suất, dùng chung cho hold và booking.

CREATE TABLE cities (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_cities_slug UNIQUE (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE cinemas (
    id BIGINT NOT NULL AUTO_INCREMENT,
    city_id BIGINT NOT NULL,
    name VARCHAR(160) NOT NULL,
    address VARCHAR(500) NOT NULL,
    phone VARCHAR(32) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_cinemas_city FOREIGN KEY (city_id) REFERENCES cities (id),
    INDEX ix_cinemas_city_name (city_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE rooms (
    id BIGINT NOT NULL AUTO_INCREMENT,
    cinema_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    total_rows INT NOT NULL,
    total_columns INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT fk_rooms_cinema FOREIGN KEY (cinema_id) REFERENCES cinemas (id),
    CONSTRAINT uk_rooms_cinema_name UNIQUE (cinema_id, name),
    CONSTRAINT chk_rooms_dimensions CHECK (total_rows > 0 AND total_columns > 0),
    INDEX ix_rooms_cinema (cinema_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE seats (
    id BIGINT NOT NULL AUTO_INCREMENT,
    room_id BIGINT NOT NULL,
    row_label VARCHAR(8) NOT NULL,
    seat_number INT NOT NULL,
    seat_type VARCHAR(24) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT fk_seats_room FOREIGN KEY (room_id) REFERENCES rooms (id),
    CONSTRAINT uk_seats_room_position UNIQUE (room_id, row_label, seat_number),
    CONSTRAINT chk_seats_number CHECK (seat_number > 0),
    CONSTRAINT chk_seats_type CHECK (seat_type IN ('STANDARD', 'VIP', 'COUPLE', 'AISLE')),
    INDEX ix_seats_room_active (room_id, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE movies (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(240) NOT NULL,
    original_title VARCHAR(240) NULL,
    poster_url VARCHAR(2048) NULL,
    banner_url VARCHAR(2048) NULL,
    trailer_url VARCHAR(2048) NULL,
    description TEXT NULL,
    duration_minutes INT NOT NULL,
    release_date DATE NOT NULL,
    end_date DATE NULL,
    language VARCHAR(80) NOT NULL,
    age_rating VARCHAR(24) NOT NULL,
    director VARCHAR(240) NULL,
    cast_list TEXT NULL,
    status VARCHAR(24) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT chk_movies_duration CHECK (duration_minutes > 0),
    CONSTRAINT chk_movies_status CHECK (status IN ('NOW_SHOWING', 'COMING_SOON', 'STOPPED')),
    INDEX ix_movies_status_release (status, release_date),
    INDEX ix_movies_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE genres (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_genres_name UNIQUE (name),
    CONSTRAINT uk_genres_slug UNIQUE (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE movie_genres (
    movie_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    CONSTRAINT fk_movie_genres_movie FOREIGN KEY (movie_id) REFERENCES movies (id),
    CONSTRAINT fk_movie_genres_genre FOREIGN KEY (genre_id) REFERENCES genres (id),
    INDEX ix_movie_genres_genre (genre_id, movie_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE showtimes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    movie_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    start_time TIMESTAMP(6) NOT NULL,
    end_time TIMESTAMP(6) NOT NULL,
    format VARCHAR(24) NOT NULL,
    subtitle_type VARCHAR(40) NOT NULL,
    base_price BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT fk_showtimes_movie FOREIGN KEY (movie_id) REFERENCES movies (id),
    CONSTRAINT fk_showtimes_room FOREIGN KEY (room_id) REFERENCES rooms (id),
    CONSTRAINT chk_showtimes_time CHECK (end_time > start_time),
    CONSTRAINT chk_showtimes_format CHECK (format IN ('2D', '3D', 'IMAX')),
    CONSTRAINT chk_showtimes_subtitle CHECK (subtitle_type IN ('SUBTITLED', 'DUBBED')),
    CONSTRAINT chk_showtimes_price CHECK (base_price >= 0),
    INDEX ix_showtimes_movie_start (movie_id, start_time),
    INDEX ix_showtimes_room_start_end (room_id, start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ticket_pricing (
    id BIGINT NOT NULL AUTO_INCREMENT,
    seat_type VARCHAR(24) NOT NULL,
    base_price BIGINT NOT NULL,
    surcharge_3d BIGINT NOT NULL DEFAULT 0,
    surcharge_imax BIGINT NOT NULL DEFAULT 0,
    weekend_surcharge BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_ticket_pricing_seat_type UNIQUE (seat_type),
    CONSTRAINT chk_ticket_pricing_type CHECK (seat_type IN ('STANDARD', 'VIP', 'COUPLE')),
    CONSTRAINT chk_ticket_pricing_amounts CHECK (base_price >= 0 AND surcharge_3d >= 0 AND surcharge_imax >= 0 AND weekend_surcharge >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE combos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(160) NOT NULL,
    description VARCHAR(1000) NULL,
    image_url VARCHAR(2048) NULL,
    price BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT chk_combos_price CHECK (price >= 0),
    INDEX ix_combos_active_name (active, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE promotions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    promotion_type VARCHAR(24) NOT NULL,
    value INT NOT NULL,
    min_order_amount BIGINT NOT NULL DEFAULT 0,
    max_discount BIGINT NULL,
    starts_at TIMESTAMP(6) NOT NULL,
    ends_at TIMESTAMP(6) NOT NULL,
    usage_limit INT NULL,
    used_count INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT uk_promotions_code UNIQUE (code),
    CONSTRAINT chk_promotions_type CHECK (promotion_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    CONSTRAINT chk_promotions_value CHECK (value > 0),
    CONSTRAINT chk_promotions_period CHECK (ends_at > starts_at),
    CONSTRAINT chk_promotions_usage CHECK (used_count >= 0 AND (usage_limit IS NULL OR usage_limit >= used_count)),
    CONSTRAINT chk_promotions_amounts CHECK (min_order_amount >= 0 AND (max_discount IS NULL OR max_discount >= 0)),
    INDEX ix_promotions_active_period (active, starts_at, ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE seat_holds (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    showtime_id BIGINT NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP(6) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_seat_holds_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_seat_holds_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes (id),
    CONSTRAINT chk_seat_holds_status CHECK (status IN ('ACTIVE', 'RELEASED', 'EXPIRED', 'CONVERTED')),
    INDEX ix_seat_holds_expiry (status, expires_at),
    INDEX ix_seat_holds_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE bookings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    booking_code VARCHAR(40) NOT NULL,
    user_id BIGINT NOT NULL,
    showtime_id BIGINT NOT NULL,
    hold_id BIGINT NULL,
    movie_title VARCHAR(240) NOT NULL,
    movie_poster_url VARCHAR(2048) NULL,
    cinema_name VARCHAR(160) NOT NULL,
    room_name VARCHAR(120) NOT NULL,
    showtime_start TIMESTAMP(6) NOT NULL,
    showtime_end TIMESTAMP(6) NOT NULL,
    format VARCHAR(24) NOT NULL,
    promotion_id BIGINT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    subtotal BIGINT NOT NULL,
    discount BIGINT NOT NULL DEFAULT 0,
    total_amount BIGINT NOT NULL,
    promo_code VARCHAR(64) NULL,
    expires_at TIMESTAMP(6) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_bookings_code UNIQUE (booking_code),
    CONSTRAINT uk_bookings_hold UNIQUE (hold_id),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_bookings_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes (id),
    CONSTRAINT fk_bookings_hold FOREIGN KEY (hold_id) REFERENCES seat_holds (id),
    CONSTRAINT fk_bookings_promotion FOREIGN KEY (promotion_id) REFERENCES promotions (id),
    CONSTRAINT chk_bookings_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED')),
    CONSTRAINT chk_bookings_amounts CHECK (subtotal >= 0 AND discount >= 0 AND total_amount >= 0 AND discount <= subtotal AND total_amount = subtotal - discount),
    INDEX ix_bookings_user_created (user_id, created_at),
    INDEX ix_bookings_status_expiry (status, expires_at),
    INDEX ix_bookings_showtime_status (showtime_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE seat_allocations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    showtime_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    hold_id BIGINT NULL,
    booking_id BIGINT NULL,
    expires_at TIMESTAMP(6) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_seat_allocations_showtime_seat UNIQUE (showtime_id, seat_id),
    CONSTRAINT fk_seat_allocations_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes (id),
    CONSTRAINT fk_seat_allocations_seat FOREIGN KEY (seat_id) REFERENCES seats (id),
    CONSTRAINT fk_seat_allocations_hold FOREIGN KEY (hold_id) REFERENCES seat_holds (id),
    CONSTRAINT fk_seat_allocations_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
    CONSTRAINT chk_seat_allocations_owner CHECK (
        (hold_id IS NOT NULL AND booking_id IS NULL AND expires_at IS NOT NULL)
        OR (hold_id IS NULL AND booking_id IS NOT NULL AND expires_at IS NULL)
    ),
    INDEX ix_seat_allocations_hold (hold_id, expires_at),
    INDEX ix_seat_allocations_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE booking_seats (
    id BIGINT NOT NULL AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    seat_label VARCHAR(20) NOT NULL,
    seat_type VARCHAR(24) NOT NULL,
    price BIGINT NOT NULL,
    ticket_code VARCHAR(96) NOT NULL,
    checked_in_at TIMESTAMP(6) NULL,
    checked_in_by_user_id BIGINT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_booking_seats_booking_seat UNIQUE (booking_id, seat_id),
    CONSTRAINT uk_booking_seats_ticket_code UNIQUE (ticket_code),
    CONSTRAINT fk_booking_seats_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
    CONSTRAINT fk_booking_seats_seat FOREIGN KEY (seat_id) REFERENCES seats (id),
    CONSTRAINT fk_booking_seats_checked_in_by FOREIGN KEY (checked_in_by_user_id) REFERENCES users (id),
    CONSTRAINT chk_booking_seats_price CHECK (price >= 0),
    CONSTRAINT chk_booking_seats_checkin CHECK ((checked_in_at IS NULL) = (checked_in_by_user_id IS NULL)),
    INDEX ix_booking_seats_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE booking_combos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    combo_id BIGINT NOT NULL,
    combo_name VARCHAR(160) NOT NULL,
    quantity INT NOT NULL,
    unit_price BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_booking_combos_booking_combo UNIQUE (booking_id, combo_id),
    CONSTRAINT fk_booking_combos_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
    CONSTRAINT fk_booking_combos_combo FOREIGN KEY (combo_id) REFERENCES combos (id),
    CONSTRAINT chk_booking_combos_values CHECK (quantity > 0 AND unit_price >= 0),
    INDEX ix_booking_combos_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE payments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    method VARCHAR(24) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    amount BIGINT NOT NULL,
    provider_reference VARCHAR(160) NULL,
    idempotency_key VARCHAR(96) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_payments_idempotency_key UNIQUE (idempotency_key),
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
    CONSTRAINT chk_payments_method CHECK (method IN ('CREDIT_CARD', 'E_WALLET', 'QR_TRANSFER')),
    CONSTRAINT chk_payments_status CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
    CONSTRAINT chk_payments_amount CHECK (amount >= 0),
    INDEX ix_payments_booking_created (booking_id, created_at),
    INDEX ix_payments_provider_reference (provider_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE reviews (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(2000) NULL,
    hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_reviews_user_movie UNIQUE (user_id, movie_id),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_reviews_movie FOREIGN KEY (movie_id) REFERENCES movies (id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    INDEX ix_reviews_movie_hidden_created (movie_id, hidden, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
