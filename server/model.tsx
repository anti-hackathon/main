import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBackendUrl = () => {
  // Try to resolve the dynamic local development machine IP first
  const hostUri = Constants.expoConfig?.hostUri; 
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip.trim().length > 0) {
      console.log(`[Antigravity Model] Dynamically resolved backend IP: http://${ip}:3000`);
      return `http://${ip}:3000`;
    }
  }

  // Fallback to standard platform networking defaults
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

export const runCIROPipeline = async (signals: any[], metadata: any) => {
  const baseUrl = getBackendUrl();
  const signalText = signals.map(s => s.text).join('\n');
  
  console.log(`[Antigravity Model] POSTing signal to ${baseUrl}/api/pipeline`);
  
  const response = await fetch(`${baseUrl}/api/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signal: signalText,
      metadata: metadata
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Antigravity Model] Backend responded with error status ${response.status}: ${errorText}`);
    throw new Error(`Pipeline request failed with status ${response.status}`);
  }
  
  const result = await response.json();
  console.log('[Antigravity Model] Pipeline request succeeded:', result.success);
  return result;
};
