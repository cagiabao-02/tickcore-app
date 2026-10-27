package com.cinema.booking.security;

import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/** Principal mang authVersion hiện tại để JWT cũ bị thu hồi ngay khi tài khoản đổi trạng thái. */
public record AuthenticatedUserDetails(
    String username,
    String password,
    boolean enabled,
    boolean accountNonLocked,
    int authVersion,
    Collection<? extends GrantedAuthority> authorities
) implements UserDetails {

    @Override public String getUsername() { return username; }
    @Override public String getPassword() { return password; }
    @Override public boolean isEnabled() { return enabled; }
    @Override public boolean isAccountNonLocked() { return accountNonLocked; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }

    @Override
    public String toString() {
        return "AuthenticatedUserDetails[username=" + username + ", authVersion=" + authVersion
            + ", authorities=" + authorities + "]";
    }
}
