import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar, Dialog, Portal } from 'react-native-paper';
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
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Send Money</Text>

        <TextInput
          label="Receiver VPA (e.g., friend@paytm)"
          value={receiverVpa}
          onChangeText={setReceiverVpa}
          mode="outlined"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          label="Amount (₹)"
          value={amount}
          onChangeText={setAmount}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <Button 
          mode="contained" 
          onPress={handleContinue}
          style={styles.button}
        >
          Continue
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={showPinDialog} onDismiss={() => setShowPinDialog(false)}>
          <Dialog.Title>Enter UPI PIN</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.confirmText}>
              Send ₹{amount} to {receiverVpa}
            </Text>
            <TextInput
              label="UPI PIN"
              value={upiPin}
              onChangeText={setUpiPin}
              mode="outlined"
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              style={styles.pinInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPinDialog(false)}>Cancel</Button>
            <Button onPress={handleSendMoney} loading={loading}>
              Pay
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={3000}
      >
        {success}
      </Snackbar>
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
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  pinInput: {
    marginTop: 10,
  },
});
