package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

/** Bản ghi append-only về việc ai đã đổi vai trò của tài khoản nào. */
@Entity
@Table(name = "user_role_history")
public class UserRoleHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "target_user_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_user_role_history_target")
    )
    private User targetUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "changed_by_user_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_user_role_history_actor")
    )
    private User changedBy;

    @Column(name = "changed_by_name", nullable = false, length = 120)
    private String changedByName;

    @Column(name = "changed_by_email", nullable = false, length = 254)
    private String changedByEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_role", nullable = false, length = 20)
    private Role oldRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_role", nullable = false, length = 20)
    private Role newRole;

    @Column(length = 500)
    private String reason;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private Instant changedAt;

    protected UserRoleHistory() {
        // Constructor mặc định bắt buộc cho JPA.
    }

    public UserRoleHistory(User targetUser, User changedBy, Role oldRole, Role newRole, String reason) {
        this.targetUser = targetUser;
        this.changedBy = changedBy;
        this.changedByName = changedBy.getFullName();
        this.changedByEmail = changedBy.getEmail();
        this.oldRole = oldRole;
        this.newRole = newRole;
        this.reason = reason;
    }

    @PrePersist
    void onCreate() {
        changedAt = Instant.now();
    }

    public Long getId() { return id; }
    public User getTargetUser() { return targetUser; }
    public User getChangedBy() { return changedBy; }
    public String getChangedByName() { return changedByName; }
    public String getChangedByEmail() { return changedByEmail; }
    public Role getOldRole() { return oldRole; }
    public Role getNewRole() { return newRole; }
    public String getReason() { return reason; }
    public Instant getChangedAt() { return changedAt; }
}
