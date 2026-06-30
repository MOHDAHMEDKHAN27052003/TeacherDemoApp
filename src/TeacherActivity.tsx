import React, { useState } from 'react';
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
} from 'react-native';

export default function TeacherActivityForm() {
  // Form State Management using hooks
  const [period, setPeriod] = useState('');
  const [standard, setStandard] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
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
              />
            </View>

            {/* Description Input (Multi-line) */}
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
              />
            </View>

            {/* Placeholder Visual Submit Button (Action not focused yet) */}
            <TouchableOpacity style={styles.button} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Log Activity</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Modern UI styling using isolated Flexbox grids
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
    elevation: 3, // For Android shadow elevation
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
    paddingTop: 12, // Align text at the top for multi-line inputs on iOS
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});