package com.logistics.smartlogistics.service;

import com.logistics.smartlogistics.entity.DeviceToken;
import com.logistics.smartlogistics.entity.Notification;
import com.logistics.smartlogistics.repository.DeviceTokenRepository;
import com.logistics.smartlogistics.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final PushNotificationService pushService;

    public NotificationService(NotificationRepository notificationRepository,
                               DeviceTokenRepository deviceTokenRepository,
                               PushNotificationService pushService) {
        this.notificationRepository = notificationRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.pushService = pushService;
    }

    public void notifyUser(Long userId, String message) {

        // ✅ 1. Save in DB
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        n.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(n);

        // ✅ 2. Send push to all devices
        List<DeviceToken> tokens = deviceTokenRepository.findByUserId(userId);

        for (DeviceToken t : tokens) {
            pushService.sendPush(
                    t.getToken(),
                    "SmartLogix",
                    message
            );
        }
    }
}
