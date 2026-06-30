import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TeachingEntry } from '../types/types';

const STORAGE_KEY = '@teaching_entries';

export const useTeachingData = (initialData: TeachingEntry[] = []) => {
  const [entries, setEntries] = useState<TeachingEntry[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonData !== null) {
        const parsedData: TeachingEntry[] = JSON.parse(jsonData);
        setEntries(parsedData);
      } else if (initialData.length > 0) {
        await saveData(initialData);
        setEntries(initialData);
      }
    } catch (err) {
      setError('Failed to load teaching data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [initialData]);

  const saveData = useCallback(async (data: TeachingEntry[]) => {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEY, jsonData);
    } catch (err) {
      setError('Failed to save teaching data');
      console.error('Error saving data:', err);
      throw err;
    }
  }, []);

  const addEntry = useCallback(async (newEntry: TeachingEntry) => {
    try {
      const updatedEntries = [newEntry, ...entries];
      await saveData(updatedEntries);
      setEntries(updatedEntries);
      return true;
    } catch (err) {
      setError('Failed to add entry');
      return false;
    }
  }, [entries, saveData]);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const updatedEntries = entries.filter(entry => entry.id !== id);
      await saveData(updatedEntries);
      setEntries(updatedEntries);
      return true;
    } catch (err) {
      setError('Failed to delete entry');
      return false;
    }
  }, [entries, saveData]);

  const updateEntry = useCallback(async (updatedEntry: TeachingEntry) => {
    try {
      const updatedEntries = entries.map(entry =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      );
      await saveData(updatedEntries);
      setEntries(updatedEntries);
      return true;
    } catch (err) {
      setError('Failed to update entry');
      return false;
    }
  }, [entries, saveData]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    entries,
    loading,
    error,
    addEntry,
    deleteEntry,
    updateEntry,
    refreshData,
    saveData,
  };
};

export default useTeachingData;