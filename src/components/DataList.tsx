import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TeachingDataProps, TeachingEntry } from '../types/types';

// Storage key constant
const STORAGE_KEY = '@teaching_entries';

export const TeachingDataList: React.FC<TeachingDataProps> = ({
  entries: initialEntries = [],
  onRefresh,
  onEntryPress,
}) => {
  const [entries, setEntries] = useState<TeachingEntry[]>(initialEntries);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data from AsyncStorage
  const loadData = useCallback(async () => {
    try {
      const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonData !== null) {
        const parsedData: TeachingEntry[] = JSON.parse(jsonData);
        setEntries(parsedData);
      } else if (initialEntries.length > 0) {
        // If no data in storage but initial entries provided, save them
        await saveData(initialEntries);
        setEntries(initialEntries);
      }
    } catch (error) {
      console.error('Error loading data from AsyncStorage:', error);
      Alert.alert('Error', 'Failed to load teaching data');
    } finally {
      setLoading(false);
    }
  }, [initialEntries]);

  // Save data to AsyncStorage
  const saveData = useCallback(async (data: TeachingEntry[]) => {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEY, jsonData);
    } catch (error) {
      console.error('Error saving data to AsyncStorage:', error);
      throw error;
    }
  }, []);

  // Add new entry
  const addEntry = useCallback(async (newEntry: TeachingEntry) => {
    try {
      const updatedEntries = [newEntry, ...entries];
      await saveData(updatedEntries);
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error adding entry:', error);
      Alert.alert('Error', 'Failed to add teaching entry');
    }
  }, [entries, saveData]);

  // Delete entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      const updatedEntries = entries.filter(entry => entry.id !== id);
      await saveData(updatedEntries);
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error deleting entry:', error);
      Alert.alert('Error', 'Failed to delete teaching entry');
    }
  }, [entries, saveData]);

  // Update entry
  const updateEntry = useCallback(async (updatedEntry: TeachingEntry) => {
    try {
      const updatedEntries = entries.map(entry =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      );
      await saveData(updatedEntries);
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error updating entry:', error);
      Alert.alert('Error', 'Failed to update teaching entry');
    }
  }, [entries, saveData]);

  // Refresh data
  const onRefreshHandler = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    if (onRefresh) {
      onRefresh();
    }
    setRefreshing(false);
  }, [loadData, onRefresh]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Format date for display
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render individual entry item
  const renderEntryItem = ({ item }: { item: TeachingEntry }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => onEntryPress && onEntryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.entryHeader}>
        <View style={styles.periodContainer}>
          <Text style={styles.periodText}>{item.period}</Text>
        </View>
        <Text style={styles.subjectText}>{item.subject}</Text>
      </View>

      <View style={styles.entryDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Standard:</Text>
          <Text style={styles.detailValue}>{item.standard}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Topic:</Text>
          <Text style={styles.detailValue}>{item.topic}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.timestampText}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>

      <View style={styles.entryFooter}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Entry',
              'Are you sure you want to delete this entry?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => deleteEntry(item.id), style: 'destructive' },
              ]
            );
          }}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        <Text style={styles.entryId}>ID: {item.id.slice(-6)}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No teaching entries found</Text>
      <Text style={styles.emptySubtext}>Pull to refresh or add new entries</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading teaching data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderEntryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefreshHandler}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  periodContainer: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  subjectText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2332',
  },
  entryDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 85,
  },
  detailValue: {
    fontSize: 14,
    color: '#1A2332',
    flex: 1,
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  entryId: {
    fontSize: 11,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default TeachingDataList;