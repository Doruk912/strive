package com.strive.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationPreferencesDTO {
    private Integer id;
    private Integer userId;
    private Boolean emailNotifications;
    private Boolean orderUpdates;
    private Boolean promotions;
    private Boolean newsletter;
} 