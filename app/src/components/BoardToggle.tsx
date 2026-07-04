import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useBoard } from '../context/BoardContext';
import { COLORS } from '../constants/colors';

export default function BoardToggle() {
  const { activeBoard, setActiveBoard } = useBoard();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, activeBoard === 'BRCA' && styles.activeButton]}
        onPress={() => setActiveBoard('BRCA')}
      >
        <Text style={[styles.text, activeBoard === 'BRCA' && styles.activeText]}>BRCA</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, activeBoard === 'BSA' && styles.activeButton]}
        onPress={() => setActiveBoard('BSA')}
      >
        <Text style={[styles.text, activeBoard === 'BSA' && styles.activeText]}>BSA</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeButton: {
    backgroundColor: COLORS.primaryRed,
  },
  text: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  activeText: {
    color: COLORS.textPrimary,
  },
});
