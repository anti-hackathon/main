export interface RawSignal {
  id: string;
  source: string;
  text?: string;
  data?: any;
  timestamp: string;
}

export const getTrafficData = async (location: string) => ({
  location,
  congestion_index: Math.random() > 0.7 ? 0.85 + Math.random() * 0.15 : 0.3,
  blocked_segments: Math.random() > 0.7 ? ['Main Margalla Road', 'Faisal Ave'] : [],
  timestamp: new Date().toISOString()
});

export const getWeatherAlert = async (city: string) => ({
  city,
  rainfall_mm_hr: Math.random() > 0.6 ? 35 + Math.random() * 30 : 2,
  temperature_c: city === 'Karachi' ? 42 + Math.random() * 5 : 28,
  alert_level: Math.random() > 0.6 ? 'HEAVY_RAIN' : 'NORMAL',
  timestamp: new Date().toISOString()
});

export const getSocialSignals = (scenario: string): RawSignal[] => {
  const now = new Date();
  const templates: Record<string, string[]> = {
    flooding: [
      'G-10 mein pani bhar gaya hai, gaariyan phans gayi hain #Islamabad',
      'Flash flood at G-10 Markaz, road completely blocked',
      'Sewer overflow near G-10/4, water entering homes',
      'Koi rescue 1122 ko call kare, G-10 is drowning',
    ],
    heatwave: [
      'Karachi DHA phase 6 me light 12 ghante se nahi hai, garmi bohat hai',
      'Heatstroke cases rising at Jinnah Hospital',
    ],
    accident: [
      'Terrible crash on M-2 near Lahore toll plaza',
      'Motorway M-2 block ho gayi hai accident ki wajah se',
    ],
  };

  const texts = templates[scenario] || templates.flooding;
  return texts.map((text, i) => ({
    id: `soc_${i}`,
    source: 'Twitter',
    text,
    timestamp: new Date(now.getTime() - i * 60000).toISOString(),
  }));
};

export const getScenarioSignals = (scenario: string): RawSignal[] => {
  const now = new Date();
  const socialSignals = getSocialSignals(scenario);
  
  const additionalSignals: RawSignal[] = [];
  
  if (scenario === 'flooding') {
    additionalSignals.push({
      id: 'weather_1',
      source: 'Weather API',
      data: { rainfall_mm_hr: 45, alert: 'HEAVY_RAIN', location: 'Islamabad' },
      timestamp: now.toISOString()
    });
    additionalSignals.push({
      id: 'traffic_1',
      source: 'Traffic API',
      data: { location: 'G-10', congestion_index: 0.94, normal_index: 0.3 },
      timestamp: now.toISOString()
    });
  }

  return [...socialSignals, ...additionalSignals];
};
