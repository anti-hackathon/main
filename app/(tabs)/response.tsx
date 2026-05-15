import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useCrisisStore } from '../../store/crisisStore';
import { simulationEngine } from '../../services/simulationEngine';
import { Ionicons } from '@expo/vector-icons';
import { AlertBanner } from '../../components/AlertBanner';

export default function ResponseScreen() {
  const plan = useCrisisStore(state => state.responsePlan);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);

  useEffect(() => {
    const unsub = simulationEngine.subscribe((tick) => {
      setCurrentMinute(tick.minute);
    });
    return () => unsub();
  }, []);

  const handleSimulate = async () => {
    if (!plan) return;
    setIsPlaying(true);
    await simulationEngine.runSimulation(plan, 30);
    setIsPlaying(false);
  };

  if (!plan) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-4">
        <Ionicons name="clipboard-outline" size={64} color="#9ca3af" />
        <Text className="text-gray-400 mt-4 text-lg">No response plan generated yet.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-12">
      <View className="px-4 mb-4">
        <Text className="text-3xl font-black text-gray-900">Response Plan</Text>
        <Text className="text-gray-500">Priority: <Text className="font-bold text-red-500">{plan.priority}</Text></Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <AlertBanner 
          title="Simulation Ready" 
          message="Review the AI-generated actions below and click Simulate to execute the response timeline." 
          type="info" 
        />

        <Text className="text-xl font-bold text-gray-800 mt-4 mb-3">Planned Actions</Text>
        {plan.actions.map(action => (
          <View key={action.action_id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border-l-4 border-blue-500">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="font-bold text-gray-900 flex-1">{action.description}</Text>
              <View className={`px-2 py-1 rounded ${action.status === 'COMPLETED' ? 'bg-green-100' : action.status === 'IN_PROGRESS' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Text className={`text-xs font-bold ${action.status === 'COMPLETED' ? 'text-green-700' : action.status === 'IN_PROGRESS' ? 'text-blue-700' : 'text-gray-600'}`}>
                  {action.status}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-sm text-gray-500"><Ionicons name="business" size={12} /> {action.responsible_agency}</Text>
              <Text className="text-sm text-gray-500"><Ionicons name="time" size={12} /> ETA: {action.estimated_time_minutes}m</Text>
            </View>
          </View>
        ))}

        <Text className="text-xl font-bold text-gray-800 mt-4 mb-3">Alternate Routes</Text>
        {plan.alternate_routes.map((route, i) => (
          <View key={i} className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
            <Text className="text-green-800 font-bold mb-1">{route.from} ➔ {route.to}</Text>
            <Text className="text-green-700 text-sm">Via: {route.via}</Text>
            <Text className="text-green-600 text-xs mt-2 font-bold">Delay reduction: {route.estimated_delay_reduction} mins</Text>
          </View>
        ))}
      </ScrollView>

      {/* Playback Controls */}
      <View className="bg-white p-6 border-t border-gray-200 shadow-lg pb-10">
        <View className="flex-row justify-between mb-4">
          <Text className="font-bold text-gray-700">Timeline Progress</Text>
          <Text className="font-bold text-blue-600">T+{currentMinute} mins</Text>
        </View>
        
        {/* Simple Progress Bar */}
        <View className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <View style={{ width: `${(currentMinute / 30) * 100}%` }} className="h-full bg-blue-500" />
        </View>

        <TouchableOpacity 
          className={`py-4 rounded-xl items-center flex-row justify-center ${isPlaying ? 'bg-red-500' : 'bg-blue-600'}`}
          onPress={isPlaying ? () => simulationEngine.stop() : handleSimulate}
        >
          <Ionicons name={isPlaying ? 'stop' : 'play'} size={20} color="white" />
          <Text className="text-white font-bold ml-2 text-lg">{isPlaying ? 'Stop Simulation' : 'Run Simulation'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
