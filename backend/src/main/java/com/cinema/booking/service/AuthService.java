package com.cinema.booking.service;

import com.cinema.booking.dto.request.LoginRequest;
import com.cinema.booking.dto.request.RefreshTokenRequest;
import com.cinema.booking.dto.request.RegisterRequest;
import com.cinema.booking.dto.request.ForgotPasswordRequest;
import com.cinema.booking.dto.request.ResetPasswordRequest;
import com.cinema.booking.dto.response.AuthTokensResponse;
import com.cinema.booking.dto.response.MessageResponse;
import com.cinema.booking.entity.RefreshSession;
import com.cinema.booking.entity.PasswordResetToken;
import com.cinema.booking.entity.User;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.PasswordResetTokenRepository;
import com.cinema.booking.repository.RefreshSessionRepository;
import com.cinema.booking.repository.UserRepository;
import com.cinema.booking.security.JwtService;
import com.cinema.booking.util.TokenHasher;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.util.UriComponentsBuilder;
import jakarta.annotation.PostConstruct;

/** Đăng ký, xác thực access JWT và xoay vòng refresh session lưu trong DB. */
@Service
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository users;
    private final RefreshSessionRepository sessions;
    private final PasswordResetTokenRepository passwordResetTokens;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSenders;
    private final long refreshExpirationMillis;
    private final long passwordResetExpirationSeconds;
    private final boolean passwordResetEnabled;
    private final String passwordResetFrom;
    private final String frontendBaseUrl;

    public AuthService(
        AuthenticationManager authenticationManager,
        UserRepository users,
        RefreshSessionRepository sessions,
        PasswordResetTokenRepository passwordResetTokens,
        JwtService jwtService,
        PasswordEncoder passwordEncoder,
        ObjectProvider<JavaMailSender> mailSenders,
        @Value("${jwt.refresh-expiration:2592000000}") long refreshExpirationMillis,
        @Value("${password-reset.expiration-seconds:1800}") long passwordResetExpirationSeconds,
        @Value("${password-reset.enabled:false}") boolean passwordResetEnabled,
        @Value("${password-reset.from:}") String passwordResetFrom,
        @Value("${password-reset.frontend-url:http://localhost:3000}") String frontendBaseUrl
    ) {
        this.authenticationManager = authenticationManager;
        this.users = users;
        this.sessions = sessions;
        this.passwordResetTokens = passwordResetTokens;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.mailSenders = mailSenders;
        this.refreshExpirationMillis = refreshExpirationMillis;
        this.passwordResetExpirationSeconds = passwordResetExpirationSeconds;
        this.passwordResetEnabled = passwordResetEnabled;
        this.passwordResetFrom = passwordResetFrom;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @PostConstruct
    void validateRefreshExpiration() {
        if (refreshExpirationMillis < 60_000) {
            throw new IllegalStateException("JWT_REFRESH_EXPIRATION phải ít nhất 60000 mili giây.");
        }
        if (passwordResetExpirationSeconds < 300 || passwordResetExpirationSeconds > 86_400) {
            throw new IllegalStateException("PASSWORD_RESET_EXPIRATION_SECONDS phải từ 300 đến 86400 giây.");
        }
        if (passwordResetEnabled && (mailSenders.getIfAvailable() == null
            || passwordResetFrom == null || passwordResetFrom.isBlank())) {
            throw new IllegalStateException("Bật password reset cần SMTP và PASSWORD_RESET_FROM.");
        }
    }

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (users.existsByEmailIgnoreCase(email)) {
            throw new BusinessException(HttpStatus.CONFLICT, "EMAIL_EXISTS", "Email đã được sử dụng.");
        }
        User user = new User(email, passwordEncoder.encode(request.password()), request.fullName().trim());
        users.save(user);
        return new MessageResponse("Đăng ký thành công.");
    }

    @Transactional
    public AuthTokensResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
            );
        } catch (LockedException exception) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "ACCOUNT_LOCKED", "Tài khoản đã bị khóa.");
        } catch (AuthenticationException exception) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "AUTH_FAILED", "Email hoặc mật khẩu không đúng.");
        }
        User user = users.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "AUTH_FAILED", "Email hoặc mật khẩu không đúng."));
        return issueTokenPair(user);
    }

    @Transactional(noRollbackFor = BusinessException.class)
    public AuthTokensResponse refreshToken(RefreshTokenRequest request) {
        Instant now = Instant.now();
        String tokenHash = TokenHasher.sha256(request.refreshToken());
        RefreshSession observed = sessions.findByTokenHash(tokenHash)
            .orElseThrow(this::invalidRefreshToken);
        User user = users.findByIdForUpdate(observed.getUser().getId())
            .orElseThrow(this::invalidRefreshToken);
        RefreshSession session = sessions.findByTokenHashForUpdate(tokenHash)
            .orElseThrow(this::invalidRefreshToken);
        if (session.getRevokedAt() != null || !session.getExpiresAt().isAfter(now)) {
            user.invalidateAccessTokens();
            users.save(user);
            sessions.revokeAllForUser(user.getId(), now);
            throw invalidRefreshToken();
        }
        if (user.isLocked()) {
            sessions.revokeAllForUser(user.getId(), now);
            throw new BusinessException(HttpStatus.FORBIDDEN, "ACCOUNT_LOCKED", "Tài khoản đã bị khóa.");
        }
        session.revoke(now);
        return issueTokenPair(user);
    }

    @Transactional
    public MessageResponse logout() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        users.findByEmailIgnoreCase(email).ifPresent(found -> users.findByIdForUpdate(found.getId())
            .ifPresent(user -> {
                user.invalidateAccessTokens();
                users.save(user);
                sessions.revokeAllForUser(user.getId(), Instant.now());
            }));
        return new MessageResponse("Đăng xuất thành công.");
    }

    /** Chưa nhận diện email tồn tại; trả cùng trạng thái để tránh dò tài khoản. */
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        if (!passwordResetEnabled) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "PASSWORD_RECOVERY_UNAVAILABLE",
                "Chức năng khôi phục mật khẩu chưa được cấu hình nhà cung cấp email.");
        }
        String email = normalizeEmail(request.email());
        users.findByEmailIgnoreCase(email).ifPresent(observed -> users.findByIdForUpdate(observed.getId())
            .ifPresent(user -> {
                String rawToken = newResetToken();
                Instant now = Instant.now();
                passwordResetTokens.invalidateUnusedByUserId(user.getId(), now);
                passwordResetTokens.saveAndFlush(new PasswordResetToken(user.getId(),
                    TokenHasher.sha256(rawToken), now.plusSeconds(passwordResetExpirationSeconds)));
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        sendPasswordResetMessage(user, rawToken);
                    }
                });
            }));
        return new MessageResponse("Nếu email thuộc tài khoản TickCore, hướng dẫn đặt lại mật khẩu sẽ được gửi.");
    }

    /** Reset mật khẩu được bật cùng tích hợp email để không tạo token không thể chuyển cho người dùng. */
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        if (!passwordResetEnabled) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "PASSWORD_RECOVERY_UNAVAILABLE",
                "Chức năng đặt lại mật khẩu chưa được cấu hình nhà cung cấp email.");
        }
        String tokenHash = TokenHasher.sha256(request.token());
        PasswordResetToken observed = passwordResetTokens.findByTokenHash(tokenHash)
            .orElseThrow(this::invalidPasswordResetToken);
        User user = users.findByIdForUpdate(observed.getUserId())
            .orElseThrow(this::invalidPasswordResetToken);
        PasswordResetToken token = passwordResetTokens.findByTokenHashForUpdate(tokenHash)
            .orElseThrow(this::invalidPasswordResetToken);
        Instant now = Instant.now();
        if (!token.getUserId().equals(user.getId()) || token.getUsedAt() != null || !token.getExpiresAt().isAfter(now)) {
            throw invalidPasswordResetToken();
        }
        if (passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "PASSWORD_UNCHANGED",
                "Mật khẩu mới phải khác mật khẩu hiện tại.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.invalidateAccessTokens();
        users.saveAndFlush(user);
        passwordResetTokens.invalidateUnusedByUserId(user.getId(), now);
        sessions.revokeAllForUser(user.getId(), now);
        return new MessageResponse("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
    }

    private AuthTokensResponse issueTokenPair(User user) {
        byte[] random = new byte[32];
        SECURE_RANDOM.nextBytes(random);
        String refreshToken = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        Instant expiresAt = Instant.now().plusMillis(refreshExpirationMillis);
        sessions.save(new RefreshSession(user, TokenHasher.sha256(refreshToken), expiresAt));
        return new AuthTokensResponse(jwtService.createAccessToken(user), refreshToken,
            jwtService.getExpirationSeconds());
    }

    private BusinessException invalidRefreshToken() {
        return new BusinessException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Refresh token không hợp lệ hoặc đã hết hạn.");
    }

    private BusinessException invalidPasswordResetToken() {
        return new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_PASSWORD_RESET_TOKEN",
            "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
    }

    private String newResetToken() {
        byte[] random = new byte[32];
        SECURE_RANDOM.nextBytes(random);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(random);
    }

    private void sendPasswordResetMessage(User user, String rawToken) {
        JavaMailSender sender = mailSenders.getIfAvailable();
        if (sender == null) throw new IllegalStateException("SMTP sender không khả dụng dù password reset đang bật.");
        String resetUrl = UriComponentsBuilder.fromUriString(frontendBaseUrl)
            .path("/reset-password").queryParam("token", rawToken).build().encode().toUriString();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(passwordResetFrom);
        message.setTo(user.getEmail());
        message.setSubject("Đặt lại mật khẩu TickCore");
        message.setText("Bạn vừa yêu cầu đặt lại mật khẩu TickCore. Mở liên kết sau để tiếp tục: "
            + resetUrl + "\nLiên kết chỉ sử dụng một lần và hết hạn sau "
            + (passwordResetExpirationSeconds / 60) + " phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.");
        try {
            sender.send(message);
        } catch (MailException exception) {
            log.error("Không gửi được email đặt lại mật khẩu cho userId={}", user.getId(), exception);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
