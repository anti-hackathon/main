import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import { useCrisisStore, Crisis } from '../../store/crisisStore';

export default function DashboardScreen() {
  const [signal, setSignal] = useState('');
  const [loading, setLoading] = useState(false);
  const addCrisis = useCrisisStore(state => state.setCrises);
  const currentCrises = useCrisisStore(state => state.crises);

  const handleSubmit = async () => {
    if (!signal) {
      Alert.alert('Empty Signal', 'Please input a localized crisis signal.');
      return;
    }

    setLoading(true);
    try {
      // Dynamically determine the local IP if running in Expo development
      let API_URL = 'http://localhost:3000/api/signal'; // Default for web/iOS sim
      
      if (process.env.EXPO_PUBLIC_API_URL) {
        API_URL = process.env.EXPO_PUBLIC_API_URL;
      } else {
        const debuggerHost = Constants.expoConfig?.hostUri;
        if (debuggerHost) {
          const ip = debuggerHost.split(':')[0]; // Extract IP address
          API_URL = `http://${ip}:3000/api/signal`;
        } else if (Platform.OS === 'android') {
          API_URL = 'http://10.0.2.2:3000/api/signal'; // Android Emulator fallback
        }
      }

      console.log(`Sending signal to API: ${API_URL}`);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.full_trace) {
        const analyst = data.full_trace.analystOutput || {};
        
        // Helper to guess coordinates from text
        const getCoords = (text: string) => {
          const t = text.toLowerCase();
          if (t.includes('g-10') || t.includes('g10')) return { lat: 33.6844, lng: 73.0479 };
          if (t.includes('f-8') || t.includes('f8')) return { lat: 33.7104, lng: 73.0384 };
          if (t.includes('blue area')) return { lat: 33.7087, lng: 73.0697 };
          if (t.includes('faizabad')) return { lat: 33.6391, lng: 73.0850 };
          if (t.includes('murree') || t.includes('muree')) return { lat: 33.7294, lng: 73.1200 };
          if (t.includes('highway')) return { lat: 33.6550, lng: 73.0800 };
          if (t.includes('i-8') || t.includes('i8')) return { lat: 33.6685, lng: 73.0744 };
          // Random offset around Islamabad center for unknown locations
          return {
            lat: 33.6844 + (Math.random() - 0.5) * 0.05,
            lng: 73.0479 + (Math.random() - 0.5) * 0.05
          };
        };

        const newCrisis: Crisis = {
          id: Date.now().toString(),
          type: 'Emergency',
          location: signal, 
          severity: analyst.impact || 'HIGH',
          confidence_score: analyst.confidence_level || 0.9,
          affected_area_km2: 2.5,
          estimated_affected_people: 50,
          reasoning: data.final_state?.reasoning || 'AI Orchestrator confirmed the emergency.',
          corroborating_signals: [signal],
          coordinates: getCoords(signal)
        };
        addCrisis([...currentCrises, newCrisis]);
        Alert.alert('Signal Processed', 'The AI Orchestrator has analyzed the crisis and dispatched units. Check the Map for live updates.');
        setSignal(''); // clear input
      }
    } catch (error: any) {
      console.error('API Error:', error);
      Alert.alert(
        'Network Error',
        `Could not connect to the backend server.\n\nMake sure the Node server is running on port 3000.\n\nDetails: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.header}>Dispatcher Dashboard</Text>
      <Text style={styles.subtext}>Ingest localized multi-source signals into the CIRO Antigravity Engine.</Text>

      <View style={styles.inputCard}>
        <Text style={styles.label}>Incoming Signal / Social Feed</Text>
        <TextInput
          style={styles.textArea}
          placeholder='e.g., "G-10 mein pani bhar gaya hai, traffic is stuck!"'
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={4}
          value={signal}
          onChangeText={setSignal}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Trigger Response Workflow</Text>
          )}
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { fontSize: 26, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 },
  subtext: { fontSize: 14, color: '#94a3b8', marginBottom: 24 },
  inputCard: { backgroundColor: '#1e293b', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  label: { color: '#e2e8f0', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  textArea: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16
  },
  button: { backgroundColor: '#ef4444', padding: 16, borderRadius: 8, alignItems: 'center' }, // red-500 for emergency feel
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  resultCard: { marginTop: 24, backgroundColor: '#1e293b', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#10b981' },
  resultHeader: { color: '#10b981', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  resultText: { color: '#e2e8f0', fontSize: 14, marginBottom: 8, lineHeight: 22 }
});
