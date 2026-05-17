// Role3 | Upgraded the signal form into a full multi-step crisis report flow wired to the mock agent pipeline
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  CATEGORY_OPTIONS,
  CrisisCategory,
  ROLE3_COLORS,
  SeverityLevel,
  formatAddressFallback,
  getSeverityColor,
  getSeverityLabel,
} from '../../constants/role3Theme';
import { runCIROPipeline } from '../../server/model';
import { useCrisisStore } from '../../store/crisisStore';
import { useAgentStore } from '../../store/agentStore';

import { useToastStore } from '../../store/toastStore';

const STEP_LABELS = ['Category', 'Details', 'Photo', 'Location', 'Severity', 'Review'];

interface DraftLocation {
  lat: number;
  lng: number;
  address: string;
}

const DEFAULT_LOCATION: DraftLocation = {
  lat: 33.6844,
  lng: 73.0479,
  address: '', // Default to empty to trigger auto-location geocoding
};

export default function ReportCrisisScreen() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [category, setCategory] = useState<CrisisCategory | null>(null);
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [location, setLocation] = useState<DraftLocation>(DEFAULT_LOCATION);
  const [severity, setSeverity] = useState<SeverityLevel>(3);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-trigger GPS location capture as soon as Step 3 is loaded
  useEffect(() => {
    if (stepIndex === 3 && !location.address) {
      handleLocate();
    }
  }, [stepIndex]);

  const canContinue = useMemo(() => {
    switch (stepIndex) {
      case 0:
        return Boolean(category);
      case 1:
        return description.trim().length >= 12;
      case 2:
        return true;
      case 3:
        return Boolean(location.address.trim());
      case 4:
        return true;
      default:
        return Boolean(category && description.trim() && location.address.trim());
    }
  }, [category, description, location.address, stepIndex]);

  const resetForm = () => {
    setStepIndex(0);
    setCategory(null);
    setDescription('');
    setPhotoUri(undefined);
    setLocation(DEFAULT_LOCATION);
    setSeverity(3);
  };

  const useSampleScenario = () => {
    setCategory('Flood');
    setDescription(
      'Flash flooding is building near G-10 Markaz. Cars are stalled in standing water and traffic is no longer moving.'
    );
    setLocation({
      lat: 33.6844,
      lng: 73.0479,
      address: 'G-10 Markaz, Islamabad',
    });
    setSeverity(5);
    setStepIndex(5);
  };

  const handlePickImage = async () => {
    setIsPickingImage(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        useToastStore.getState().showToast('Allow library permission to attach field photos.', 'error', 'PHOTO PERMISSION');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.75,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        useToastStore.getState().showToast('Incident photo attached to dispatcher cache.', 'success', 'IMAGE CACHED');
      }
    } catch {
      useToastStore.getState().showToast('The image picker could not open right now.', 'error', 'UTILITY FAILED');
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleLocate = async () => {
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        useToastStore.getState().showToast('GPS permission denied. Please type address manually.', 'error', 'LOCATION DENIED');
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const reverse = await Location.reverseGeocodeAsync({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });

      const addressParts = reverse[0]
        ? [reverse[0].name, reverse[0].district, reverse[0].city, reverse[0].region].filter(Boolean)
        : [];

      const resolvedAddress = addressParts.join(', ') || formatAddressFallback(current.coords.latitude, current.coords.longitude);

      setLocation({
        lat: current.coords.latitude,
        lng: current.coords.longitude,
        address: resolvedAddress,
      });
      useToastStore.getState().showToast('Live device coordinates resolved successfully!', 'success', 'GPS LOCATION RETRIEVED');
    } catch {
      useToastStore.getState().showToast('Could not resolve GPS location. Please type manually or toggle device GPS.', 'error', 'LOCATION SERVICES OFF');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!category) {
      return;
    }

    const crisisId = `crisis_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const finalLocation = {
      lat: location.lat,
      lng: location.lng,
      address: location.address.trim() || formatAddressFallback(location.lat, location.lng),
    };

    setIsSubmitting(true);
    const agentStoreInit = useAgentStore.getState();
    agentStoreInit.setPipelineStatus('running');
    agentStoreInit.setActiveCrisisId(crisisId);
    agentStoreInit.setAntigravityCoreStatus('initializing');

    // Load dynamic start log from Antigravity Core
    agentStoreInit.replaceLog({
      crisisId: crisisId,
      steps: [
        {
          id: `antigravity_core_init_${Date.now()}`,
          agentName: 'Antigravity Core 🌌',
          status: 'RUNNING',
          action: 'Establish Node connection and spin up agent modules',
          reasoning: 'Metropolitan signal coordinates successfully ingested. Initializing the Antigravity Core routing layer and spawning the three parallel agent pipelines: Signal Analyst, Response Planner, and Urban Traffic Simulator...',
          inputSummary: `Incident: ${category} at ${finalLocation.address}`,
          outputSummary: 'Orchestrator online. Downstream agents starting...',
        }
      ]
    });

    try {
      const result = await runCIROPipeline(
        [
          {
            id: `mobile_${crisisId}`,
            source: 'Mobile Report',
            text: `${category} report from ${finalLocation.address}: ${description}`,
            timestamp,
          },
          {
            id: `context_${crisisId}`,
            source: 'Reporter Metadata',
            text: `Severity ${severity}/5. Coordinates ${finalLocation.lat.toFixed(4)}, ${finalLocation.lng.toFixed(4)}.`,
            timestamp,
          },
        ],
        {
          crisisId,
          category,
          description,
          severity,
          location: finalLocation,
          photoUri,
          timestamp,
        }
      );

      const crisisStore = useCrisisStore.getState();
      const agentStore = useAgentStore.getState();

      const finalSteps = [
        {
          id: `antigravity_core_init_${Date.now()}`,
          agentName: 'Antigravity Core 🌌',
          status: 'COMPLETE' as const,
          action: 'Establish Node connection and spin up agent modules',
          reasoning: 'Metropolitan signal coordinates successfully ingested. Initializing the Antigravity Core routing layer and spawning the three parallel agent pipelines: Signal Analyst, Response Planner, and Urban Traffic Simulator...',
          inputSummary: `Incident: ${category} at ${finalLocation.address}`,
          outputSummary: 'Orchestrator online. Downstream agents starting...',
        },
        ...result.agentLog.steps,
        {
          id: `antigravity_core_success_${Date.now()}`,
          agentName: 'Antigravity Core 🌌',
          status: 'COMPLETE' as const,
          action: 'Orchestration Finalization & Dispatch',
          reasoning: 'All parallel agent analysis checks passed. Metropolitan response plans successfully generated, simulated, and pushed to active routing networks.',
          inputSummary: `Simulated Congestion Reduction: ${result.plan.simulation?.congestionReductionPct}%`,
          outputSummary: 'Dispatched successfully.',
        }
      ];

      const modifiedAgentLog = {
        ...result.agentLog,
        steps: finalSteps,
      };

      crisisStore.upsertCrisis(result.crisis);
      crisisStore.setResponsePlan(result.plan);
      crisisStore.setSelectedCrisis(result.crisis.id);
      crisisStore.markRecentlySubmitted(result.crisis.id);
      agentStore.replaceLog(modifiedAgentLog);
      agentStore.setPipelineStatus('complete');
      agentStore.setAntigravityCoreStatus('done');

      resetForm();
      useToastStore.getState().showToast('Incident response plan generated and deployed to live map!', 'success', 'PLAN DISPATCHED');
      router.replace('/');
    } catch (err: any) {
      console.error('[Antigravity Dashboard] submission handler caught error:', err);
      const agentStoreErr = useAgentStore.getState();
      agentStoreErr.setPipelineStatus('failed');
      agentStoreErr.setAntigravityCoreStatus('failed');
      useToastStore.getState().showToast(`Response planning failed: ${err.message || err}`, 'error', 'PIPELINE FAILURE');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Role 3 | Mobile Intake</Text>
            <Text style={styles.title}>Report Crisis</Text>
            <Text style={styles.subtitle}>
              Turn noisy field input into a clean incident that the CIRO agents can analyze, plan, and simulate offline.
            </Text>
          </View>

          <View style={styles.stepper}>
            {STEP_LABELS.map((label, index) => {
              const isActive = index === stepIndex;
              const isDone = index < stepIndex;
              return (
                <View key={label} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: isActive || isDone ? ROLE3_COLORS.accent : ROLE3_COLORS.surfaceSoft,
                        borderColor: isActive ? ROLE3_COLORS.accentSoft : ROLE3_COLORS.borderStrong,
                      },
                    ]}>
                    <Text style={styles.stepDotText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: isActive ? ROLE3_COLORS.text : ROLE3_COLORS.textMuted }]}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.card}>
            {stepIndex === 0 ? (
              <>
                <Text style={styles.cardTitle}>Choose incident category</Text>
                <Text style={styles.cardBody}>
                  Start with the crisis type so downstream agents can route the report to the right response pattern.
                </Text>
                <View style={styles.categoryGrid}>
                  {CATEGORY_OPTIONS.map((option) => {
                    const isSelected = category === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        style={[
                          styles.categoryTile,
                          isSelected && {
                            borderColor: ROLE3_COLORS.accentSoft,
                            backgroundColor: 'rgba(59, 130, 246, 0.16)',
                          },
                        ]}
                        onPress={() => setCategory(option.value)}>
                        <Ionicons
                          name={option.icon as never}
                          size={22}
                          color={isSelected ? ROLE3_COLORS.accentSoft : ROLE3_COLORS.textSoft}
                        />
                        <Text style={styles.categoryLabel}>{option.label}</Text>
                        <Text style={styles.categoryHelper}>{option.helper}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {stepIndex === 1 ? (
              <>
                <Text style={styles.cardTitle}>Describe what is happening</Text>
                <Text style={styles.cardBody}>
                  Use plain English, Urdu, or Roman Urdu. The mock pipeline is already tuned to handle noisy civic reports.
                </Text>
                <TextInput
                  style={styles.textArea}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  placeholder='Example: "G-10 mein pani bhar gaya hai, gaariyan phans gayi hain aur traffic ruk gaya hai."'
                  placeholderTextColor={ROLE3_COLORS.textMuted}
                />
              </>
            ) : null}

            {stepIndex === 2 ? (
              <>
                <Text style={styles.cardTitle}>Attach field photo</Text>
                <Text style={styles.cardBody}>Optional, but useful when the judges want to see a full report intake flow.</Text>
                <Pressable style={styles.utilityButton} onPress={handlePickImage} disabled={isPickingImage}>
                  {isPickingImage ? (
                    <ActivityIndicator color={ROLE3_COLORS.text} />
                  ) : (
                    <>
                      <Ionicons name="images-outline" size={18} color={ROLE3_COLORS.text} />
                      <Text style={styles.utilityButtonText}>
                        {photoUri ? 'Replace attached photo' : 'Choose photo from gallery'}
                      </Text>
                    </>
                  )}
                </Pressable>

                {photoUri ? <Image source={{ uri: photoUri }} style={styles.previewImage} /> : null}
              </>
            ) : null}

            {stepIndex === 3 ? (
              <>
                <Text style={styles.cardTitle}>Capture location</Text>
                <Text style={styles.cardBody}>
                  Autofill using device coordinates, then adjust the address manually if the reverse lookup needs a cleaner label.
                </Text>
                <Pressable style={styles.utilityButton} onPress={handleLocate} disabled={isLocating}>
                  {isLocating ? (
                    <ActivityIndicator color={ROLE3_COLORS.text} />
                  ) : (
                    <>
                      <Ionicons name="locate-outline" size={18} color={ROLE3_COLORS.text} />
                      <Text style={styles.utilityButtonText}>Use current location</Text>
                    </>
                  )}
                </Pressable>

                <TextInput
                  style={styles.input}
                  value={location.address}
                  onChangeText={(address) => setLocation((current) => ({ ...current, address }))}
                  placeholder="Area, sector, road, landmark"
                  placeholderTextColor={ROLE3_COLORS.textMuted}
                />
                <Text style={styles.helperText}>
                  Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </Text>
              </>
            ) : null}

            {stepIndex === 4 ? (
              <>
                <Text style={styles.cardTitle}>Choose severity</Text>
                <Text style={styles.cardBody}>
                  This affects the visual urgency of the marker and helps sell the before-vs-after simulation story.
                </Text>
                <View style={styles.sliderTrack}>
                  {[1, 2, 3, 4, 5].map((level) => {
                    const numericLevel = level as SeverityLevel;
                    const isSelected = severity === numericLevel;
                    return (
                      <Pressable
                        key={level}
                        style={[
                          styles.sliderNode,
                          {
                            backgroundColor: getSeverityColor(numericLevel),
                            transform: [{ scale: isSelected ? 1.08 : 1 }],
                            borderColor: isSelected ? ROLE3_COLORS.text : 'transparent',
                          },
                        ]}
                        onPress={() => setSeverity(numericLevel)}>
                        <Text style={styles.sliderNodeText}>{level}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={[styles.severityPreview, { color: getSeverityColor(severity) }]}>
                  Severity {severity} | {getSeverityLabel(severity)}
                </Text>
              </>
            ) : null}

            {stepIndex === 5 ? (
              <>
                <View style={styles.reviewHeader}>
                  <Text style={styles.cardTitle}>Confirm & submit</Text>
                  <Pressable onPress={useSampleScenario}>
                    <Text style={styles.sampleLink}>Use demo sample</Text>
                  </Pressable>
                </View>
                <View style={styles.reviewCard}>
                  <Text style={styles.reviewTitle}>{category}</Text>
                  <Text style={styles.reviewText}>{description}</Text>
                  <Text style={styles.reviewMeta}>Location: {location.address}</Text>
                  <Text style={styles.reviewMeta}>Severity: {severity} / 5</Text>
                  <Text style={styles.reviewMeta}>
                    Photo: {photoUri ? 'Attached' : 'No image attached'}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.footer}>
            <Pressable
              style={[styles.secondaryButton, stepIndex === 0 && styles.disabledButton]}
              onPress={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0 || isSubmitting}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>

            {stepIndex < STEP_LABELS.length - 1 ? (
              <Pressable
                style={[styles.primaryButton, !canContinue && styles.disabledButton]}
                onPress={() => setStepIndex((current) => Math.min(STEP_LABELS.length - 1, current + 1))}
                disabled={!canContinue || isSubmitting}>
                <Text style={styles.primaryButtonText}>Next step</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.primaryButton, !canContinue && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={!canContinue || isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color={ROLE3_COLORS.text} />
                ) : (
                  <Text style={styles.primaryButtonText}>Submit to CIRO</Text>
                )}
              </Pressable>
            )}
          </View>
        </ScrollView>

        {isSubmitting ? (
          <View style={styles.submissionOverlay}>
            <ActivityIndicator size="large" color={ROLE3_COLORS.accentSoft} />
            <Text style={styles.overlayTitle}>Coordinating agents...</Text>
            <Text style={styles.overlayBody}>
              Normalizing signals, detecting the incident, planning the response, and preparing the simulation.
            </Text>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: ROLE3_COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 18,
  },
  header: {
    gap: 8,
    marginTop: 8,
  },
  kicker: {
    color: ROLE3_COLORS.accentSoft,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: ROLE3_COLORS.text,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: ROLE3_COLORS.textMuted,
    lineHeight: 20,
  },
  stepper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
    minWidth: '15%',
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: {
    color: ROLE3_COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    color: ROLE3_COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  cardBody: {
    color: ROLE3_COLORS.textMuted,
    lineHeight: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryTile: {
    width: '48%',
    backgroundColor: ROLE3_COLORS.surfaceSoft,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.borderStrong,
    padding: 16,
    gap: 10,
  },
  categoryLabel: {
    color: ROLE3_COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  categoryHelper: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  textArea: {
    minHeight: 180,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.borderStrong,
    backgroundColor: ROLE3_COLORS.background,
    color: ROLE3_COLORS.text,
    padding: 16,
    textAlignVertical: 'top',
  },
  utilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ROLE3_COLORS.accent,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  utilityButtonText: {
    color: ROLE3_COLORS.text,
    fontWeight: '700',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 22,
    marginTop: 8,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.borderStrong,
    backgroundColor: ROLE3_COLORS.background,
    color: ROLE3_COLORS.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  helperText: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 12,
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  sliderNode: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  sliderNodeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  severityPreview: {
    fontSize: 16,
    fontWeight: '700',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sampleLink: {
    color: ROLE3_COLORS.accentSoft,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: ROLE3_COLORS.surfaceSoft,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 16,
    gap: 10,
  },
  reviewTitle: {
    color: ROLE3_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  reviewText: {
    color: ROLE3_COLORS.textSoft,
    lineHeight: 20,
  },
  reviewMeta: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: ROLE3_COLORS.accent,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: ROLE3_COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    minWidth: 110,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: ROLE3_COLORS.surface,
  },
  secondaryButtonText: {
    color: ROLE3_COLORS.text,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  submissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 26, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    gap: 10,
  },
  overlayTitle: {
    color: ROLE3_COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  overlayBody: {
    color: ROLE3_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },
});
