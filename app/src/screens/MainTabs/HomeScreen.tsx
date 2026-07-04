import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, Trophy } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import BoardToggle from '../../components/BoardToggle';
import EventCard from '../../components/EventCard';
import { useBoard } from '../../context/BoardContext';
import { MOCK_EVENTS_BRCA, MOCK_EVENTS_BSA, MOCK_SCHEDULE_BRCA, MOCK_SCHEDULE_BSA, MOCK_LEADERBOARD_BRCA, MOCK_LEADERBOARD_BSA } from '../../mockData';

const SectionHeader = ({ title, onViewAll }: { title: string, onViewAll?: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onViewAll && (
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.viewAllText}>View all</Text>
      </TouchableOpacity>
    )}
  </View>
);

const ScheduleItem = ({ time, title, club }: { time: string, title: string, club: string }) => (
  <View style={styles.scheduleItem}>
    <View style={styles.timeCol}>
      <View style={styles.redDot} />
      <Text style={styles.timeText}>{time}</Text>
    </View>
    <View style={styles.scheduleContent}>
      <Text style={styles.scheduleTitle}>{title}</Text>
      <Text style={styles.scheduleClub}>{club}</Text>
    </View>
  </View>
);

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/HomeNavigator';

export default function HomeScreen() {
  const { activeBoard } = useBoard();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const upcomingEvent = activeBoard === 'BRCA' ? MOCK_EVENTS_BRCA[0] : MOCK_EVENTS_BSA[0];
  const schedule = activeBoard === 'BRCA' ? MOCK_SCHEDULE_BRCA : MOCK_SCHEDULE_BSA;

  const brcaRank = MOCK_LEADERBOARD_BRCA.find(h => h.isCurrentUser);
  const bsaRank = MOCK_LEADERBOARD_BSA.find(h => h.isCurrentUser);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Evening, Naman 👋</Text>
            <Text style={styles.subGreeting}>Satpura Hostel</Text>
          </View>
          <TouchableOpacity>
            <Bell color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <BoardToggle />

        {/* Upcoming Event */}
        <SectionHeader title="Upcoming Event" onViewAll={() => { }} />
        {upcomingEvent && (
          <EventCard
            title={upcomingEvent.title}
            club={upcomingEvent.club}
            date={upcomingEvent.date}
            time={upcomingEvent.time}
            venue={upcomingEvent.venue}
            image={upcomingEvent.image}
            onPress={() => navigation.navigate('EventDetails', { eventId: upcomingEvent.id })}
          />
        )}

        {/* Today's Schedule */}
        <SectionHeader title="Today's Schedule" onViewAll={() => { }} />
        <View style={styles.scheduleContainer}>
          {schedule.map(item => (
            <ScheduleItem
              key={item.id}
              time={item.time}
              title={item.title}
              club={item.club}
            />
          ))}
        </View>

        {/* Leaderboard Snapshot */}
        <SectionHeader title="Leaderboard Snapshot" onViewAll={() => { }} />
        <View style={styles.snapshotContainer}>
          <View style={styles.snapshotCard}>
            <View style={styles.snapshotIconBg}>
              <Trophy color={COLORS.primaryGold} size={20} />
            </View>
            <View>
              <Text style={styles.snapshotLabel}>BRCA Rank</Text>
              <Text style={styles.snapshotRank}>#{brcaRank?.rank} <Text style={styles.snapshotPts}>({brcaRank?.points} pts)</Text></Text>
            </View>
          </View>

          <View style={styles.snapshotCard}>
            <View style={styles.snapshotIconBg}>
              <Trophy color={COLORS.primaryGold} size={20} />
            </View>
            <View>
              <Text style={styles.snapshotLabel}>BSA Rank</Text>
              <Text style={styles.snapshotRank}>#{bsaRank?.rank} <Text style={styles.snapshotPts}>({bsaRank?.points} pts)</Text></Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  subGreeting: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold' },
  viewAllText: { color: COLORS.primaryRed, fontSize: 13, fontWeight: '600' },

  scheduleContainer: {
    paddingHorizontal: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryRed,
    marginRight: 6,
  },
  timeText: { color: COLORS.textSecondary, fontSize: 12 },
  scheduleContent: { flex: 1, paddingBottom: 4 },
  scheduleTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  scheduleClub: { color: COLORS.textSecondary, fontSize: 12 },

  snapshotContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  snapshotCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  snapshotIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  snapshotLabel: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 4 },
  snapshotRank: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold' },
  snapshotPts: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 'normal' },
});
