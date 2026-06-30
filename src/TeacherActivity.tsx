import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the type for activity entries
interface ActivityEntry {
  id: string;
  period: string;
  standard: string;
  subject: string;
  topic: string;
  description: string;
  timestamp: string;
}

export default function TeacherActivityForm() {
  // Form State Management
  const [period, setPeriod] = useState('');
  const [standard, setStandard] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load activities from AsyncStorage
  const loadActivities = useCallback(async () => {
    try {
      const existingData = await AsyncStorage.getItem('@teacher_activities');
      if (existingData !== null) {
        const parsedData = JSON.parse(existingData);
        // Sort by timestamp descending (newest first)
        const sortedData = parsedData.sort((a: ActivityEntry, b: ActivityEntry) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setActivities(sortedData);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Load activities on component mount
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Save activity handler
  const onSaveActivity = async () => {
    // Basic Form Validation
    if (!period || !standard || !subject || !topic || !description) {
      Alert.alert('Incomplete Form', 'Please fill out all fields before submitting.');
      return;
    }

    setLoading(true);

    try {
      // Structuring new entry record
      const newActivity: ActivityEntry = {
        id: Date.now().toString(),
        period,
        standard,
        subject,
        topic,
        description,
        timestamp: new Date().toISOString(),
      };

      // Fetch existing activities
      const existingData = await AsyncStorage.getItem('@teacher_activities');
      let activitiesList: ActivityEntry[] = [];

      if (existingData !== null) {
        activitiesList = JSON.parse(existingData);
      }

      // Append new entry
      activitiesList.push(newActivity);

      // Sort by timestamp descending
      const sortedList = activitiesList.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Save to AsyncStorage
      await AsyncStorage.setItem('@teacher_activities', JSON.stringify(sortedList));

      // Update state
      setActivities(sortedList);

      // Success feedback & reset form
      Alert.alert('Success', 'Your daily activity log has been stored locally.');
      setPeriod('');
      setStandard('');
      setSubject('');
      setTopic('');
      setDescription('');
    } catch (error) {
      console.error('Local Storage Error:', error);
      Alert.alert('Storage Failure', 'Could not save data onto device hardware configurations.');
    } finally {
      setLoading(false);
    }
  };

  // Delete activity handler
  const deleteActivity = async (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this activity entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedActivities = activities.filter(item => item.id !== id);
              await AsyncStorage.setItem('@teacher_activities', JSON.stringify(updatedActivities));
              setActivities(updatedActivities);
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'Failed to delete activity');
            }
          },
        },
      ]
    );
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  // Format date for display
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render individual activity item
  const renderActivityItem = ({ item }: { item: ActivityEntry }) => (
    <View style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={styles.periodBadge}>
          <Text style={styles.periodBadgeText}>{item.period}</Text>
        </View>
        <Text style={styles.subjectText}>{item.subject}</Text>
      </View>

      <View style={styles.activityBody}>
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
          <Text style={styles.detailLabel}>Logged:</Text>
          <Text style={styles.timestampText}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>

      <View style={styles.activityFooter}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteActivity(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state for activities list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyText}>No Activities Logged Yet</Text>
      <Text style={styles.emptySubtext}>
        Start logging your daily teaching activities using the form above.
      </Text>
    </View>
  );

  // Render loading state
  if (loadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading activities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Daily Activity Log</Text>
            <Text style={styles.headerSubtitle}>Record your classroom details below</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formCard}>
            {/* Period Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Period / Time Slot</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Period 1 (8:30 AM)"
                placeholderTextColor="#94a3b8"
                value={period}
                onChangeText={setPeriod}
                editable={!loading}
              />
            </View>

            {/* Standard / Class Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Standard / Class</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Grade 10-A"
                placeholderTextColor="#94a3b8"
                value={standard}
                onChangeText={setStandard}
                editable={!loading}
              />
            </View>

            {/* Subject Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Mathematics"
                placeholderTextColor="#94a3b8"
                value={subject}
                onChangeText={setSubject}
                editable={!loading}
              />
            </View>

            {/* Topic Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Topic Covered</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Quadratic Equations"
                placeholderTextColor="#94a3b8"
                value={topic}
                onChangeText={setTopic}
                editable={!loading}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Activity Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter notes, student participation details, or homework assigned..."
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              activeOpacity={0.8}
              onPress={onSaveActivity}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Log Activity</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Recent Activities Section */}
          <View style={styles.recentActivitiesHeader}>
            <Text style={styles.recentActivitiesTitle}>Recent Activities</Text>
            <Text style={styles.activityCount}>{activities.length} entries</Text>
          </View>

          {/* Activities List */}
          <FlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Disable internal scrolling since parent is ScrollView
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={styles.flatListContainer}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748b',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Recent Activities Section
  recentActivitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  recentActivitiesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  activityCount: {
    fontSize: 14,
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  // Activity Card Styles
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  periodBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  periodBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  activityBody: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    color: '#1e293b',
    flex: 1,
  },
  timestampText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  activityFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Empty State Styles
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});