// Role3 | Enhanced native crisis map with marker interactions, route overlays, and handled-state visuals
import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { ROLE3_COLORS, getSeverityColor } from '../constants/role3Theme';
import { useCrisisStore } from '../store/crisisStore';

interface SimulationMapProps {
  simulationMode?: boolean;
  selectedCrisisId?: string | null;
  onSelectCrisis?: (crisisId: string) => void;
}

const buildZone = (lat: number, lng: number, radius = 0.008) => [
  { latitude: lat + radius, longitude: lng - radius },
  { latitude: lat + radius * 0.9, longitude: lng + radius * 0.85 },
  { latitude: lat - radius * 0.65, longitude: lng + radius },
  { latitude: lat - radius, longitude: lng - radius * 0.75 },
];

const buildRouteOverlay = (lat: number, lng: number) => ({
  blocked: [
    { latitude: lat - 0.006, longitude: lng - 0.012 },
    { latitude: lat - 0.001, longitude: lng - 0.004 },
    { latitude: lat + 0.003, longitude: lng + 0.006 },
    { latitude: lat + 0.008, longitude: lng + 0.011 },
  ],
  reroute: [
    { latitude: lat - 0.006, longitude: lng - 0.012 },
    { latitude: lat - 0.009, longitude: lng - 0.003 },
    { latitude: lat - 0.002, longitude: lng + 0.008 },
    { latitude: lat + 0.008, longitude: lng + 0.011 },
  ],
});

export const SimulationMap = ({
  simulationMode = false,
  selectedCrisisId,
  onSelectCrisis,
}: SimulationMapProps) => {
  const crises = useCrisisStore((state) => state.crises);
  const responsePlan = useCrisisStore((state) => state.responsePlan);
  const responsePlans = useCrisisStore((state) => state.responsePlans);
  const mapRef = useRef<MapView>(null);

  const focusedCrisis =
    crises.find((crisis) => crisis.id === selectedCrisisId) ?? crises[0] ?? null;

  useEffect(() => {
    if (!focusedCrisis || !mapRef.current) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        latitude: focusedCrisis.location.lat,
        longitude: focusedCrisis.location.lng,
        latitudeDelta: 0.07,
        longitudeDelta: 0.07,
      },
      700
    );
  }, [focusedCrisis]);

  const activePlan = useMemo(() => {
    if (!focusedCrisis) {
      return responsePlan;
    }

    return responsePlans[focusedCrisis.id] ?? responsePlan;
  }, [focusedCrisis, responsePlan, responsePlans]);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 33.6844,
          longitude: 73.0479,
          latitudeDelta: 0.09,
          longitudeDelta: 0.09,
        }}
        customMapStyle={Platform.OS === 'android' ? mapStyle : undefined}>
        {crises.map((crisis) => {
          const severityColor = getSeverityColor(crisis.severity);
          const isSelected = crisis.id === selectedCrisisId;
          const routeOverlay = buildRouteOverlay(crisis.location.lat, crisis.location.lng);
          const planForCrisis = responsePlans[crisis.id] ?? responsePlan;
          const showRoutes = simulationMode && planForCrisis?.crisisId === crisis.id;

          return (
            <React.Fragment key={crisis.id}>
              <Polygon
                coordinates={buildZone(
                  crisis.location.lat,
                  crisis.location.lng,
                  Math.max(0.005, (crisis.affectedAreaKm2 ?? 3.2) * 0.0015)
                )}
                fillColor={`${severityColor}20`}
                strokeColor={severityColor}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />

              {showRoutes ? (
                <>
                  <Polyline
                    coordinates={routeOverlay.blocked}
                    strokeColor="#EF4444"
                    strokeWidth={4}
                    lineDashPattern={[7, 6]}
                  />
                  <Polyline
                    coordinates={routeOverlay.reroute}
                    strokeColor={ROLE3_COLORS.accent}
                    strokeWidth={5}
                  />
                </>
              ) : null}

              <Marker
                coordinate={{
                  latitude: crisis.location.lat,
                  longitude: crisis.location.lng,
                }}
                title={crisis.title}
                description={crisis.location.address}
                onPress={() => onSelectCrisis?.(crisis.id)}>
                <View style={styles.markerWrap}>
                  <View
                    style={[
                      styles.markerRing,
                      {
                        borderColor: simulationMode ? ROLE3_COLORS.accentSoft : severityColor,
                        width: isSelected ? 58 : 50,
                        height: isSelected ? 58 : 50,
                        borderRadius: isSelected ? 29 : 25,
                        opacity: simulationMode ? 0.35 : 0.52,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.marker,
                      {
                        backgroundColor: simulationMode ? ROLE3_COLORS.accent : severityColor,
                        transform: [{ scale: simulationMode ? 0.98 : 1 }],
                      },
                    ]}>
                    <Ionicons
                      name={simulationMode ? 'shield-checkmark-outline' : 'warning-outline'}
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}

        {simulationMode && activePlan?.alternateRoutes.length ? (
          <Polyline
            coordinates={buildRouteOverlay(
              focusedCrisis?.location.lat ?? 33.6844,
              focusedCrisis?.location.lng ?? 73.0479
            ).reroute}
            strokeColor="#22C55E"
            strokeWidth={5}
          />
        ) : null}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  markerWrap: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerRing: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
});

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1F2937' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#243042' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748B' }] },
];
