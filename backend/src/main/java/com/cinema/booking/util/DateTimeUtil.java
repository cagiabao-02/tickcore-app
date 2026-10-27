package com.cinema.booking.util;

import java.time.Instant;

/** ISO-8601 UTC time utility. */
public final class DateTimeUtil {
    private DateTimeUtil() {}

    public static String nowIso() { return Instant.now().toString(); }
}
