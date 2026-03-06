import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, IconButton, Button } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import CustomHeader from '../components/CustomHeader';
import { qrCodeAPI } from '../services/api';
import { colors, spacing } from '../config/theme';

export default function QRScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);

    try {
      // Parse QR data
      const response = await qrCodeAPI.parse(data);
      const qrData = response.data.data;

      // Navigate to payment screen with pre-filled data
      navigation.replace('SendMoney', {
        prefilledVpa: qrData.vpa,
        prefilledAmount: qrData.amount?.toString() || '',
        prefilledDescription: qrData.description || '',
        fromQR: true,
      });
    } catch (error) {
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not a valid payment QR code. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            },
          },
        ]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Scan QR Code" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={styles.messageText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Scan QR Code" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <IconButton 
            icon="camera-off" 
            size={64} 
            iconColor={colors.dark.textSecondary}
          />
          <Text style={styles.messageText}>Camera permission is required</Text>
          <Text style={styles.subMessageText}>
            We need camera access to scan QR codes for payments
          </Text>
          <Button
            mode="contained"
            onPress={requestPermission}
            style={styles.permissionButton}
            buttonColor={colors.dark.primary}
          >
            Grant Permission
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Scan QR Code" onBack={() => navigation.goBack()} />

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Top overlay */}
            <View style={styles.overlayTop} />

            {/* Middle with scanning frame */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanFrame}>
                {/* Corner decorations */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
              <View style={styles.overlaySide} />
            </View>

            {/* Bottom overlay with instructions */}
            <View style={styles.overlayBottom}>
              <View style={styles.instructionsContainer}>
                <IconButton 
                  icon="qrcode-scan" 
                  size={32} 
                  iconColor={colors.dark.primary}
                  style={{ margin: 0 }}
                />
                <Text style={styles.instructionText}>
                  {processing ? 'Processing...' : 'Align QR code within the frame'}
                </Text>
                {scanned && (
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setScanned(false);
                      setProcessing(false);
                    }}
                    style={styles.scanAgainButton}
                    textColor={colors.dark.primary}
                  >
                    Scan Again
                  </Button>
                )}
              </View>
            </View>
          </View>
        </CameraView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subMessageText: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  permissionButton: {
    marginTop: spacing.md,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 300,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanFrame: {
    width: 300,
    height: 300,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.dark.primary,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  instructionText: {
    fontSize: 16,
    color: colors.dark.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  scanAgainButton: {
    marginTop: spacing.md,
    borderColor: colors.dark.primary,
  },
});
