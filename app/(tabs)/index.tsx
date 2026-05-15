import React, { useState } from 'react';
import { View, Text, Switch, SafeAreaView } from 'react-native';
import { useCrisisStore } from '../../store/crisisStore';
import { SimulationMap } from '../../components/SimulationMap';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const crises = useCrisisStore(state => state.crises);
  const responsePlan = useCrisisStore(state => state.responsePlan);
  const [showSimulation, setShowSimulation] = useState(false);

  // Severity Distribution
  const counts = {
    CRITICAL: crises.filter(c => c.severity === 'CRITICAL').length,
    HIGH: crises.filter(c => c.severity === 'HIGH').length,
    MEDIUM: crises.filter(c => c.severity === 'MEDIUM').length,
    LOW: crises.filter(c => c.severity === 'LOW').length,
  };
  const total = crises.length || 1;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 bg-white shadow-sm z-10 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">CIRO Dashboard</Text>
          <Text className="text-sm text-gray-500">{crises.length} Active Crises</Text>
        </View>
        <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full">
          <Text className={`font-bold mr-2 ${showSimulation ? 'text-green-600' : 'text-gray-500'}`}>
            {showSimulation ? 'Post-Response' : 'Pre-Crisis'}
          </Text>
          <Switch 
            value={showSimulation} 
            onValueChange={setShowSimulation}
            disabled={!responsePlan}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={showSimulation ? '#22c55e' : '#f3f4f6'}
          />
        </View>
      </View>

      <View className="flex-1 relative">
        <SimulationMap simulationMode={showSimulation} />

        {/* Floating Metrics Panel */}
        <View className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100">
          <Text className="text-lg font-bold mb-3 text-gray-800">Impact Metrics</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 items-center border-r border-gray-200">
              <Ionicons name="car" size={24} color="#f97316" />
              <Text className="text-2xl font-black mt-1 text-gray-900">{showSimulation ? '23%' : '94%'}</Text>
              <Text className="text-xs text-gray-500 text-center">Congestion</Text>
            </View>
            <View className="flex-1 items-center border-r border-gray-200">
              <Ionicons name="warning" size={24} color="#ef4444" />
              <Text className="text-2xl font-black mt-1 text-gray-900">{showSimulation ? '0' : '3'}</Text>
              <Text className="text-xs text-gray-500 text-center">Blocked Routes</Text>
            </View>
            <View className="flex-1 items-center">
              <Ionicons name="time" size={24} color="#3b82f6" />
              <Text className="text-2xl font-black mt-1 text-gray-900">{showSimulation ? '9m' : '28m'}</Text>
              <Text className="text-xs text-gray-500 text-center">ETA Hospital</Text>
            </View>
          </View>

          {/* Severity Bar */}
          <View className="h-4 flex-row rounded-full overflow-hidden mb-1">
            <View style={{ width: `${(counts.CRITICAL / total) * 100}%` }} className="bg-red-500" />
            <View style={{ width: `${(counts.HIGH / total) * 100}%` }} className="bg-orange-500" />
            <View style={{ width: `${(counts.MEDIUM / total) * 100}%` }} className="bg-blue-500" />
            <View style={{ width: `${(counts.LOW / total) * 100}%` }} className="bg-teal-500" />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-red-500 font-bold">{counts.CRITICAL} CRITICAL</Text>
            <Text className="text-xs text-orange-500 font-bold">{counts.HIGH} HIGH</Text>
            <Text className="text-xs text-blue-500 font-bold">{counts.MEDIUM} MED</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
