import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { MOCK_NOTICES } from '../../mockData';
import NoticeCard from '../../components/NoticeCard';

const FILTERS = ['All', 'BRCA', 'BSA', 'Pinned'];

export default function NoticesScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredNotices = MOCK_NOTICES.filter(notice => {
    if (activeFilter === 'All') return true;
    return notice.board === activeFilter || (activeFilter === 'Pinned' && notice.id === 'n1'); // mock pinned logic
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Filters */}
        <View style={styles.filterContainer}>
          {FILTERS.map(filter => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.filterPill, activeFilter === filter && styles.activeFilterPill]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notices List */}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {filteredNotices.map(notice => (
            <NoticeCard 
              key={notice.id}
              type={notice.type}
              title={notice.title}
              subtitle={notice.subtitle}
              timeAgo={notice.timeAgo}
              iconType={notice.iconType}
            />
          ))}
          
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All Notices</Text>
          </TouchableOpacity>
        </ScrollView>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterPill: {
    backgroundColor: COLORS.primaryRed,
    borderColor: COLORS.primaryRed,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterText: {
    color: COLORS.textPrimary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  viewAllBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  }
});
