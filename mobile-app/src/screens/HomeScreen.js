import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, FAB, Badge, IconButton } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { walletAPI, notificationAPI } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [balance, setBalance] = useState(0);
  const [wallet, setWallet] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceRes, walletRes, notifRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getWallet(),
        notificationAPI.getUnreadCount(),
      ]);
      
      setBalance(balanceRes.data.data);
      setWallet(walletRes.data.data);
      setUnreadCount(notifRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>UPI Payment</Text>
        <View style={styles.headerRight}>
          <IconButton
            icon="bell"
            size={24}
            onPress={() => navigation.navigate('Notifications')}
          />
          {unreadCount > 0 && (
            <Badge style={styles.badge}>{unreadCount}</Badge>
          )}
          <IconButton
            icon="logout"
            size={24}
            onPress={logout}
          />
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.balanceCard}>
          <Card.Content>
            <Text style={styles.balanceLabel}>Wallet Balance</Text>
            <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
            {wallet && (
              <View style={styles.limitsContainer}>
                <Text style={styles.limitText}>
                  Daily Limit: ₹{wallet.dailyLimit}
                </Text>
                <Text style={styles.limitText}>
                  Daily Spent: ₹{wallet.dailySpent}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.actionsGrid}>
          <Card style={styles.actionCard} onPress={() => navigation.navigate('SendMoney')}>
            <Card.Content style={styles.actionContent}>
              <IconButton icon="send" size={40} iconColor="#6200ee" />
              <Text style={styles.actionText}>Send Money</Text>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard} onPress={() => navigation.navigate('VPAManagement')}>
            <Card.Content style={styles.actionContent}>
              <IconButton icon="account-circle" size={40} iconColor="#6200ee" />
              <Text style={styles.actionText}>My VPAs</Text>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard} onPress={() => navigation.navigate('TransactionHistory')}>
            <Card.Content style={styles.actionContent}>
              <IconButton icon="history" size={40} iconColor="#6200ee" />
              <Text style={styles.actionText}>History</Text>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard} onPress={() => navigation.navigate('UPIPin')}>
            <Card.Content style={styles.actionContent}>
              <IconButton icon="lock" size={40} iconColor="#6200ee" />
              <Text style={styles.actionText}>UPI PIN</Text>
            </Card.Content>
          </Card>
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
    backgroundColor: '#6200ee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 45,
  },
  balanceCard: {
    margin: 15,
    backgroundColor: '#6200ee',
  },
  balanceLabel: {
    color: 'white',
    fontSize: 16,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  limitsContainer: {
    marginTop: 10,
  },
  limitText: {
    color: 'white',
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  actionCard: {
    width: '47%',
    margin: '1.5%',
    height: 120,
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '500',
  },
});
