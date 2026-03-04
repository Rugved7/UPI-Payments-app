package com.rugved.paymentProject.service.impl;

import com.rugved.paymentProject.exception.BusinessException;
import com.rugved.paymentProject.model.Notification;
import com.rugved.paymentProject.model.User;
import com.rugved.paymentProject.repository.NotificationRepository;
import com.rugved.paymentProject.repository.UserRepository;
import com.rugved.paymentProject.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Async
    @Transactional
    public void createNotification(Long userId, String title, String message, 
                                  Notification.NotificationType type, String referenceId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException("User not found", 
                        BusinessException.ErrorCodes.USER_NOT_FOUND));

            Notification notification = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .referenceId(referenceId)
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);
            log.info("Notification created for user: {}, type: {}", userId, type);
        } catch (Exception e) {
            log.error("Failed to create notification for user: {}", userId, e);
        }
    }

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException("Notification not found", 
                    BusinessException.ErrorCodes.TRANSACTION_NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new BusinessException("Access denied", "ACCESS_DENIED");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException("Notification not found", 
                    BusinessException.ErrorCodes.TRANSACTION_NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new BusinessException("Access denied", "ACCESS_DENIED");
        }

        notificationRepository.delete(notification);
    }
}
