/**
 * QR Code Scanner Screen
 * Scans QR codes for subscription approval
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { approveSubscriptionWithQRCode } from '../services/subscriptionService';

export default function QRScannerScreen({ onScanSuccess, onCancel }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }) => {
    if (processing || !scanning) return;
    
    setScanning(false);
    setProcessing(true);

    try {
      const result = await approveSubscriptionWithQRCode(data);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Subscription approved! The app is now active.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onScanSuccess) onScanSuccess();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Invalid QR Code',
          result.error || 'The scanned QR code is not valid. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => setScanning(true),
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                if (onCancel) onCancel();
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to process QR code. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => setScanning(true),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              if (onCancel) onCancel();
            },
          },
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera access is needed to scan QR codes.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanning && !processing ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instruction}>
            Position the QR code within the frame
          </Text>
          {processing && (
            <View style={styles.processing}>
              <ActivityIndicator size="large" color="#4ade80" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}
        </View>
      </CameraView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            if (onCancel) onCancel();
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4ade80',
    borderTopWidth: 4,
    borderLeftWidth: 4,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    fontWeight: '600',
  },
  processing: {
    marginTop: 20,
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  footer: {
    padding: 20,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#16213e',
  },
  cancelButton: {
    backgroundColor: '#64748b',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    color: '#e2e8f0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#0f0f1a',
    fontWeight: '700',
    fontSize: 16,
  },
});
