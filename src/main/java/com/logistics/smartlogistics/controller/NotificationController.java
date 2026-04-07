package com.logistics.smartlogistics.controller;

import com.logistics.smartlogistics.entity.DeviceToken;
import com.logistics.smartlogistics.entity.Notification;
import com.logistics.smartlogistics.repository.AppUserRepository;
import com.logistics.smartlogistics.repository.DeviceTokenRepository;
import com.logistics.smartlogistics.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final AppUserRepository appUserRepository;

    public NotificationController(NotificationRepository notificationRepository,
                                  DeviceTokenRepository deviceTokenRepository,
                                  AppUserRepository appUserRepository) {
        this.notificationRepository = notificationRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.appUserRepository = appUserRepository;
    }

    // 🔔 Fetch notifications
    @GetMapping
    public List<Notification> getMyNotifications(Authentication auth) {

        Long userId = appUserRepository.findByEmail(auth.getName())
                .orElseThrow()
                .getId();

        return notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(userId);
    }

    /** Remove all notifications for the current user (inbox clear). */
    @DeleteMapping
    @Transactional
    public void clearAll(Authentication auth) {
        Long userId = appUserRepository.findByEmail(auth.getName())
                .orElseThrow()
                .getId();
        notificationRepository.deleteByUserId(userId);
    }

    // 📱 Register device token
    @PostMapping("/register")
    public void registerToken(@RequestBody Map<String, String> body,
                              Authentication auth) {

        String token = body.get("token");

        Long userId = appUserRepository.findByEmail(auth.getName())
                .orElseThrow()
                .getId();

        if (!deviceTokenRepository.existsByToken(token)) {
            DeviceToken dt = new DeviceToken();
            dt.setUserId(userId);
            dt.setToken(token);
            deviceTokenRepository.save(dt);
        }
    }

    @PatchMapping("/{id}/read")
    @Transactional
    public void markRead(@PathVariable Long id, Authentication auth) {
        Long userId = appUserRepository.findByEmail(auth.getName())
                .orElseThrow()
                .getId();
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!n.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @PatchMapping("/read-all")
    @Transactional
    public void markAllRead(Authentication auth) {
        Long userId = appUserRepository.findByEmail(auth.getName())
                .orElseThrow()
                .getId();
        notificationRepository.markAllReadForUser(userId);
    }
}
