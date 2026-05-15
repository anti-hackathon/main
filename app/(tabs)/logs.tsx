import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAgentStore } from '../../store/agentStore';
import { AgentTrace } from '../../components/AgentTrace';

export default function LogsScreen() {
  const logs = useAgentStore(state => state.logs);
  const executionLogs = useAgentStore(state => state.executionLogs);

  return (
    <View className="flex-1 bg-gray-50 pt-12">
      <View className="px-4 mb-4">
        <Text className="text-3xl font-black text-gray-900">Agent Trace</Text>
        <Text className="text-gray-500">LLM Reasoning Pipeline Logs</Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {logs.map(log => (
          <AgentTrace key={log.id} log={log} />
        ))}
        {logs.length === 0 && (
          <Text className="text-center text-gray-400 mt-10">Run a scenario to see agent traces.</Text>
        )}
      </ScrollView>

      {/* Live Execution Ticker */}
      <View className="h-48 bg-gray-900 p-4 rounded-t-3xl mt-2">
        <Text className="text-gray-400 text-xs font-bold mb-2 tracking-wider">LIVE EXECUTION LOG</Text>
        <ScrollView 
          showsVerticalScrollIndicator={true}
          ref={ref => ref?.scrollToEnd({ animated: true })}
        >
          {executionLogs.map((log, i) => (
            <Text key={i} className="text-green-400 font-mono text-xs mb-1">
              {log}
            </Text>
          ))}
          {executionLogs.length === 0 && (
            <Text className="text-gray-600 font-mono text-xs">Waiting for events...</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
