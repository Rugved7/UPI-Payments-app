import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { TextInput, Button, Text, Card, Chip, FAB, Portal, Dialog, IconButton, Snackbar } from 'react-native-paper';
import { vpaAPI } from '../services/api';

export default function VPAManagementScreen() {
  const [vpas, setVpas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [newVpa, setNewVpa] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadVpas();
  }, []);

  const loadVpas = async () => {
    try {
      const response = await vpaAPI.getAll();
      setVpas(response.data.data || []);
    } catch (error) {
      console.error('Error loading VPAs:', error);
      setVpas([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVpas();
    setRefreshing(false);
  };

  const handleCreateVpa = async () => {
    if (!newVpa) {
      setError('Please enter a VPA');
      return;
    }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/.test(newVpa)) {
      setError('VPA format: username@bank (e.g., rugved@ybl)');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        vpa: newVpa,
        isPrimary: !vpas || vpas.length === 0,
      };
      console.log('Creating VPA with data:', requestData);
      
      await vpaAPI.create(requestData);
      setSuccess('VPA created successfully!');
      setNewVpa('');
      setShowDialog(false);
      await loadVpas();
    } catch (error) {
      console.error('VPA creation error:', error);
      setError(error.response?.data?.message || 'Failed to create VPA');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (vpa) => {
    try {
      await vpaAPI.setPrimary(vpa);
      setSuccess('Primary VPA updated!');
      await loadVpas();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to set primary VPA');
    }
  };

  const handleDeleteVpa = async (vpa) => {
    try {
      await vpaAPI.delete(vpa);
      setSuccess('VPA deleted successfully!');
      await loadVpas();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete VPA');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>My VPAs</Text>
          <Text style={styles.subtitle}>
            Virtual Payment Addresses for receiving money
          </Text>

          {!vpas || vpas.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No VPAs yet</Text>
                <Text style={styles.emptySubtext}>
                  Create your first VPA to start receiving money
                </Text>
              </Card.Content>
            </Card>
          ) : (
            vpas.map((vpa) => (
              <Card key={vpa.id} style={styles.vpaCard}>
                <Card.Content>
                  <View style={styles.vpaHeader}>
                    <View style={styles.vpaInfo}>
                      <Text style={styles.vpaText}>{vpa.vpa}</Text>
                      {vpa.isPrimary && (
                        <Chip mode="flat" style={styles.primaryChip}>
                          Primary
                        </Chip>
                      )}
                    </View>
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDeleteVpa(vpa.vpa)}
                    />
                  </View>
                  {!vpa.isPrimary && (
                    <Button
                      mode="outlined"
                      onPress={() => handleSetPrimary(vpa.vpa)}
                      style={styles.setPrimaryButton}
                    >
                      Set as Primary
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowDialog(true)}
      />

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Create New VPA</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="VPA (e.g., yourname@paytm)"
              value={newVpa}
              onChangeText={setNewVpa}
              mode="outlined"
              autoCapitalize="none"
              placeholder="username@bank"
            />
            <Text style={styles.helperText}>
              Format: username@bank (e.g., rugved@ybl)
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancel</Button>
            <Button onPress={handleCreateVpa} loading={loading}>
              Create
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
    marginBottom: 5,
    color: '#6200ee',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
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
  vpaCard: {
    marginBottom: 15,
  },
  vpaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vpaInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vpaText: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryChip: {
    backgroundColor: '#6200ee',
  },
  setPrimaryButton: {
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
