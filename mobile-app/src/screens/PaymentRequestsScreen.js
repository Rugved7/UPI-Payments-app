import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, IconButton, SegmentedButtons } from 'react-native-paper';
import CustomHeader from '../components/CustomHeader';
import { paymentRequestAPI } from '../services/api';
import { colors, spacing } from '../config/theme';

export default function PaymentRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      let response;
      if (filter === 'sent') {
        response = await paymentRequestAPI.getSent();
      } else if (filter === 'received') {
        response = await paymentRequestAPI.getReceived();
      } else {
        response = await paymentRequestAPI.getAll();
      }
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleAccept = (request) => {
    navigation.navigate('PaymentConfirm', {
      receiverVpa: request.requesterVpa,
      amount: parseFloat(request.amount),
      description: request.description || 'Payment request',
      onSuccess: async (upiPin) => {
        const response = await paymentRequestAPI.accept(request.requestId, upiPin);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Payment failed');
        }
      },
    });
  };

  const handleReject = async (requestId) => {
    try {
      await paymentRequestAPI.reject(requestId);
      await loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return colors.dark.success;
      case 'PENDING': return colors.dark.warning;
      case 'REJECTED': return colors.dark.error;
      case 'EXPIRED': return colors.dark.textSecondary;
      default: return colors.dark.textTertiary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return 'check-circle';
      case 'PENDING': return 'clock-outline';
      case 'REJECTED': return 'close-circle';
      case 'EXPIRED': return 'timer-off';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Payment Requests" 
        onBack={() => navigation.goBack()}
      />

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'all', label: 'All', icon: 'format-list-bulleted' },
            { value: 'sent', label: 'Sent', icon: 'arrow-up' },
            { value: 'received', label: 'Received', icon: 'arrow-down' },
          ]}
          style={styles.segmentedButtons}
          theme={{ colors: { secondaryContainer: colors.dark.primary, onSecondaryContainer: colors.dark.background } }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.dark.primary]} />
        }
      >
        <View style={styles.content}>
          {!requests || requests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconButton 
                icon="inbox-outline" 
                size={64} 
                iconColor={colors.dark.textSecondary}
                style={{ margin: 0 }}
              />
              <Text style={styles.emptyText}>No requests found</Text>
              <Text style={styles.emptySubtext}>
                {filter === 'sent' ? 'You haven\'t sent any requests yet' : 
                 filter === 'received' ? 'You haven\'t received any requests yet' : 
                 'No payment requests to show'}
              </Text>
            </View>
          ) : (
            requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <IconButton 
                      icon={filter === 'sent' ? 'arrow-up' : 'arrow-down'} 
                      size={20} 
                      iconColor={colors.dark.primary}
                      style={{ margin: 0 }}
                    />
                  </View>
                  <View style={styles.headerContent}>
                    <Text style={styles.vpaText}>
                      {filter === 'sent' ? request.payerVpa : request.requesterVpa}
                    </Text>
                    <Text style={styles.dateText}>{formatDate(request.createdAt)}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <IconButton 
                      icon={getStatusIcon(request.status)} 
                      size={16} 
                      iconColor={getStatusColor(request.status)}
                      style={{ margin: 0 }}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                      {request.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <Text style={styles.amountValue}>
                    ₹{parseFloat(request.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>

                {request.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Note</Text>
                    <Text style={styles.descriptionText}>{request.description}</Text>
                  </View>
                )}

                {request.status === 'PENDING' && filter !== 'sent' && (
                  <View style={styles.actions}>
                    <Button 
                      mode="contained" 
                      onPress={() => handleAccept(request)}
                      style={styles.acceptButton}
                      buttonColor={colors.dark.primary}
                      textColor={colors.dark.background}
                      icon="check"
                    >
                      Accept & Pay
                    </Button>
                    <Button 
                      mode="outlined" 
                      onPress={() => handleReject(request.requestId)}
                      style={styles.rejectButton}
                      textColor={colors.dark.error}
                      icon="close"
                    >
                      Reject
                    </Button>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  filterContainer: {
    padding: spacing.md,
    backgroundColor: colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  segmentedButtons: {
    backgroundColor: colors.dark.cardElevated,
  },
  content: {
    padding: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.dark.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  vpaText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
  },
  dateText: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.cardElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: -4,
  },
  amountContainer: {
    backgroundColor: colors.dark.cardElevated,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.dark.primary,
  },
  descriptionContainer: {
    marginBottom: spacing.md,
  },
  descriptionLabel: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.dark.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  acceptButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
    borderColor: colors.dark.error,
  },
});
