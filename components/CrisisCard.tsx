import React from 'react';
import { View, Text } from 'react-native';
import { Crisis } from '../store/crisisStore';
import { SeverityBadge } from './SeverityBadge';

export const CrisisCard = ({ crisis }: { crisis: Crisis }) => {
  return (
    <View className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-900">{crisis.type.replace('_', ' ').toUpperCase()}</Text>
        <SeverityBadge severity={crisis.severity} />
      </View>
      <Text className="text-gray-600 mb-1"><Text className="font-semibold">Location:</Text> {crisis.location}</Text>
      <Text className="text-gray-600 mb-3"><Text className="font-semibold">Est. Impact:</Text> {crisis.estimated_affected_people.toLocaleString()} people ({crisis.affected_area_km2} km²)</Text>
      
      <View className="bg-gray-50 p-3 rounded-lg">
        <Text className="text-sm font-semibold text-gray-700 mb-1">AI Reasoning:</Text>
        <Text className="text-sm text-gray-600">{crisis.reasoning}</Text>
      </View>
    </View>
  );
};
