package com.cinema.booking.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/** Chỉ lưu SHA-256 của refresh/reset token để DB không chứa token có thể dùng trực tiếp. */
public final class TokenHasher {
    private TokenHasher() {}

    public static String sha256(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("JVM không hỗ trợ SHA-256.", exception);
        }
    }
}
