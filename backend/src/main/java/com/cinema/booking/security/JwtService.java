package com.cinema.booking.security;

import com.cinema.booking.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

/** Phát hành và xác minh access JWT; quyền luôn được tải lại từ DB, không tin role cũ trong token. */
@Service
public class JwtService {

    @Value("${jwt.secret:}")
    private String configuredSecret;

    @Value("${jwt.expiration:3600000}")
    private long expirationMillis;

    private SecretKey signingKey;

    @PostConstruct
    void initializeKey() {
        if (configuredSecret == null || configuredSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET phải có ít nhất 32 byte ngẫu nhiên.");
        }
        if (expirationMillis < 60_000) {
            throw new IllegalStateException("JWT_EXPIRATION phải ít nhất 60000 mili giây.");
        }
        signingKey = Keys.hmacShaKeyFor(configuredSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(user.getEmail())
            .claim("authVersion", user.getAuthVersion())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusMillis(expirationMillis)))
            .signWith(signingKey)
            .compact();
    }

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isValidFor(String token, UserDetails userDetails) {
        try {
            Claims claims = parseClaims(token);
            Object tokenVersion = claims.get("authVersion");
            return userDetails instanceof AuthenticatedUserDetails current
                && tokenVersion instanceof Number version
                && version.intValue() == current.authVersion()
                && claims.getSubject().equalsIgnoreCase(userDetails.getUsername())
                && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }

    public int getExpirationSeconds() {
        return Math.toIntExact(expirationMillis / 1000);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
