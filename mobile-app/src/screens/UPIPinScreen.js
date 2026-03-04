import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, Snackbar } from 'react-native-paper';
import { upiPinAPI } from '../services/api';

export default function UPIPinScreen() {
  const [pin, setPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState('set'); // 'set' or 'change'

  const handleSetPin = async () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    try {
      await upiPinAPI.set(pin);
      setSuccess('UPI PIN set successfully!');
      setPin('');
      setTimeout(() => setMode('change'), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (oldPin.length !== 4 || newPin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PIN and Confirm PIN do not match');
      return;
    }

    setLoading(true);
    try {
      await upiPinAPI.change(oldPin, newPin);
      setSuccess('UPI PIN changed successfully!');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>
              {mode === 'set' ? 'Set UPI PIN' : 'Change UPI PIN'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'set' 
                ? 'Create a 4-digit PIN for secure transactions'
                : 'Update your UPI PIN'}
            </Text>

            {mode === 'set' ? (
              <>
                <TextInput
                  label="Enter 4-digit PIN"
                  value={pin}
                  onChangeText={setPin}
                  mode="outlined"
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={4}
                  style={styles.input}
                />

                <Button 
                  mode="contained" 
                  onPress={handleSetPin}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Set PIN
                </Button>

                <Button 
                  mode="text" 
                  onPress={() => setMode('change')}
                  style={styles.linkButton}
                >
                  Already have a PIN? Change it
                </Button>
              </>
            ) : (
              <>
                <TextInput
                  label="Old PIN"
                  value={oldPin}
                  onChangeText={setOldPin}
                  mode="outlined"
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={4}
                  style={styles.input}
                />

                <TextInput
                  label="New PIN"
                  value={newPin}
                  onChangeText={setNewPin}
                  mode="outlined"
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={4}
                  style={styles.input}
                />

                <TextInput
                  label="Confirm New PIN"
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  mode="outlined"
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={4}
                  style={styles.input}
                />

                <Button 
                  mode="contained" 
                  onPress={handleChangePin}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Change PIN
                </Button>

                <Button 
                  mode="text" 
                  onPress={() => setMode('set')}
                  style={styles.linkButton}
                >
                  Set new PIN instead
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>Security Tips:</Text>
            <Text style={styles.infoText}>• Use a unique 4-digit PIN</Text>
            <Text style={styles.infoText}>• Don't share your PIN with anyone</Text>
            <Text style={styles.infoText}>• Change your PIN regularly</Text>
            <Text style={styles.infoText}>• Don't use obvious PINs like 1234</Text>
          </Card.Content>
        </Card>
      </View>

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
    </ScrollView>
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
  card: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6200ee',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  linkButton: {
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
});
