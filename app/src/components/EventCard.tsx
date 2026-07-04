import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Calendar, MapPin } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

interface EventCardProps {
  title: string;
  club: string;
  date: string;
  time: string;
  venue: string;
  image: string;
  onPress?: () => void;
}

export default function EventCard({ title, club, date, time, venue, image, onPress }: EventCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.club}>{club}</Text>
        
        <View style={styles.infoRow}>
          <Calendar color={COLORS.textSecondary} size={14} />
          <Text style={styles.infoText}>{date} • {time}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MapPin color={COLORS.textSecondary} size={14} />
          <Text style={styles.infoText}>{venue}</Text>
        </View>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Register Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: 80,
    height: '100%',
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#333',
  },
  content: {
    flex: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  club: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 6,
  },
  button: {
    backgroundColor: COLORS.primaryRed,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
