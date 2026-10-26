package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.User;
/** TODO: findByEmail: lấy tài khoản đăng nhập; existsByEmail: kiểm tra email trùng; findByLocked: lọc tài khoản bị khóa. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface UserRepository extends JpaRepository<User, Long> {}
