package com.cinema.booking.config;

import com.cinema.booking.entity.Role;
import com.cinema.booking.entity.User;
import com.cinema.booking.repository.UserRepository;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Tạo admin đầu tiên bằng biến môi trường một lần; không chứa credential mặc định trong mã nguồn. */
@Component
public class BootstrapAdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BootstrapAdminInitializer.class);

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final String bootstrapEmail;
    private final String bootstrapPassword;

    public BootstrapAdminInitializer(
        UserRepository users,
        PasswordEncoder passwordEncoder,
        @Value("${admin.bootstrap.email:}") String bootstrapEmail,
        @Value("${admin.bootstrap.password:}") String bootstrapPassword
    ) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapEmail = bootstrapEmail;
        this.bootstrapPassword = bootstrapPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        boolean hasEmail = bootstrapEmail != null && !bootstrapEmail.isBlank();
        boolean hasPassword = bootstrapPassword != null && !bootstrapPassword.isBlank();
        if (!hasEmail && !hasPassword) {
            log.info("Không cấu hình admin bootstrap; bỏ qua khởi tạo tài khoản quản trị.");
            return;
        }
        if (!hasEmail || !hasPassword || bootstrapPassword.length() < 12) {
            throw new IllegalStateException(
                "Cần cấu hình đồng thời ADMIN_BOOTSTRAP_EMAIL và ADMIN_BOOTSTRAP_PASSWORD (ít nhất 12 ký tự)."
            );
        }

        String normalizedEmail = bootstrapEmail.trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(normalizedEmail)) {
            log.info("Tài khoản bootstrap đã tồn tại; không thay đổi vai trò hoặc mật khẩu.");
            return;
        }
        User admin = new User(normalizedEmail, passwordEncoder.encode(bootstrapPassword), "System Administrator");
        admin.setRole(Role.ADMIN);
        users.save(admin);
        log.info("Đã tạo tài khoản admin bootstrap {}.", normalizedEmail);
    }
}
