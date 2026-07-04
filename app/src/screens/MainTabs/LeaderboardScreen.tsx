import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useBoard } from '../../context/BoardContext';
import { MOCK_LEADERBOARD_BRCA, MOCK_LEADERBOARD_BSA } from '../../mockData';
import LeaderboardRow from '../../components/LeaderboardRow';

export default function LeaderboardScreen() {
  const { activeBoard } = useBoard();
  const [viewType, setViewType] = useState<'Overall' | 'Club Wise'>('Overall');
  
  const leaderboardData = activeBoard === 'BRCA' ? MOCK_LEADERBOARD_BRCA : MOCK_LEADERBOARD_BSA;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        
        {/* Toggle View */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, viewType === 'Overall' && styles.activeToggleButton]}
            onPress={() => setViewType('Overall')}
          >
            <Text style={[styles.toggleText, viewType === 'Overall' && styles.activeToggleText]}>Overall</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, viewType === 'Club Wise' && styles.activeToggleButton]}
            onPress={() => setViewType('Club Wise')}
          >
            <Text style={[styles.toggleText, viewType === 'Club Wise' && styles.activeToggleText]}>Club Wise</Text>
          </TouchableOpacity>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Rank</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, marginLeft: 20 }]}>Hostel</Text>
          <Text style={styles.tableHeaderText}>Points</Text>
        </View>

        {/* Table Content */}
        <ScrollView style={styles.list}>
          {leaderboardData.map(item => (
            <LeaderboardRow 
              key={item.id}
              rank={item.rank}
              hostel={item.hostel}
              points={item.points}
              isCurrentUser={item.isCurrentUser}
            />
          ))}
        </ScrollView>
        
        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.fullLeaderboardBtn}>
            <Text style={styles.fullLeaderboardBtnText}>View Full Leaderboard</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeToggleButton: { backgroundColor: COLORS.primaryRed },
  toggleText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 14 },
  activeToggleText: { color: COLORS.textPrimary },
  
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHeaderText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  fullLeaderboardBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  fullLeaderboardBtnText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  }
});
