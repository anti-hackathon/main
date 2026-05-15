import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgentLog } from '../store/agentStore';

export const AgentTrace = ({ log }: { log: AgentLog }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = () => {
    switch (log.status) {
      case 'COMPLETE': return 'bg-green-100 text-green-700 border-green-300';
      case 'RUNNING': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'FAILED': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const statusColor = getStatusColor();

  return (
    <View className={`border rounded-xl mb-3 overflow-hidden ${statusColor.split(' ')[2]}`}>
      <TouchableOpacity 
        className={`p-4 flex-row justify-between items-center ${statusColor.split(' ')[0]}`}
        onPress={() => setExpanded(!expanded)}
      >
        <View className="flex-row items-center">
          <Ionicons 
            name={log.status === 'COMPLETE' ? 'checkmark-circle' : log.status === 'RUNNING' ? 'sync' : 'time'} 
            size={20} 
            color={statusColor.split(' ')[1].replace('text-', '')} 
          />
          <Text className={`font-bold ml-2 ${statusColor.split(' ')[1]}`}>
            🤖 {log.agentName}
          </Text>
        </View>
        <View className="flex-row items-center">
          {log.durationMs && <Text className={`mr-3 text-xs ${statusColor.split(' ')[1]}`}>{log.durationMs}ms</Text>}
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="gray" />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="p-4 bg-white">
          <Text className="text-gray-500 text-xs mb-1">Input Summary:</Text>
          <Text className="text-gray-800 mb-3">{log.inputSummary || 'N/A'}</Text>
          
          <Text className="text-gray-500 text-xs mb-1">Output Summary:</Text>
          <Text className="text-gray-800 mb-3">{log.outputSummary || 'N/A'}</Text>
          
          {log.reasoning && log.reasoning.length > 0 && (
            <>
              <Text className="text-gray-500 text-xs mb-1">Reasoning:</Text>
              {log.reasoning.map((r, i) => (
                <Text key={i} className="text-gray-800 text-sm mb-1">• {r}</Text>
              ))}
            </>
          )}

          {log.rawJson && (
            <View className="mt-4 p-3 bg-gray-900 rounded-lg">
              <Text className="text-gray-400 text-xs mb-2">RAW JSON</Text>
              <ScrollView horizontal>
                <Text className="text-green-400 font-mono text-xs">
                  {JSON.stringify(log.rawJson, null, 2)}
                </Text>
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
