package com.strive.backend.controller;

import com.strive.backend.dto.NotificationPreferencesDTO;
import com.strive.backend.service.NotificationPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification-preferences")
@RequiredArgsConstructor
public class NotificationPreferencesController {
    private final NotificationPreferencesService notificationPreferencesService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<NotificationPreferencesDTO> getUserPreferences(@PathVariable Integer userId) {
        return ResponseEntity.ok(notificationPreferencesService.getUserPreferences(userId));
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<NotificationPreferencesDTO> updatePreferences(
            @PathVariable Integer userId,
            @RequestBody NotificationPreferencesDTO preferencesDTO) {
        return ResponseEntity.ok(notificationPreferencesService.updatePreferences(userId, preferencesDTO));
    }
} 