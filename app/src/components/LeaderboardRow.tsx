import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface LeaderboardRowProps {
  rank: number;
  hostel: string;
  points: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardRow({ rank, hostel, points, isCurrentUser }: LeaderboardRowProps) {
  return (
    <View style={[styles.row, isCurrentUser && styles.highlightedRow]}>
      <Text style={[styles.rank, isCurrentUser && styles.highlightedText]}>{rank}</Text>
      <Text style={[styles.hostel, isCurrentUser && styles.highlightedText]}>{hostel}</Text>
      <Text style={[styles.points, isCurrentUser && styles.highlightedPoints]}>{points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  highlightedRow: {
    backgroundColor: 'rgba(122, 19, 21, 0.2)', // faint primary red
  },
  rank: {
    width: 50,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  hostel: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  points: {
    width: 60,
    textAlign: 'right',
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  highlightedText: {
    color: COLORS.primaryRed, // or keep white, figma shows white text on red bg. Actually, the Figma shows red background, white text for rank and hostel, and gold text for points.
  },
  highlightedPoints: {
    color: COLORS.primaryGold,
  }
});
