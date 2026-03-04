package com.rugved.paymentProject.service;

import com.rugved.paymentProject.model.Notification;

import java.util.List;

public interface NotificationService {
    void createNotification(Long userId, String title, String message, 
                          Notification.NotificationType type, String referenceId);
    
    List<Notification> getUserNotifications(Long userId);
    List<Notification> getUnreadNotifications(Long userId);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long notificationId, Long userId);
}
