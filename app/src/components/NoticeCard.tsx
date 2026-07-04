import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Megaphone, Trophy, Camera, Info } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

interface NoticeCardProps {
  type: string; // 'Registration', 'Result', 'Workshop', 'Info'
  title: string;
  subtitle: string;
  timeAgo: string;
  iconType: string;
}

const getIconConfig = (iconType: string) => {
  switch (iconType) {
    case 'mega': return { Icon: Megaphone, color: COLORS.success, bg: 'rgba(39, 174, 96, 0.1)' };
    case 'trophy': return { Icon: Trophy, color: COLORS.primaryRed, bg: 'rgba(122, 19, 21, 0.1)' };
    case 'camera': return { Icon: Camera, color: '#3498db', bg: 'rgba(52, 152, 219, 0.1)' };
    case 'info': default: return { Icon: Info, color: COLORS.warning, bg: 'rgba(242, 153, 74, 0.1)' };
  }
};

export default function NoticeCard({ title, subtitle, timeAgo, iconType }: NoticeCardProps) {
  const { Icon, color, bg } = getIconConfig(iconType);

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: bg }]}>
        <Icon color={color} size={20} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
