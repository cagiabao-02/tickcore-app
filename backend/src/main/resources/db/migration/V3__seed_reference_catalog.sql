-- Dữ liệu tối thiểu để có thể tạo rạp và tính giá vé ngay sau khi cài mới.
INSERT IGNORE INTO cities (name, slug) VALUES
    ('Hồ Chí Minh', 'ho-chi-minh'),
    ('Hà Nội', 'ha-noi');

INSERT IGNORE INTO ticket_pricing (seat_type, base_price, surcharge_3d, surcharge_imax, weekend_surcharge) VALUES
    ('STANDARD', 75000, 20000, 45000, 10000),
    ('VIP', 95000, 20000, 45000, 15000),
    ('COUPLE', 170000, 40000, 90000, 20000);
