-- Hỗ trợ job dọn theo lô refresh session và token reset đã hết hạn.
CREATE INDEX ix_refresh_sessions_expires_at ON refresh_sessions (expires_at);
CREATE INDEX ix_password_reset_tokens_expires_at ON password_reset_tokens (expires_at);
