package com.cinema.booking.security;

import com.cinema.booking.entity.User;
import com.cinema.booking.repository.UserRepository;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Tải vai trò mới nhất từ DB ở mỗi request để quyền bị thu hồi có hiệu lực ngay. */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository users;

    public CustomUserDetailsService(UserRepository users) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = users.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản."));
        return new AuthenticatedUserDetails(user.getEmail(), user.getPasswordHash(), !user.isLocked(),
            !user.isLocked(), user.getAuthVersion(),
            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
    }
}
