import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useCrisisStore, Crisis } from '../store/crisisStore';
import { Ionicons } from '@expo/vector-icons';

export const SimulationMap = ({ simulationMode = false }: { simulationMode?: boolean }) => {
  const crises = useCrisisStore(state => state.crises);
  const responsePlan = useCrisisStore(state => state.responsePlan);
  const mapRef = useRef<MapView>(null);

  // Default to Islamabad center
  const initialRegion = {
    latitude: 33.6844,
    longitude: 73.0479,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    if (crises.length > 0 && mapRef.current) {
      const coords = crises.map(c => c.coordinates).filter(Boolean) as {lat:number, lng:number}[];
      if (coords.length > 0) {
        mapRef.current.animateToRegion({
          latitude: coords[0].lat,
          longitude: coords[0].lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
      }
    }
  }, [crises]);

  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#E24B4A'; // red-500
      case 'HIGH': return '#EF9F27'; // orange-500
      case 'MEDIUM': return '#378ADD'; // blue-500
      default: return '#1D9E75'; // teal-500
    }
  };

  // Generate a mock polygon around a center point for visual effect
  const getPolygonCoords = (center: {lat:number, lng:number}, radius: number = 0.005) => [
    { latitude: center.lat + radius, longitude: center.lng - radius },
    { latitude: center.lat + radius, longitude: center.lng + radius },
    { latitude: center.lat - radius, longitude: center.lng + radius },
    { latitude: center.lat - radius, longitude: center.lng - radius },
  ];

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        customMapStyle={Platform.OS === 'android' ? mapStyle : undefined}
      >
        {crises.map((crisis) => {
          if (!crisis.coordinates) return null;
          const color = getMarkerColor(crisis.severity);
          
          return (
            <React.Fragment key={crisis.id}>
              {/* Affected Zone Polygon */}
              <Polygon
                coordinates={getPolygonCoords(crisis.coordinates, crisis.affected_area_km2 * 0.001)}
                fillColor={`${color}33`} // 20% opacity
                strokeColor={color}
                strokeWidth={2}
              />
              
              {/* Crisis Marker */}
              <Marker
                coordinate={{ latitude: crisis.coordinates.lat, longitude: crisis.coordinates.lng }}
                title={crisis.type}
                description={crisis.location}
              >
                <View style={[styles.markerWrap]}>
                  <View style={[styles.ring, { borderColor: color }]} />
                  <View style={[styles.marker, { backgroundColor: color }]}>
                    <Ionicons name="warning" size={16} color="white" />
                  </View>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Alternate Routes from Response Plan */}
        {simulationMode && responsePlan?.alternate_routes?.map((route, i) => {
          // Hardcoded coords for demo based on route names (G-10 to F-10 via Nazim-ud-din)
          const blockedRoute = [
            { latitude: 33.6844, longitude: 73.0479 },
            { latitude: 33.6944, longitude: 73.0479 },
            { latitude: 33.7044, longitude: 73.0279 },
          ];
          const newRoute = [
            { latitude: 33.6844, longitude: 73.0479 },
            { latitude: 33.6894, longitude: 73.0579 },
            { latitude: 33.7044, longitude: 73.0279 },
          ];

          return (
            <React.Fragment key={i}>
              <Polyline coordinates={blockedRoute} strokeColor="#E24B4A" strokeWidth={3} lineDashPattern={[8,4]} />
              <Polyline coordinates={newRoute} strokeColor="#639922" strokeWidth={4} />
            </React.Fragment>
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  markerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    position: 'absolute',
    borderWidth: 2,
    opacity: 0.5,
  },
});

// Subtle dark/grey map style for better contrast with bright markers
const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#f5f5f5"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#616161"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#f5f5f5"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"color": "#ffffff"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#c9c9c9"}]
  }
];
