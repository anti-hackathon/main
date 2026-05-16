import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Dispatcher Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color="#38bdf8" />
        </View>
        <Text style={styles.name}>Command Center Alpha</Text>
        <Text style={styles.role}>Chief Operations Dispatcher</Text>
        
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>System Online</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={24} color="#64748b" />
          <Text style={styles.infoText}>Sector G-10 Headquarters, Islamabad</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={24} color="#64748b" />
          <Text style={styles.infoText}>Clearance Level: Top Secret (Orchestrator)</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="server" size={24} color="#64748b" />
          <Text style={styles.infoText}>Connected to CIRO Antigravity Engine</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 24, paddingBottom: 10 },
  headerText: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc' },
  profileCard: {
    backgroundColor: '#1e293b',
    margin: 24,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarContainer: {
    marginBottom: 16,
    backgroundColor: '#0f172a',
    borderRadius: 50,
    padding: 5,
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
  role: { fontSize: 16, color: '#94a3b8', marginBottom: 20 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 8,
  },
  statusText: { color: '#4ade80', fontWeight: 'bold' },
  infoSection: { paddingHorizontal: 24 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoText: { color: '#cbd5e1', fontSize: 16, marginLeft: 16 },
});
