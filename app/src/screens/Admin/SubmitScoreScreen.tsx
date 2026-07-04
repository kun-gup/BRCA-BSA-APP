import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { ChevronLeft, Filter, ChevronDown } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import EventCard from '../../components/EventCard';
import { MOCK_EVENTS_BRCA } from '../../mockData';

export default function SubmitScoreScreen() {
  const [hostel, setHostel] = useState('Satpura');
  const [points, setPoints] = useState('50');
  const [remarks, setRemarks] = useState('Great Performance!');
  const event = MOCK_EVENTS_BRCA[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity><ChevronLeft color={COLORS.textPrimary} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Scores</Text>
          <TouchableOpacity><Filter color={COLORS.textPrimary} size={20} /></TouchableOpacity>
        </View>

        {/* Selected Event */}
        <View style={styles.eventContainer}>
          <EventCard 
            title={event.title}
            club={event.club}
            date={event.date}
            time={event.time}
            venue={event.venue}
            image={event.image}
          />
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Hostel</Text>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownText}>{hostel}</Text>
              <ChevronDown color={COLORS.textSecondary} size={20} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Points Awarded</Text>
            <TextInput 
              style={styles.input}
              value={points}
              onChangeText={setPoints}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Remarks (Optional)</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              value={remarks}
              onChangeText={setRemarks}
              multiline
            />
          </View>

        </View>

        <View style={styles.spacer} />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  
  eventContainer: { marginBottom: 32 },
  
  formContainer: { gap: 20 },
  inputGroup: {},
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8 },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: { color: COLORS.textPrimary, fontSize: 14 },
  
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  spacer: { flex: 1 },
  
  submitButton: {
    backgroundColor: COLORS.primaryRed,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold' },
});
