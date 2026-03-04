import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Text, IconButton, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { walletAPI, notificationAPI } from '../services/api';

const { width } = Dimensions.get('window');

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

  const QuickAction = ({ icon, label, onPress, badge }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.quickActionGradient}
      >
        <View style={styles.quickActionIconContainer}>
          <IconButton icon={icon} size={32} iconColor="#6200ee" />
          {badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.quickActionText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6200ee', '#7c3aed', '#9333ea']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar.Text 
              size={48} 
              label={user?.firstName?.charAt(0) || 'U'} 
              style={styles.avatar}
              color="#6200ee"
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Welcome back</Text>
              <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <IconButton icon="bell-outline" size={24} iconColor="#fff" />
              {unreadCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <IconButton icon="logout" size={24} iconColor="#fff" onPress={logout} />
          </View>
        </View>

        <View style={styles.balanceCardContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            {wallet && (
              <View style={styles.limitsRow}>
                <View style={styles.limitItem}>
                  <Text style={styles.limitLabel}>Daily Limit</Text>
                  <Text style={styles.limitValue}>₹{parseFloat(wallet.dailyLimit).toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.limitDivider} />
                <View style={styles.limitItem}>
                  <Text style={styles.limitLabel}>Spent Today</Text>
                  <Text style={styles.limitValue}>₹{parseFloat(wallet.dailySpent).toLocaleString('en-IN')}</Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction 
            icon="send" 
            label="Send Money" 
            onPress={() => navigation.navigate('SendMoney')}
          />
          <QuickAction 
            icon="account-circle-outline" 
            label="My VPAs" 
            onPress={() => navigation.navigate('VPAManagement')}
          />
          <QuickAction 
            icon="history" 
            label="History" 
            onPress={() => navigation.navigate('TransactionHistory')}
          />
          <QuickAction 
            icon="lock-outline" 
            label="UPI PIN" 
            onPress={() => navigation.navigate('UPIPin')}
          />
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <IconButton icon="shield-check" size={28} iconColor="#4caf50" />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Secure & Fast Payments</Text>
                <Text style={styles.infoSubtitle}>All transactions are encrypted and protected</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#fff',
  },
  avatarLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerText: {
    marginLeft: 12,
  },
  greeting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  balanceCardContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
  },
  limitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  limitItem: {
    flex: 1,
  },
  limitDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  limitLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  limitValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  quickAction: {
    width: (width - 48) / 2,
    padding: 8,
  },
  quickActionGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  bottomSpace: {
    height: 30,
  },
});
