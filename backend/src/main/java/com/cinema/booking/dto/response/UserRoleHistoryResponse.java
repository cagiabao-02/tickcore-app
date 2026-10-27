package com.cinema.booking.dto.response;

/** Lịch sử thay đổi role kèm người thực hiện, lý do và thời điểm audit. */
public record UserRoleHistoryResponse(
    Long id,
    Long targetUserId,
    Long changedByUserId,
    String changedByName,
    String changedByEmail,
    String oldRole,
    String newRole,
    String reason,
    String changedAt
) {}
