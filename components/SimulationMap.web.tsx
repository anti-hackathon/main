import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const SimulationMap = ({ simulationMode = false }: { simulationMode?: boolean }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={64} color="#ccc" style={{ marginBottom: 16 }} />
      <Text style={styles.title}>Map Visualization Unavailable</Text>
      <Text style={styles.text}>
        The interactive Google Maps visualization is only available on native iOS and Android devices.
      </Text>
      <Text style={styles.text}>
        Please use the Expo Go app on your phone or an emulator to experience the full map features.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  }
});
