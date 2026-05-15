import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useCrisisStore } from '../../store/crisisStore';
import { getScenarioSignals } from '../../services/mockApis';
import { runCIROPipeline } from '../../services/claudeAgent';
import { Ionicons } from '@expo/vector-icons';

export default function SignalsScreen() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const signals = useCrisisStore(state => state.signals);
  
  const handleScenario = async (scenario: string) => {
    setLoading(true);
    const rawSignals = getScenarioSignals(scenario);
    await runCIROPipeline(rawSignals);
    setLoading(false);
  };

  const handleSubmitManual = async () => {
    if (!inputText) return;
    setLoading(true);
    const rawSignals = [{ id: 'manual_1', source: 'User Input', text: inputText, timestamp: new Date().toISOString() }];
    await runCIROPipeline(rawSignals);
    setInputText('');
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-gray-50 pt-12 px-4">
      <Text className="text-3xl font-black text-gray-900 mb-2">Signal Ingestion</Text>
      <Text className="text-gray-500 mb-6">Input multi-modal signals or run demo scenarios</Text>

      {/* Manual Input */}
      <View className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl p-3 h-24 text-gray-800"
          placeholder="e.g. G-10 mein pani bhar gaya hai, gaariyan phans gayi hain"
          multiline
          value={inputText}
          onChangeText={setInputText}
          textAlignVertical="top"
        />
        <TouchableOpacity 
          className="bg-blue-600 mt-3 py-3 rounded-xl items-center flex-row justify-center"
          onPress={handleSubmitManual}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Ionicons name="send" size={18} color="white" />}
          <Text className="text-white font-bold ml-2">Submit Signal</Text>
        </TouchableOpacity>
      </View>

      {/* Demo Scenarios */}
      <Text className="text-lg font-bold text-gray-800 mb-3">Simulate Scenarios</Text>
      <View className="flex-row flex-wrap justify-between mb-6">
        <TouchableOpacity 
          className="bg-teal-500 w-[48%] py-4 rounded-xl items-center mb-3 shadow-sm"
          onPress={() => handleScenario('flooding')}
        >
          <Ionicons name="water" size={24} color="white" />
          <Text className="text-white font-bold mt-1">Urban Flooding</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-orange-500 w-[48%] py-4 rounded-xl items-center mb-3 shadow-sm"
          onPress={() => handleScenario('heatwave')}
        >
          <Ionicons name="thermometer" size={24} color="white" />
          <Text className="text-white font-bold mt-1">Heatwave</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-red-500 w-[48%] py-4 rounded-xl items-center mb-3 shadow-sm"
          onPress={() => handleScenario('accident')}
        >
          <Ionicons name="car" size={24} color="white" />
          <Text className="text-white font-bold mt-1">Major Accident</Text>
        </TouchableOpacity>
      </View>

      {/* Normalized Feed */}
      <Text className="text-lg font-bold text-gray-800 mb-3">Live Signal Feed</Text>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {signals.length === 0 ? (
          <Text className="text-gray-400 text-center mt-4">Waiting for incoming signals...</Text>
        ) : (
          signals.map(s => (
            <View key={s.id} className="bg-white p-3 rounded-lg mb-2 border-l-4 border-blue-500 shadow-sm flex-row items-center">
              <View className="bg-blue-100 p-2 rounded-full mr-3">
                <Ionicons name={s.source.includes('Weather') ? 'partly-sunny' : 'logo-twitter'} size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-800">{s.source} • <Text className="text-green-600 font-normal">{(s.confidence * 100).toFixed(0)}% Conf.</Text></Text>
                <Text className="text-sm text-gray-600 mt-1">{s.normalized_text}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
