package com.cinema.booking.exception;

import java.util.Map;
import org.springframework.http.HttpStatus;

/** Lỗi nghiệp vụ có HTTP status và mã ổn định cho frontend dịch. */
public class BusinessException extends RuntimeException {
    private final HttpStatus status;
    private final String code;
    private final Map<String, String> details;

    public BusinessException(HttpStatus status, String code, String message) {
        this(status, code, message, Map.of());
    }

    public BusinessException(HttpStatus status, String code, String message, Map<String, String> details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = Map.copyOf(details);
    }

    public HttpStatus getStatus() { return status; }
    public String getCode() { return code; }
    public Map<String, String> getDetails() { return details; }
}
