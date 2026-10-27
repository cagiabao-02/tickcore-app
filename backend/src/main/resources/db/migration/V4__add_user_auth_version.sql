-- Thu hồi access JWT ngay khi đổi mật khẩu, vai trò hoặc trạng thái tài khoản.
ALTER TABLE users
    ADD COLUMN auth_version INT NOT NULL DEFAULT 0;
