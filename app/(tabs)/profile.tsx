import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/userStore';
import { auth } from '../../server/firebase';
import { useRouter } from 'expo-router';

import { useToastStore } from '../../store/toastStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { role, email, phoneNumber, clear } = useUserStore();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      clear();
      useToastStore.getState().showToast('Dispatcher session ended successfully.', 'success', 'LOGGED OUT');
      router.replace('/auth');
    } catch (error: any) {
      useToastStore.getState().showToast(error.message, 'error', 'LOGOUT FAILURE');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Dispatcher Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color="#38bdf8" />
        </View>
        <Text style={styles.name}>{email ? email.split('@')[0].toUpperCase() : 'Command Center'}</Text>
        <Text style={styles.role}>Verified Coordinated Dispatcher</Text>
        
        <View style={[
          styles.statusBadge, 
          role === 'admin' ? styles.statusBadgeAdmin : styles.statusBadgeUser
        ]}>
          <View style={[
            styles.statusDot, 
            role === 'admin' ? styles.statusDotAdmin : styles.statusDotUser
          ]} />
          <Text style={role === 'admin' ? styles.statusTextAdmin : styles.statusTextUser}>
            {role === 'admin' ? 'Admin Clearance' : 'User Access'}
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={24} color="#64748b" />
          <Text style={styles.infoText}>{email || 'No email registered'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={24} color="#64748b" />
          <Text style={styles.infoText}>{phoneNumber || 'No phone registered'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={24} color="#64748b" />
          <Text style={styles.infoText}>
            Clearance Level: {role.toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ffffff" />
          <Text style={styles.logoutText}>End Dispatcher Session</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeAdmin: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  statusBadgeUser: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotAdmin: {
    backgroundColor: '#22c55e',
  },
  statusDotUser: {
    backgroundColor: '#3b82f6',
  },
  statusTextAdmin: { color: '#4ade80', fontWeight: 'bold' },
  statusTextUser: { color: '#60a5fa', fontWeight: 'bold' },
  infoSection: { paddingHorizontal: 24 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoText: { color: '#cbd5e1', fontSize: 16, marginLeft: 16 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    marginTop: 18,
    gap: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
