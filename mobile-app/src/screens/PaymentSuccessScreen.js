import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { colors, spacing } from '../config/theme';

export default function PaymentSuccessScreen({ navigation, route }) {
  const { receiverVpa, amount, description } = route.params;
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate success icon
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in details
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDone = () => {
    // Reset navigation stack to Home
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleViewDetails = () => {
    // Navigate to transaction history and reset stack
    navigation.reset({
      index: 1,
      routes: [
        { name: 'Home' },
        { name: 'TransactionHistory' },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View 
          style={[
            styles.successCircle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View
            style={{
              opacity: checkAnim,
            }}
          >
            <IconButton 
              icon="check" 
              size={64} 
              iconColor={colors.dark.background}
              style={{ margin: 0 }}
            />
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.detailsContainer, { opacity: fadeAnim }]}>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>Your money has been sent</Text>

          {/* Amount */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount Paid</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>₹</Text>
              <Text style={styles.amount}>
                {parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To</Text>
              <Text style={styles.detailValue}>{receiverVpa}</Text>
            </View>
            
            {description && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Note</Text>
                <Text style={styles.detailValue}>{description}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {new Date().toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button 
              mode="contained" 
              onPress={handleDone}
              style={styles.doneButton}
              buttonColor={colors.dark.primary}
              textColor={colors.dark.background}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="home"
            >
              Done
            </Button>

            <Button 
              mode="outlined" 
              onPress={handleViewDetails}
              style={styles.detailsButton}
              textColor={colors.dark.primary}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="receipt"
            >
              View Details
            </Button>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.dark.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  detailsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.dark.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  amountCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.dark.primary,
    marginTop: 4,
  },
  amount: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.dark.primary,
  },
  detailsCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.text,
    flex: 2,
    textAlign: 'right',
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  doneButton: {
    borderRadius: 16,
  },
  detailsButton: {
    borderRadius: 16,
    borderColor: colors.dark.primary,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
