import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useCrisisStore } from '../../store/crisisStore';
import { CrisisCard } from '../../components/CrisisCard';
import { Ionicons } from '@expo/vector-icons';

export default function AnalysisScreen() {
  const crises = useCrisisStore(state => state.crises);

  return (
    <View className="flex-1 bg-gray-50 pt-12 px-4">
      <View className="flex-row items-center mb-6">
        <Ionicons name="analytics" size={32} color="#1f2937" />
        <View className="ml-3">
          <Text className="text-3xl font-black text-gray-900">Analysis Engine</Text>
          <Text className="text-gray-500">AI-Detected Crisis Clusters</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {crises.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="checkmark-done-circle-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-400 mt-4 text-lg">No active crises detected.</Text>
          </View>
        ) : (
          crises.map(crisis => (
            <CrisisCard key={crisis.id} crisis={crisis} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
