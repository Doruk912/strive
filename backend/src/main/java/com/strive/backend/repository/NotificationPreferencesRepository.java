package com.strive.backend.repository;

import com.strive.backend.model.NotificationPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationPreferencesRepository extends JpaRepository<NotificationPreferences, Integer> {
    Optional<NotificationPreferences> findByUserId(Integer userId);
} 