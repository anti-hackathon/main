// Role3 | Web fallback for the crisis map that preserves the dark theme and simulation messaging
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ROLE3_COLORS } from '../constants/role3Theme';

export const SimulationMap = ({ simulationMode = false }: { simulationMode?: boolean }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={simulationMode ? 'git-network-outline' : 'map-outline'} size={64} color={ROLE3_COLORS.accentSoft} />
      <Text style={styles.title}>{simulationMode ? 'Simulation View Ready' : 'Native Map Required'}</Text>
      <Text style={styles.text}>
        The full Google Maps visualization is available in Expo Go or a native simulator. The rest of the Role 3 flow still works offline on web.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ROLE3_COLORS.surface,
    padding: 24,
    gap: 10,
  },
  title: {
    color: ROLE3_COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  text: {
    color: ROLE3_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
