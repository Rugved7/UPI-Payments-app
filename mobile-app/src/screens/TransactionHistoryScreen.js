import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Chip, IconButton } from 'react-native-paper';
import { transactionAPI } from '../services/api';

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.getHistory();
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return '#4caf50';
      case 'FAILED': return '#f44336';
      case 'PENDING': return '#ff9800';
      case 'PROCESSING': return '#2196f3';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>Transaction History</Text>

          {!transactions || transactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>
                  Your transaction history will appear here
                </Text>
              </Card.Content>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.transactionId} style={styles.transactionCard}>
                <Card.Content>
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionInfo}>
                      <IconButton
                        icon={transaction.type === 'P2P_TRANSFER' ? 'swap-horizontal' : 'cash'}
                        size={24}
                        iconColor="#6200ee"
                      />
                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionAmount}>
                          ₹{transaction.amount.toFixed(2)}
                        </Text>
                        <Text style={styles.transactionVpa}>
                          {transaction.senderVpa} → {transaction.recieverVpa}
                        </Text>
                      </View>
                    </View>
                    <Chip 
                      mode="flat" 
                      style={[styles.statusChip, { backgroundColor: getStatusColor(transaction.status) }]}
                      textStyle={styles.statusText}
                    >
                      {transaction.status}
                    </Chip>
                  </View>

                  {transaction.description && (
                    <Text style={styles.description}>{transaction.description}</Text>
                  )}

                  <View style={styles.transactionFooter}>
                    <Text style={styles.transactionId}>
                      ID: {transaction.transactionId}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6200ee',
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
  transactionCard: {
    marginBottom: 15,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionVpa: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    marginLeft: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  transactionId: {
    fontSize: 10,
    color: '#999',
  },
  transactionDate: {
    fontSize: 10,
    color: '#999',
  },
});
