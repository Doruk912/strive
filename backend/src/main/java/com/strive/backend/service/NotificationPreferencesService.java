package com.strive.backend.service;

import com.strive.backend.dto.NotificationPreferencesDTO;
import com.strive.backend.model.NotificationPreferences;
import com.strive.backend.repository.NotificationPreferencesRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class NotificationPreferencesService {
    private final NotificationPreferencesRepository notificationPreferencesRepository;

    public NotificationPreferencesService(NotificationPreferencesRepository notificationPreferencesRepository) {
        this.notificationPreferencesRepository = notificationPreferencesRepository;
    }

    public NotificationPreferencesDTO getUserPreferences(Integer userId) {
        return notificationPreferencesRepository.findByUserId(userId)
                .map(this::convertToDTO)
                .orElseGet(() -> createDefaultPreferences(userId));
    }

    public NotificationPreferencesDTO updatePreferences(Integer userId, NotificationPreferencesDTO preferencesDTO) {
        NotificationPreferences preferences = notificationPreferencesRepository.findByUserId(userId)
                .orElseGet(() -> NotificationPreferences.builder().userId(userId).build());

        preferences.setEmailNotifications(preferencesDTO.getEmailNotifications());
        preferences.setOrderUpdates(preferencesDTO.getOrderUpdates());
        preferences.setPromotions(preferencesDTO.getPromotions());
        preferences.setNewsletter(preferencesDTO.getNewsletter());

        return convertToDTO(notificationPreferencesRepository.save(preferences));
    }

    private NotificationPreferencesDTO createDefaultPreferences(Integer userId) {
        NotificationPreferences defaultPreferences = NotificationPreferences.builder()
                .userId(userId)
                .emailNotifications(true)
                .orderUpdates(true)
                .promotions(false)
                .newsletter(true)
                .build();

        return convertToDTO(notificationPreferencesRepository.save(defaultPreferences));
    }

    private NotificationPreferencesDTO convertToDTO(NotificationPreferences preferences) {
        return NotificationPreferencesDTO.builder()
                .id(preferences.getId())
                .userId(preferences.getUserId())
                .emailNotifications(preferences.getEmailNotifications())
                .orderUpdates(preferences.getOrderUpdates())
                .promotions(preferences.getPromotions())
                .newsletter(preferences.getNewsletter())
                .build();
    }
} 