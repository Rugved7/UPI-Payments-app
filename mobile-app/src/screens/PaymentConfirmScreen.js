import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { colors, spacing } from '../config/theme';

export default function PaymentConfirmScreen({ navigation, route }) {
  const { receiverVpa, amount, description, onSuccess } = route.params;
  const [upiPin, setUpiPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    if (!upiPin || upiPin.length !== 4) {
      setError('Please enter 4-digit UPI PIN');
      return;
    }

    setLoading(true);
    try {
      await onSuccess(upiPin);
      // Navigate to success screen
      navigation.replace('PaymentSuccess', { 
        receiverVpa, 
        amount,
        description 
      });
    } catch (err) {
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          iconColor={colors.dark.text}
          onPress={() => navigation.goBack()}
          style={{ margin: 0 }}
        />
        <Text style={styles.headerTitle}>Confirm Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Payment Details */}
        <View style={styles.detailsCard}>
          <View style={styles.iconCircle}>
            <IconButton 
              icon="account-circle" 
              size={40} 
              iconColor={colors.dark.primary}
              style={{ margin: 0 }}
            />
          </View>

          <Text style={styles.label}>Paying to</Text>
          <Text style={styles.vpa}>{receiverVpa}</Text>

          <View style={styles.amountContainer}>
            <Text style={styles.currency}>₹</Text>
            <Text style={styles.amount}>
              {parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {description && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionLabel}>Note</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          )}
        </View>

        {/* UPI PIN Input */}
        <View style={styles.pinSection}>
          <Text style={styles.pinLabel}>Enter UPI PIN</Text>
          <TextInput
            value={upiPin}
            onChangeText={setUpiPin}
            mode="outlined"
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
            autoFocus
            style={styles.pinInput}
            outlineColor={colors.dark.border}
            activeOutlineColor={colors.dark.primary}
            textColor={colors.dark.text}
            theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
            error={!!error}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Pay Button */}
        <Button 
          mode="contained" 
          onPress={handlePay}
          loading={loading}
          disabled={loading || upiPin.length !== 4}
          style={styles.payButton}
          buttonColor={colors.dark.primary}
          textColor={colors.dark.background}
          contentStyle={styles.payButtonContent}
          labelStyle={styles.payButtonLabel}
          icon="check"
        >
          Pay Now
        </Button>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <IconButton 
            icon="shield-check" 
            size={16} 
            iconColor={colors.dark.success}
            style={{ margin: 0 }}
          />
          <Text style={styles.securityText}>
            Your payment is secured with bank-level encryption
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  detailsCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.dark.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs,
  },
  vpa: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: spacing.lg,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  currency: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.dark.primary,
    marginTop: 4,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.dark.primary,
  },
  descriptionBox: {
    width: '100%',
    backgroundColor: colors.dark.cardElevated,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
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
  pinSection: {
    marginBottom: spacing.xl,
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: spacing.md,
  },
  pinInput: {
    backgroundColor: colors.dark.surface,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.dark.error,
    marginTop: spacing.sm,
  },
  payButton: {
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  payButtonContent: {
    paddingVertical: spacing.md,
  },
  payButtonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  securityText: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
});
