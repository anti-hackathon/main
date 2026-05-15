import React from 'react';
import { View, Text } from 'react-native';
import { Severity } from '../store/crisisStore';

const getSeverityColor = (severity: Severity) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-500 text-white';
    case 'HIGH': return 'bg-orange-500 text-white';
    case 'MEDIUM': return 'bg-blue-500 text-white';
    case 'LOW': return 'bg-teal-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const colorClass = getSeverityColor(severity);
  return (
    <View className={`px-2 py-1 rounded-full ${colorClass.split(' ')[0]}`}>
      <Text className={`text-xs font-bold ${colorClass.split(' ')[1]}`}>{severity}</Text>
    </View>
  );
};
