package com.cinema.booking.entity;

/** Định dạng trình chiếu theo mã API hiện có. */
public enum ShowFormat {
    TWO_D("2D"), THREE_D("3D"), IMAX("IMAX");

    private final String code;

    ShowFormat(String code) { this.code = code; }

    public String getCode() { return code; }

    public static ShowFormat fromCode(String code) {
        for (ShowFormat format : values()) {
            if (format.code.equals(code)) return format;
        }
        throw new IllegalArgumentException("Định dạng chiếu không hợp lệ: " + code);
    }
}
