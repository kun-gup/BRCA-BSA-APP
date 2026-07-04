import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { ChevronLeft, Bookmark, Calendar, MapPin, Trophy, FileText, Share2 } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';

export default function EventDetailsScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=600&auto=format&fit=crop' }}
            style={styles.image}
          />
          <View style={styles.headerOverlay}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <ChevronLeft color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bookmark color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Competitive Event</Text>
          </View>

          <Text style={styles.title}>Group Dance Competition</Text>
          <Text style={styles.club}>Dance Club</Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Calendar color={COLORS.textSecondary} size={20} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTextPrimary}>19 May - 20 May 2025</Text>
                <Text style={styles.infoTextSecondary}>6:00 PM onwards</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MapPin color={COLORS.textSecondary} size={20} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTextPrimary}>LH Auditorium</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Trophy color={COLORS.textSecondary} size={20} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTextPrimary}>Points</Text>
                <Text style={styles.infoTextSecondary}>50 Points</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <FileText color={COLORS.primaryRed} size={20} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTextPrimary, { color: COLORS.primaryRed }]}>View Rulebook (PDF)</Text>
              </View>
            </View>
          </View>

          <View style={styles.registrationInfo}>
            <Text style={styles.registrationText}>Registration</Text>
            <Text style={styles.registrationDate}>Opens on 15 May, 10:00 AM</Text>
          </View>

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Register Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Share Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  imageContainer: { height: 250, position: 'relative' },
  image: { width: '100%', height: '100%', opacity: 0.8 },
  headerOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20 },
  tag: {
    backgroundColor: 'rgba(122, 19, 21, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tagText: { color: COLORS.primaryRed, fontSize: 12, fontWeight: 'bold' },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  club: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 24 },

  infoSection: { gap: 16, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoTextContainer: { marginLeft: 16 },
  infoTextPrimary: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },
  infoTextSecondary: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },

  registrationInfo: { marginBottom: 24 },
  registrationText: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 },
  registrationDate: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },

  primaryButton: {
    backgroundColor: COLORS.primaryRed,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold' },

  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
});
