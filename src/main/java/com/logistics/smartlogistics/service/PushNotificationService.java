package com.logistics.smartlogistics.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import org.springframework.stereotype.Service;

@Service
public class PushNotificationService {

    public void sendPush(String token, String title, String body) {
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(
                            com.google.firebase.messaging.Notification.builder()
                                    .setTitle(title)
                                    .setBody(body)
                                    .build()
                    )
                    .build();

            FirebaseMessaging.getInstance().send(message);

        } catch (Exception e) {
            System.out.println("Push failed: " + e.getMessage());
        }
    }
}
