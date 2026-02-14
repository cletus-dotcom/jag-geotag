/**
 * Serial Key Input Screen
 * Allows users to enter serial key for device activation
 */
import React, { useState } from 'react';
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
} from 'react-native';
import { registerSerialKey, getSerialKeyInfo } from '../services/serialKeyService';

export default function SerialKeyScreen({ onSuccess, onCancel }) {
  const [serialKey, setSerialKey] = useState('');
  const [processing, setProcessing] = useState(false);
  const [info, setInfo] = useState(null);

  React.useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    const keyInfo = await getSerialKeyInfo();
    setInfo(keyInfo);
  };

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
          <Text style={styles.title}>Serial Key Required</Text>
          <Text style={styles.subtitle}>
            Enter your serial key to activate the app on this device
          </Text>

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
              <Text style={styles.buttonText}>Activate App</Text>
            )}
          </TouchableOpacity>

          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>Need a Serial Key?</Text>
            <Text style={styles.helpText}>
              Contact the administrator to obtain a serial key for this device.
            </Text>
            <Text style={styles.helpText}>
              Each device requires a unique serial key. If you need to install on another device, you'll need a new serial key.
            </Text>
          </View>
        </View>
      </ScrollView>
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
});
