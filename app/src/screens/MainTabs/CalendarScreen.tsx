import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react-native';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
// Simple static mock grid for May 2025
const DATES = [
  ['', '', '', '1', '2', '3', '4'],
  ['5', '6', '7', '8', '9', '10', '11'],
  ['12', '13', '14', '15', '16', '17', '18'],
  ['19', '20', '21', '22', '23', '24', '25'],
  ['26', '27', '28', '29', '30', '31', ''],
];

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity><ChevronLeft color={COLORS.textPrimary} /></TouchableOpacity>
          <Text style={styles.monthText}>May 2025</Text>
          <TouchableOpacity><SlidersHorizontal color={COLORS.textPrimary} size={20} /></TouchableOpacity>
        </View>

        {/* Days Header */}
        <View style={styles.daysRow}>
          {DAYS.map(d => <Text key={d} style={styles.dayText}>{d}</Text>)}
        </View>

        {/* Calendar Grid */}
        <View style={styles.grid}>
          {DATES.map((week, wIdx) => (
            <View key={wIdx} style={styles.weekRow}>
              {week.map((day, dIdx) => {
                const isSelected = day === '19';
                const hasEvent = day === '19' || day === '20';
                return (
                  <View key={dIdx} style={styles.dayCell}>
                    {day !== '' && (
                      <View style={[styles.dayCircle, isSelected && styles.selectedDayCircle]}>
                        <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>{day}</Text>
                      </View>
                    )}
                    {hasEvent && <View style={styles.eventDot} />}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        
        {/* Legends */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: COLORS.primaryRed}]} /><Text style={styles.legendText}>BRCA Events</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: COLORS.success}]} /><Text style={styles.legendText}>BSA Events</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#3498db'}]} /><Text style={styles.legendText}>Workshop</Text></View>
        </View>

        <View style={styles.divider} />

        {/* Events for selected day */}
        <View style={styles.selectedDayHeader}>
          <Text style={styles.selectedDayTitle}>19 May 2025</Text>
          <Text style={styles.selectedDayCount}>3 Events</Text>
        </View>

        {/* Event List Items */}
        <View style={styles.eventList}>
          <View style={[styles.eventListItem, { borderLeftColor: COLORS.primaryRed }]}>
            <Text style={styles.eventListTitle}>Group Dance Competition</Text>
            <Text style={[styles.eventListStatus, { color: COLORS.warning }]}>Starts Today</Text>
          </View>
          
          <View style={[styles.eventListItem, { borderLeftColor: COLORS.success }]}>
            <Text style={styles.eventListTitle}>Football Practice Match</Text>
            <Text style={[styles.eventListStatus, { color: COLORS.success }]}>Ongoing</Text>
          </View>
          
          <View style={[styles.eventListItem, { borderLeftColor: '#3498db' }]}>
            <Text style={styles.eventListTitle}>Fine Arts Workshop</Text>
            <Text style={[styles.eventListStatus, { color: COLORS.primaryRed }]}>Ends Today</Text>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  monthText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  
  daysRow: { flexDirection: 'row', paddingHorizontal: 10, marginBottom: 10 },
  dayText: { flex: 1, textAlign: 'center', color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  
  grid: { paddingHorizontal: 10 },
  weekRow: { flexDirection: 'row', marginBottom: 12 },
  dayCell: { flex: 1, alignItems: 'center', height: 40 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  selectedDayCircle: { backgroundColor: COLORS.primaryRed },
  dateText: { color: COLORS.textPrimary, fontSize: 14 },
  selectedDateText: { fontWeight: 'bold' },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.success, marginTop: 4 },
  
  legendRow: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  legendText: { color: COLORS.textSecondary, fontSize: 10 },
  
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 },
  
  selectedDayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  selectedDayTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  selectedDayCount: { color: COLORS.textSecondary, fontSize: 12 },
  
  eventList: { paddingHorizontal: 20 },
  eventListItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  eventListTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },
  eventListStatus: { fontSize: 12, fontWeight: '600' }
});
