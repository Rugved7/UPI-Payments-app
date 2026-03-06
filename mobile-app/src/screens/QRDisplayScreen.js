import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Text, Button, IconButton, ActivityIndicator } from 'react-native-paper';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import CustomHeader from '../components/CustomHeader';
import { qrCodeAPI } from '../services/api';
import { colors, spacing } from '../config/theme';

export default function QRDisplayScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    try {
      setLoading(true);
      const response = await qrCodeAPI.generateStatic();
      setQrData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!qrData?.qrImage) return;

    try {
      const fileUri = FileSystem.cacheDirectory + 'my-qr-code.png';
      await FileSystem.writeAsStringAsync(fileUri, qrData.qrImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share QR Code',
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader title="My QR Code" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.dark.primary} />
          <Text style={styles.loadingText}>Generating QR Code...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <CustomHeader title="My QR Code" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <IconButton icon="alert-circle" size={64} iconColor={colors.dark.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={loadQRCode} buttonColor={colors.dark.primary}>
            Retry
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="My QR Code" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <IconButton 
            icon="information" 
            size={20} 
            iconColor={colors.dark.info}
            style={{ margin: 0 }}
          />
          <Text style={styles.infoText}>
            Show this QR code to receive payments. Anyone can scan it to pay you.
          </Text>
        </View>

        {/* QR Code Card */}
        <View style={styles.qrCard}>
          <View style={styles.qrContainer}>
            {qrData?.qrImage && (
              <Image
                source={{ uri: `data:image/png;base64,${qrData.qrImage}` }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            )}
          </View>

          {/* User Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.nameText}>{qrData?.name}</Text>
            <Text style={styles.vpaText}>{qrData?.vpa}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleShare}
            style={styles.shareButton}
            buttonColor={colors.dark.primary}
            textColor={colors.dark.background}
            contentStyle={styles.buttonContent}
            icon="share-variant"
          >
            Share QR Code
          </Button>

          <Button
            mode="outlined"
            onPress={loadQRCode}
            style={styles.refreshButton}
            textColor={colors.dark.primary}
            contentStyle={styles.buttonContent}
            icon="refresh"
          >
            Refresh
          </Button>
        </View>

        {/* Security Info */}
        <View style={styles.securityCard}>
          <IconButton 
            icon="shield-check" 
            size={20} 
            iconColor={colors.dark.success}
            style={{ margin: 0 }}
          />
          <View style={styles.securityText}>
            <Text style={styles.securityTitle}>Secure Payment</Text>
            <Text style={styles.securitySubtitle}>
              This QR code is linked to your primary VPA and is safe to share
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.dark.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.dark.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  infoCard: {
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
  qrCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginBottom: spacing.lg,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  detailsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark.text,
    marginBottom: spacing.xs,
  },
  vpaText: {
    fontSize: 16,
    color: colors.dark.primary,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  shareButton: {
    borderRadius: 12,
  },
  refreshButton: {
    borderRadius: 12,
    borderColor: colors.dark.primary,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  securityText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 2,
  },
  securitySubtitle: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    lineHeight: 16,
  },
});
