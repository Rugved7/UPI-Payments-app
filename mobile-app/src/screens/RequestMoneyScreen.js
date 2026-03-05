import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Snackbar, IconButton, Chip } from 'react-native-paper';
import CustomHeader from '../components/CustomHeader';
import { paymentRequestAPI, vpaAPI } from '../services/api';
import { colors, spacing } from '../config/theme';

export default function RequestMoneyScreen({ navigation }) {
  const [payerVpa, setPayerVpa] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [vpaVerified, setVpaVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerifyVpa = async () => {
    if (!payerVpa) {
      setError('Please enter payer VPA');
      return;
    }

    setVerifying(true);
    try {
      const response = await vpaAPI.checkAvailability(payerVpa);
      const isAvailable = response.data.data;
      
      if (!isAvailable) {
        setVpaVerified(true);
        setError('');
      } else {
        setVpaVerified(false);
        setError('This VPA does not exist. Please check and try again.');
      }
    } catch (error) {
      setVpaVerified(false);
      setError('Failed to verify VPA. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRequestMoney = async () => {
    if (!payerVpa || !amount) {
      setError('Please fill all required fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!vpaVerified) {
      setError('Please verify the payer VPA first');
      return;
    }

    setLoading(true);
    try {
      await paymentRequestAPI.create({
        payerVpa,
        amount: parseFloat(amount),
        description,
      });

      setSuccess('Payment request sent successfully!');
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleVpaChange = (text) => {
    setPayerVpa(text);
    setVpaVerified(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomHeader 
        title="Request Money" 
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* VPA Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>From</Text>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <IconButton 
                  icon="account-circle" 
                  size={20} 
                  iconColor={colors.dark.primary}
                  style={{ margin: 0 }}
                />
              </View>
              <TextInput
                label="Payer VPA"
                value={payerVpa}
                onChangeText={handleVpaChange}
                mode="flat"
                autoCapitalize="none"
                placeholder="friend@paytm"
                style={styles.input}
                textColor={colors.dark.text}
                theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
              />
            </View>

            {payerVpa && !vpaVerified && (
              <Button 
                mode="outlined" 
                onPress={handleVerifyVpa}
                loading={verifying}
                style={styles.verifyButton}
                textColor={colors.dark.primary}
                icon="shield-check"
              >
                Verify VPA
              </Button>
            )}

            {vpaVerified && (
              <View style={styles.verifiedContainer}>
                <Chip 
                  icon="check-circle" 
                  mode="flat"
                  style={styles.verifiedChip}
                  textStyle={styles.verifiedText}
                >
                  VPA Verified
                </Chip>
              </View>
            )}
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <IconButton 
                  icon="currency-inr" 
                  size={20} 
                  iconColor={colors.dark.primary}
                  style={{ margin: 0 }}
                />
              </View>
              <TextInput
                label="Enter Amount"
                value={amount}
                onChangeText={setAmount}
                mode="flat"
                keyboardType="numeric"
                placeholder="0.00"
                style={styles.input}
                textColor={colors.dark.text}
                theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
              />
            </View>
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note (Optional)</Text>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <IconButton 
                  icon="message-text" 
                  size={20} 
                  iconColor={colors.dark.primary}
                  style={{ margin: 0 }}
                />
              </View>
              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="flat"
                placeholder="What's this for?"
                style={styles.input}
                textColor={colors.dark.text}
                theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                multiline
              />
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <IconButton 
            icon="information" 
            size={20} 
            iconColor={colors.dark.info}
            style={{ margin: 0 }}
          />
          <Text style={styles.infoText}>
            {vpaVerified 
              ? 'VPA verified. You can send the request.' 
              : 'Please verify the payer VPA before proceeding.'}
          </Text>
        </View>

        {/* Send Button */}
        <Button 
          mode="contained" 
          onPress={handleRequestMoney}
          loading={loading}
          disabled={!vpaVerified}
          style={styles.button}
          buttonColor={colors.dark.primary}
          textColor={colors.dark.background}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="send"
        >
          Send Request
        </Button>

        <View style={{ height: 32 }} />
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={3000}
        style={styles.successSnackbar}
      >
        {success}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.dark.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.dark.surface,
  },
  verifyButton: {
    margin: spacing.md,
    borderColor: colors.dark.primary,
  },
  verifiedContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  verifiedChip: {
    backgroundColor: colors.dark.success,
  },
  verifiedText: {
    color: colors.dark.background,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.cardElevated,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.dark.textSecondary,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorSnackbar: {
    backgroundColor: colors.dark.error,
  },
  successSnackbar: {
    backgroundColor: colors.dark.success,
  },
});
