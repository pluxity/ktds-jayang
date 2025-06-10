package com.pluxity.ktds.global.auditing;

import java.time.LocalDateTime;

public interface Auditable {
    LocalDateTime getCreatedAt();
    LocalDateTime getLastModifiedAt();
}
