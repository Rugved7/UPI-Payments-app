import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Snackbar, Dialog, Portal, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { transactionAPI } from '../services/api';

export default function SendMoneyScreen({ navigation }) {
  const [receiverVpa, setReceiverVpa] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [success, setSuccess] = useState('');

  const handleContinue = () => {
    if (!receiverVpa || !amount) {
      setError('Please fill receiver VPA and amount');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setShowPinDialog(true);
  };

  const handleSendMoney = async () => {
    if (!upiPin || upiPin.length !== 4) {
      setError('Please enter 4-digit UPI PIN');
      return;
    }

    setLoading(true);
    try {
      const response = await transactionAPI.transfer({
        recieverVpa: receiverVpa,
        amount: parseFloat(amount),
        description,
        upiPin,
      });

      setLoading(false);
      setShowPinDialog(false);

      if (response.data.success) {
        setSuccess('Money sent successfully!');
        setTimeout(() => navigation.goBack(), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      setShowPinDialog(false);
      setError(error.response?.data?.message || 'Transaction failed');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#6200ee', '#7c3aed']}
        style={styles.header}
      >
        <IconButton 
          icon="arrow-left" 
          size={24} 
          iconColor="#fff" 
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <IconButton icon="account-circle" size={24} iconColor="#6200ee" />
            <TextInput
              label="Receiver VPA"
              value={receiverVpa}
              onChangeText={setReceiverVpa}
              mode="flat"
              autoCapitalize="none"
              placeholder="friend@paytm"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
          </View>

          <View style={styles.inputContainer}>
            <IconButton icon="currency-inr" size={24} iconColor="#6200ee" />
            <TextInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              mode="flat"
              keyboardType="numeric"
              placeholder="0.00"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
          </View>

          <View style={styles.inputContainer}>
            <IconButton icon="message-text" size={24} iconColor="#6200ee" />
            <TextInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              mode="flat"
              placeholder="Add a note"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
          </View>
        </View>

        <Button 
          mode="contained" 
          onPress={handleContinue}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Continue to Pay
        </Button>

        <View style={styles.infoBox}>
          <IconButton icon="information" size={20} iconColor="#6200ee" />
          <Text style={styles.infoText}>
            Transaction limits: ₹50,000 per transaction, ₹1,00,000 daily
          </Text>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={showPinDialog} onDismiss={() => setShowPinDialog(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Enter UPI PIN</Dialog.Title>
          <Dialog.Content>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmLabel}>Paying to</Text>
              <Text style={styles.confirmVpa}>{receiverVpa}</Text>
              <Text style={styles.confirmAmount}>₹{parseFloat(amount || 0).toLocaleString('en-IN')}</Text>
            </View>
            <TextInput
              label="UPI PIN"
              value={upiPin}
              onChangeText={setUpiPin}
              mode="outlined"
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              style={styles.pinInput}
              outlineColor="#e0e0e0"
              activeOutlineColor="#6200ee"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPinDialog(false)} textColor="#666">
              Cancel
            </Button>
            <Button 
              onPress={handleSendMoney} 
              loading={loading}
              mode="contained"
              style={styles.payButton}
            >
              Pay Now
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  button: {
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: '#6200ee',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0ff',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  dialog: {
    borderRadius: 20,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confirmBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 14,
    color: '#666',
  },
  confirmVpa: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
  },
  confirmAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 8,
  },
  pinInput: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  payButton: {
    marginLeft: 8,
  },
  errorSnackbar: {
    backgroundColor: '#f44336',
  },
  successSnackbar: {
    backgroundColor: '#4caf50',
  },
});
