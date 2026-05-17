import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../server/firebase';
import { useRouter } from 'expo-router';
import { useToastStore } from '../store/toastStore';
import { useUserStore } from '../store/userStore';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      useToastStore.getState().showToast('Please enter both your email and password to proceed.', 'error', 'INPUTS REQUIRED');
      return;
    }
    if (!isLogin && !phoneNumber) {
      useToastStore.getState().showToast('A verified phone number is required to initialize a dispatcher profile.', 'error', 'PHONE REQUIRED');
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        // Authenticate with Firebase Auth
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const user = credential.user;

        // Fetch user role from Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        let role: 'admin' | 'user' = 'user';
        let storedPhone = '';

        if (userSnap.exists()) {
          const data = userSnap.data();
          role = data.role === 'admin' ? 'admin' : 'user';
          storedPhone = data.phoneNumber || '';
        } else {
          // Fallback out-of-the-box convenience for default admin
          if (email.toLowerCase() === 'admin@ciro.gov.pk') {
            role = 'admin';
          }
        }

        // Save to global userStore
        useUserStore.getState().setRole(role);
        useUserStore.getState().setCredentials(email, storedPhone);

        useToastStore.getState().showToast(`Welcome back, Commander! Access tier: ${role.toUpperCase()}`, 'success', 'CLEARANCE VERIFIED');
        router.replace('/(tabs)/dashboard');
      } else {
        // Create User in Firebase Auth
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = credential.user;

        // Create User record in Firestore with Default role: 'user'
        // Admin role can only be altered from the backend database!
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: email.toLowerCase(),
          phoneNumber: phoneNumber,
          role: 'user',
          createdAt: new Date().toISOString()
        });

        // Save to global userStore
        useUserStore.getState().setRole('user');
        useUserStore.getState().setCredentials(email, phoneNumber);

        useToastStore.getState().showToast('Dispatcher credentials registered successfully! Tier: USER', 'success', 'ACCESS INITIALIZED');
        router.replace('/(tabs)/dashboard');
      }
    } catch (error: any) {
      useToastStore.getState().showToast(error.message, 'error', 'AUTHENTICATION FAILURE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>CIRO Dispatcher Access</Text>
        <Text style={styles.subtitle}>Crisis Intelligence & Response Orchestrator</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Dispatcher Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#9ca3af"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'Secure Login' : 'Create Access'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
            <Text style={styles.switchText}>
              {isLogin ? 'Need dispatcher access? Sign Up' : 'Already have access? Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#38bdf8',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#0284c7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#38bdf8',
    fontSize: 14,
  },
});
