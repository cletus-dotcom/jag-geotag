/**
 * Serial Key Input Screen
 * Get serial number via gateway; enter key, or scan/upload QR to activate
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { registerSerialKey, getSerialKeyInfo } from '../services/serialKeyService';
import { approveSubscriptionWithQRCode } from '../services/subscriptionService';
import { decodeQRFromImageUri, isQRImageDecodeAvailable } from '../utils/decodeQRFromImage';
import QRScannerScreen from './QRScannerScreen';

function isSerialKeyFormat(code) {
  if (!code || typeof code !== 'string') return false;
  const parts = code.trim().toUpperCase().split('-');
  if (parts.length !== 5 || parts[0] !== 'JAG') return false;
  return parts.slice(1).every((p) => p.length === 4 && /^[A-Z0-9]+$/.test(p));
}

function isSubscriptionQRFormat(code) {
  if (!code || typeof code !== 'string') return false;
  const parts = code.trim().split('-');
  return parts.length === 3 && parts[0] === 'JAG' && /^\d+$/.test(parts[1]);
}

export default function SerialKeyScreen({ onSuccess, onCancel, openGetSerialNumberGateway }) {
  const [serialKey, setSerialKey] = useState('');
  const [processing, setProcessing] = useState(false);
  const [info, setInfo] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    const keyInfo = await getSerialKeyInfo();
    setInfo(keyInfo);
  };

  const handleScannedCode = useCallback(async (code) => {
    const trimmed = (code || '').trim();
    if (!trimmed) return { success: false, error: 'Empty code' };
    try {
      if (isSerialKeyFormat(trimmed)) {
        const result = await registerSerialKey(trimmed);
        if (result.success) {
          return { success: true, message: 'Serial key registered. App is now activated.' };
        }
        return { success: false, error: result.error || 'Invalid serial key' };
      }
      if (isSubscriptionQRFormat(trimmed)) {
        const result = await approveSubscriptionWithQRCode(trimmed);
        if (result.success) {
          return { success: true, message: 'Subscription approved. App is now active.' };
        }
        return { success: false, error: result.error || 'Invalid subscription QR code' };
      }
      return { success: false, error: 'Unrecognized code format. Use a serial key or subscription QR code.' };
    } catch (e) {
      return { success: false, error: e?.message || 'Failed to process code' };
    }
  }, []);

  const handleQRScanSuccess = useCallback(() => {
    setShowQRScanner(false);
    if (onSuccess) onSuccess();
  }, [onSuccess]);

  const handleUploadQR = useCallback(async () => {
    if (!isQRImageDecodeAvailable()) {
      Alert.alert(
        'Upload not available',
        'QR decode from image is not available in this build. Please use Scan QR Code instead.',
        [{ text: 'OK' }]
      );
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to pick an image.');
      return;
    }
    setUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]?.uri) {
        setUploading(false);
        return;
      }
      const uri = result.assets[0].uri;
      const decoded = await decodeQRFromImageUri(uri);
      if (!decoded) {
        Alert.alert('Could not read QR code', 'Use a clear image of the QR code, or use Scan QR Code instead.');
        setUploading(false);
        return;
      }
      const handleResult = await handleScannedCode(decoded);
      if (handleResult.success) {
        Alert.alert('Success', handleResult.message, [{ text: 'OK', onPress: () => onSuccess && onSuccess() }]);
      } else {
        Alert.alert('Invalid code', handleResult.error || 'Could not activate.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to read image.');
    } finally {
      setUploading(false);
    }
  }, [handleScannedCode, onSuccess]);

  const handleSubmit = async () => {
    const trimmedKey = serialKey.trim().toUpperCase();
    
    if (!trimmedKey) {
      Alert.alert('Error', 'Please enter a serial key');
      return;
    }

    // Validate format
    const parts = trimmedKey.split('-');
    if (parts.length !== 5 || parts[0] !== 'JAG') {
      Alert.alert(
        'Invalid Format',
        'Serial key format: JAG-XXXX-XXXX-XXXX-XXXX\n\nExample: JAG-A1B2-C3D4-E5F6-G7H8'
      );
      return;
    }

    setProcessing(true);
    try {
      const result = await registerSerialKey(trimmedKey);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Serial key registered successfully! The app is now activated.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSuccess) onSuccess();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to register serial key');
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'An error occurred while registering the serial key');
    } finally {
      setProcessing(false);
    }
  };

  const formatSerialKey = (text) => {
    // Remove all non-alphanumeric characters
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Format as JAG-XXXX-XXXX-XXXX-XXXX
    let formatted = 'JAG-';
    let remaining = cleaned.replace(/^JAG/i, '');
    
    for (let i = 0; i < remaining.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += '-';
      }
      formatted += remaining[i];
    }
    
    return formatted;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {onCancel && (
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Serial Number Required</Text>
          <Text style={styles.subtitle}>
            Get your serial number by paying at the gateway. Then enter it below, or scan/upload your QR code to activate.
          </Text>

          {openGetSerialNumberGateway && (
            <View style={styles.getSerialBox}>
              <Text style={styles.getSerialTitle}>Get serial number</Text>
              <Text style={styles.getSerialText}>Pay at the subscription gateway. After payment, return here and scan or upload your QR code.</Text>
              <TouchableOpacity style={styles.getSerialButton} onPress={openGetSerialNumberGateway}>
                <Text style={styles.getSerialButtonText}>Get Serial Number</Text>
              </TouchableOpacity>
            </View>
          )}

          {info?.registered && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ✓ Serial key already registered on this device
              </Text>
              <Text style={styles.infoSubtext}>
                Device ID: {info.deviceId?.substring(0, 8)}...
              </Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Serial Key</Text>
            <TextInput
              style={styles.input}
              value={serialKey}
              onChangeText={(text) => setSerialKey(formatSerialKey(text))}
              placeholder="JAG-XXXX-XXXX-XXXX-XXXX"
              placeholderTextColor="#64748b"
              autoCapitalize="characters"
              maxLength={24} // JAG-XXXX-XXXX-XXXX-XXXX = 24 chars
              editable={!processing}
            />
            <Text style={styles.hint}>
              Format: JAG-XXXX-XXXX-XXXX-XXXX
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, processing && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#0f0f1a" />
            ) : (
              <Text style={styles.buttonText}>Activate with serial key</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.orLabel}>— or activate with QR code —</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setShowQRScanner(true)}
            disabled={processing}
          >
            <Text style={styles.buttonTextSecondary}>📷 Scan QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, uploading && styles.buttonDisabled]}
            onPress={handleUploadQR}
            disabled={processing || uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#94a3b8" />
            ) : (
              <Text style={styles.buttonTextSecondary}>📤 Upload QR Code</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showQRScanner && (
        <Modal visible={showQRScanner} animationType="slide" onRequestClose={() => setShowQRScanner(false)}>
          <QRScannerScreen
            onScannedCode={handleScannedCode}
            onScanSuccess={handleQRScanSuccess}
            onCancel={() => setShowQRScanner(false)}
          />
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoSubtext: {
    color: '#94a3b8',
    fontSize: 12,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    color: '#e2e8f0',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
    textAlign: 'center',
  },
  hint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0f0f1a',
    fontSize: 16,
    fontWeight: '700',
  },
  helpBox: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#16213e',
    borderRadius: 12,
    padding: 16,
  },
  helpTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButtonText: {
    color: '#94a3b8',
    fontSize: 20,
    fontWeight: '600',
  },
  getSerialBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  getSerialTitle: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  getSerialText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  getSerialButton: {
    backgroundColor: '#38bdf8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  getSerialButtonText: {
    color: '#0f0f1a',
    fontSize: 15,
    fontWeight: '700',
  },
  orLabel: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#475569',
    marginBottom: 12,
  },
  buttonTextSecondary: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
  },
});
