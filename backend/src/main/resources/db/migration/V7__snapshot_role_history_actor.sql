-- Giữ danh tính hiển thị của người thao tác tại đúng thời điểm đổi role.
ALTER TABLE user_role_history
    ADD COLUMN changed_by_name VARCHAR(120) NULL,
    ADD COLUMN changed_by_email VARCHAR(254) NULL;

UPDATE user_role_history role_history
JOIN users actor ON actor.id = role_history.changed_by_user_id
SET role_history.changed_by_name = actor.full_name,
    role_history.changed_by_email = actor.email;

ALTER TABLE user_role_history
    MODIFY COLUMN changed_by_name VARCHAR(120) NOT NULL,
    MODIFY COLUMN changed_by_email VARCHAR(254) NOT NULL;
