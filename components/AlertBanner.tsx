import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AlertBanner = ({ title, message, type = 'info' }: { title: string; message: string; type?: 'info' | 'warning' | 'error' }) => {
  const bgColors = {
    info: 'bg-blue-100 border-blue-500',
    warning: 'bg-orange-100 border-orange-500',
    error: 'bg-red-100 border-red-500',
  };
  
  const iconColors = {
    info: '#3b82f6',
    warning: '#f97316',
    error: '#ef4444',
  };

  const icons = {
    info: 'information-circle',
    warning: 'warning',
    error: 'alert-circle',
  };

  return (
    <View className={`flex-row items-center p-3 m-4 rounded-lg border-l-4 ${bgColors[type]}`}>
      <Ionicons name={icons[type] as any} size={24} color={iconColors[type]} />
      <View className="ml-3 flex-1">
        <Text className="font-bold text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-700">{message}</Text>
      </View>
    </View>
  );
};
