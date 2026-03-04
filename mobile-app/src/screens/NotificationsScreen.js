import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, IconButton, Button, Chip } from 'react-native-paper';
import { notificationAPI } from '../services/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      await loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MONEY_RECEIVED': return 'arrow-down-bold';
      case 'MONEY_SENT': return 'arrow-up-bold';
      case 'TRANSACTION_SUCCESS': return 'check-circle';
      case 'TRANSACTION_FAILED': return 'alert-circle';
      case 'VPA_CREATED': return 'account-plus';
      case 'UPI_PIN_CHANGED': return 'lock-reset';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'MONEY_RECEIVED': return '#4caf50';
      case 'MONEY_SENT': return '#2196f3';
      case 'TRANSACTION_SUCCESS': return '#4caf50';
      case 'TRANSACTION_FAILED': return '#f44336';
      default: return '#6200ee';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <Button mode="text" onPress={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {!notifications || notifications.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No notifications</Text>
                <Text style={styles.emptySubtext}>
                  You're all caught up!
                </Text>
              </Card.Content>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.unreadCard
                ]}
              >
                <Card.Content>
                  <View style={styles.notificationHeader}>
                    <View style={styles.notificationInfo}>
                      <IconButton
                        icon={getNotificationIcon(notification.type)}
                        size={24}
                        iconColor={getNotificationColor(notification.type)}
                      />
                      <View style={styles.notificationText}>
                        <Text style={styles.notificationTitle}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationDate}>
                          {formatDate(notification.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.notificationActions}>
                      {!notification.isRead && (
                        <Chip 
                          mode="flat" 
                          style={styles.unreadChip}
                          textStyle={styles.unreadText}
                        >
                          New
                        </Chip>
                      )}
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDelete(notification.id)}
                      />
                    </View>
                  </View>
                  {!notification.isRead && (
                    <Button 
                      mode="text" 
                      onPress={() => handleMarkAsRead(notification.id)}
                      style={styles.markReadButton}
                    >
                      Mark as read
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  content: {
    padding: 15,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  notificationCard: {
    marginBottom: 10,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unreadChip: {
    backgroundColor: '#6200ee',
    marginTop: 5,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
  },
  markReadButton: {
    marginTop: 10,
  },
});
