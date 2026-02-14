import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { loadMetadataList, deleteGeoPhoto } from '../storage/geoStorage';
import { createKmzFromPhoto } from '../utils/createKmz';

function formatAccuracy(meters) {
  if (meters == null || typeof meters !== 'number') return '—';
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
}

export default function GalleryScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [savingToPhone, setSavingToPhone] = useState(false);
  const [savingKmz, setSavingKmz] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const list = await loadMetadataList();
      setItems(list.slice().reverse());
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleDelete = useCallback(
    (item) => {
      Alert.alert('Delete photo', 'Remove this geo-tagged photo from the app?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGeoPhoto(item.filename);
            setSelected(null);
            refresh();
          },
        },
      ]);
    },
    [refresh]
  );

  const saveSelectedToPhone = useCallback(async () => {
    if (!selected?.uri) return;
    setSavingToPhone(true);
    try {
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission required', 'Allow Photos/Gallery permission to save the image to your phone.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(selected.uri);
      Alert.alert('Saved', 'Photo saved to your phone Photos/Gallery.');
    } catch (e) {
      Alert.alert('Save failed', e?.message || 'Could not save photo to your phone.');
    } finally {
      setSavingToPhone(false);
    }
  }, [selected]);

  const saveSelectedAsKmz = useCallback(async () => {
    if (!selected?.uri) return;
    const lat = selected.latitude;
    const lon = selected.longitude;
    if (lat == null || lon == null) {
      Alert.alert('No coordinates', 'This photo has no location data; cannot create KMZ.');
      return;
    }
    setSavingKmz(true);
    try {
      const kmzUri = await createKmzFromPhoto(selected.uri, selected);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(kmzUri, {
          mimeType: 'application/vnd.google-earth.kmz',
          dialogTitle: 'Save as KMZ (open in Google Earth)',
        });
      } else {
        Alert.alert('Saved', 'KMZ file created. Sharing is not available on this device.');
      }
    } catch (e) {
      Alert.alert('KMZ failed', e?.message || 'Could not create KMZ file.');
    } finally {
      setSavingKmz(false);
    }
  }, [selected]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelected(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.uri }} style={styles.thumb} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardDate} numberOfLines={1}>
          {item.dateTimeDisplay || item.dateTime || '—'}
        </Text>
        <Text style={styles.cardCoords} numberOfLines={1}>
          {item.latitude != null && item.longitude != null
            ? `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`
            : 'No coordinates'}
        </Text>
        <Text style={styles.cardAccuracy}>
          Accuracy: {formatAccuracy(item.accuracy)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {items.length === 0 && !refreshing ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No geo-tagged photos yet</Text>
          <Text style={styles.emptySub}>
            Take a photo from the Camera tab to see it here with date, time, and location.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.filename}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#4ade80"
            />
          }
        />
      )}

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            {selected && (
              <>
                <Image source={{ uri: selected.uri }} style={styles.modalImage} resizeMode="contain" />
                <View style={styles.modalGeo}>
                  <Text style={styles.modalLabel}>Date & time</Text>
                  <Text style={styles.modalValue}>{selected.dateTimeDisplay || selected.dateTime}</Text>
                  <Text style={styles.modalLabel}>Latitude</Text>
                  <Text style={styles.modalValue}>{selected.latitude?.toFixed(6) ?? '—'}</Text>
                  <Text style={styles.modalLabel}>Longitude</Text>
                  <Text style={styles.modalValue}>{selected.longitude?.toFixed(6) ?? '—'}</Text>
                  <Text style={styles.modalLabel}>Accuracy</Text>
                  <Text style={styles.modalValue}>{formatAccuracy(selected.accuracy)}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.saveButton, savingToPhone && styles.saveButtonDisabled]}
                  onPress={saveSelectedToPhone}
                  disabled={savingToPhone}
                  activeOpacity={0.85}
                >
                  {savingToPhone ? (
                    <ActivityIndicator color="#0f0f1a" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save to phone</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.kmzButton, savingKmz && styles.saveButtonDisabled]}
                  onPress={saveSelectedAsKmz}
                  disabled={savingKmz}
                  activeOpacity={0.85}
                >
                  {savingKmz ? (
                    <ActivityIndicator color="#0f0f1a" />
                  ) : (
                    <Text style={styles.kmzButtonText}>Save as KMZ file</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(selected)}
                >
                  <Text style={styles.deleteButtonText}>Delete photo</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  list: {
    padding: 12,
    paddingBottom: 32,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#16213e',
  },
  thumb: {
    width: 100,
    height: 100,
    backgroundColor: '#16213e',
  },
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cardDate: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardCoords: {
    color: '#94a3b8',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    marginBottom: 2,
  },
  cardAccuracy: {
    color: '#64748b',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    maxWidth: 400,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#16213e',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 8,
  },
  modalCloseText: {
    color: '#94a3b8',
    fontSize: 20,
  },
  modalImage: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    backgroundColor: '#16213e',
    marginBottom: 16,
  },
  modalGeo: {
    marginBottom: 16,
  },
  modalLabel: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  modalValue: {
    color: '#e2e8f0',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  deleteButton: {
    backgroundColor: 'rgba(248,113,113,0.2)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#f87171',
    fontWeight: '600',
    fontSize: 15,
  },
  saveButton: {
    marginBottom: 12,
    backgroundColor: '#4ade80',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#0f0f1a',
    fontWeight: '800',
    fontSize: 15,
  },
  kmzButton: {
    marginBottom: 12,
    backgroundColor: '#38bdf8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  kmzButtonText: {
    color: '#0f0f1a',
    fontWeight: '800',
    fontSize: 15,
  },
});
