// Role3 | Rebuilt the map experience with reasoning access, response plan details, and before/after simulation
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SimulationMap } from '../../components/SimulationMap';
import { ReasoningSheet } from '../../components/ReasoningSheet';
import { IncidentDetailSheet } from '../../components/IncidentDetailSheet';
import { ResponsePlanCard } from '../../components/ResponsePlanCard';
import {
  ROLE3_COLORS,
  formatRelativeTime,
  getSeverityColor,
} from '../../constants/role3Theme';
import { useAgentStore } from '../../store/agentStore';
import { useCrisisStore } from '../../store/crisisStore';

const METRIC_CARD_WIDTH = '31%';

export default function MapDashboardScreen() {
  const crises = useCrisisStore((state) => state.crises);
  const responsePlan = useCrisisStore((state) => state.responsePlan);
  const responsePlans = useCrisisStore((state) => state.responsePlans);
  const selectedCrisisId = useCrisisStore((state) => state.selectedCrisisId);
  const recentlySubmittedCrisisId = useCrisisStore((state) => state.recentlySubmittedCrisisId);
  const setSelectedCrisis = useCrisisStore((state) => state.setSelectedCrisis);
  const logs = useAgentStore((state) => state.logs);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showIncidentSheet, setShowIncidentSheet] = useState(false);
  const [dismissedPreviewId, setDismissedPreviewId] = useState<string | null>(null);
  const transitionProgress = useSharedValue(0);

  useEffect(() => {
    if (!selectedCrisisId && crises.length > 0) {
      setSelectedCrisis(crises[0].id);
    }
  }, [crises, selectedCrisisId, setSelectedCrisis]);

  useEffect(() => {
    setDismissedPreviewId(null);
  }, [recentlySubmittedCrisisId]);

  const selectedCrisis =
    crises.find((crisis) => crisis.id === selectedCrisisId) ??
    crises.find((crisis) => crisis.id === recentlySubmittedCrisisId) ??
    crises[0] ??
    null;

  const selectedPlan =
    (selectedCrisis ? responsePlans[selectedCrisis.id] : null) ??
    (responsePlan && selectedCrisis && responsePlan.crisisId === selectedCrisis.id
      ? responsePlan
      : null) ??
    responsePlan;

  const latestLog = logs.find((log) => log.crisisId === selectedCrisis?.id);
  const recentPreviewVisible =
    Boolean(recentlySubmittedCrisisId) && dismissedPreviewId !== recentlySubmittedCrisisId;
  const recentCrisis = crises.find((crisis) => crisis.id === recentlySubmittedCrisisId) ?? null;

  const beforeMetrics = useMemo(() => {
    const severity = selectedCrisis?.severity ?? 3;
    return {
      congestion: Math.min(96, 28 + severity * 13),
      blockedRoutes: Math.max(1, Math.round(severity / 1.5)),
      eta: 8 + severity * 5,
    };
  }, [selectedCrisis]);

  const afterMetrics = useMemo(() => {
    if (!selectedPlan?.simulation) {
      return {
        congestion: Math.max(18, beforeMetrics.congestion - 26),
        blockedRoutes: Math.max(0, beforeMetrics.blockedRoutes - 1),
        eta: Math.max(6, beforeMetrics.eta - 7),
      };
    }

    return {
      congestion: Math.max(
        12,
        beforeMetrics.congestion - selectedPlan.simulation.congestionReductionPct
      ),
      blockedRoutes: Math.max(
        0,
        beforeMetrics.blockedRoutes - selectedPlan.simulation.routesUpdated
      ),
      eta: selectedPlan.simulation.responseTimeMinutes,
    };
  }, [beforeMetrics, selectedPlan]);

  const timeline = selectedPlan?.simulation?.timeline ?? [];
  const routeImpactMinutes = selectedPlan?.alternateRoutes[0]?.impactMinutes ?? 15;
  const summaryMetrics = showSimulation ? afterMetrics : beforeMetrics;

  const transitionStyle = useAnimatedStyle(() => ({
    opacity: transitionProgress.value,
  }));

  const handleToggleSimulation = () => {
    if (!selectedPlan) {
      return;
    }

    setShowSimulation((value) => !value);
    transitionProgress.value = withSequence(
      withTiming(0.95, { duration: 150, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 150, easing: Easing.in(Easing.cubic) })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ReasoningSheet
        visible={showReasoning}
        onClose={() => setShowReasoning(false)}
        crisisId={selectedCrisis?.id ?? recentlySubmittedCrisisId ?? null}
      />

      <IncidentDetailSheet
        visible={showIncidentSheet}
        onClose={() => setShowIncidentSheet(false)}
        crisis={selectedCrisis}
        plan={selectedPlan ?? null}
        onViewReasoning={() => {
          setShowIncidentSheet(false);
          setShowReasoning(true);
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>CIRO Field Console</Text>
            <Text style={styles.subtitle}>{crises.length} active incidents across the live map</Text>
          </View>

          <View style={styles.togglePill}>
            <Text style={styles.toggleLabel}>{showSimulation ? 'After' : 'Before'}</Text>
            <Pressable
              style={[styles.toggleButton, !selectedPlan && styles.toggleDisabled]}
              onPress={handleToggleSimulation}
              disabled={!selectedPlan}>
              <View
                style={[
                  styles.toggleKnob,
                  { alignSelf: showSimulation ? 'flex-end' : 'flex-start' },
                ]}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.mapCard}>
          <SimulationMap
            simulationMode={showSimulation}
            selectedCrisisId={selectedCrisis?.id ?? null}
            onSelectCrisis={(crisisId) => {
              setSelectedCrisis(crisisId);
              setShowIncidentSheet(true);
            }}
          />

          <Animated.View pointerEvents="none" style={[styles.transitionOverlay, transitionStyle]}>
            <Ionicons name="swap-horizontal-outline" size={34} color={ROLE3_COLORS.text} />
            <Text style={styles.transitionText}>Applying coordinated response...</Text>
          </Animated.View>

          {recentPreviewVisible && recentCrisis ? (
            <View style={styles.previewCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewTitle}>New crisis synced to the map</Text>
                <Text style={styles.previewBody}>
                  {recentCrisis.category} | {formatRelativeTime(recentCrisis.timestamp)}
                </Text>
              </View>
              <Pressable style={styles.previewButton} onPress={() => setShowReasoning(true)}>
                <Text style={styles.previewButtonText}>View AI Reasoning</Text>
              </Pressable>
              <Pressable onPress={() => setDismissedPreviewId(recentlySubmittedCrisisId ?? null)}>
                <Ionicons name="close-outline" size={20} color={ROLE3_COLORS.textMuted} />
              </Pressable>
            </View>
          ) : null}

          <Pressable style={styles.reasoningFab} onPress={() => setShowReasoning(true)}>
            <Ionicons name="sparkles-outline" size={16} color={ROLE3_COLORS.text} />
            <Text style={styles.reasoningFabText}>View AI Reasoning</Text>
          </Pressable>

          {showSimulation ? (
            <View style={styles.legendChip}>
              <Ionicons name="git-network-outline" size={14} color={ROLE3_COLORS.text} />
              <Text style={styles.legendText}>
                Route change impact: +{routeImpactMinutes} min avg delay avoided
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Congestion</Text>
            <Text style={styles.metricValue}>{summaryMetrics.congestion}%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Blocked Routes</Text>
            <Text style={styles.metricValue}>{summaryMetrics.blockedRoutes}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>ETA</Text>
            <Text style={styles.metricValue}>{summaryMetrics.eta}m</Text>
          </View>
        </View>

        <ResponsePlanCard plan={selectedPlan ?? null} />

        {selectedCrisis ? (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailTitle}>Selected Incident</Text>
                <Text style={styles.detailSubtitle}>{selectedCrisis.title}</Text>
              </View>
              <View
                style={[
                  styles.severityDot,
                  { backgroundColor: getSeverityColor(selectedCrisis.severity) },
                ]}
              />
            </View>
            <Text style={styles.detailBody}>{selectedCrisis.location.address}</Text>
            <Text style={styles.detailReasoning}>
              {selectedCrisis.reasoning ?? 'Awaiting AI-generated situation explanation.'}
            </Text>
            <Pressable style={styles.detailButton} onPress={() => setShowIncidentSheet(true)}>
              <Text style={styles.detailButtonText}>Open incident detail</Text>
            </Pressable>
          </View>
        ) : null}

        {timeline.length > 0 ? (
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Simulation Timeline</Text>
            {timeline.map((item) => (
              <View key={`${item.minute}-${item.label}`} style={styles.timelineRow}>
                <Text style={styles.timelineMinute}>T+{item.minute}m</Text>
                <Text style={styles.timelineItem}>{item.label}</Text>
                <Text style={styles.timelineStatus}>{item.status}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {latestLog?.steps.length ? (
          <View style={styles.feedCard}>
            <Text style={styles.feedTitle}>Latest AI Feed</Text>
            {latestLog.steps.slice(0, 2).map((step) => (
              <View key={step.id} style={styles.feedRow}>
                <Text style={styles.feedAgent}>{step.agentName}</Text>
                <Text style={styles.feedReason}>{step.reasoning}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ROLE3_COLORS.background,
  },
  content: {
    padding: 18,
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  title: {
    color: ROLE3_COLORS.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  togglePill: {
    alignItems: 'flex-end',
    gap: 8,
  },
  toggleLabel: {
    color: ROLE3_COLORS.textSoft,
    fontWeight: '700',
  },
  toggleButton: {
    width: 66,
    height: 36,
    borderRadius: 999,
    padding: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: ROLE3_COLORS.text,
  },
  toggleDisabled: {
    opacity: 0.35,
  },
  mapCard: {
    height: 390,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    backgroundColor: ROLE3_COLORS.surface,
  },
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 26, 0.74)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  transitionText: {
    color: ROLE3_COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  previewCard: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.94)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.borderStrong,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewTitle: {
    color: ROLE3_COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
  previewBody: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  previewButton: {
    backgroundColor: ROLE3_COLORS.accent,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  previewButtonText: {
    color: ROLE3_COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  reasoningFab: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ROLE3_COLORS.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  reasoningFabText: {
    color: ROLE3_COLORS.text,
    fontWeight: '700',
    fontSize: 13,
  },
  legendChip: {
    position: 'absolute',
    left: 18,
    bottom: 18,
    right: 170,
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendText: {
    color: ROLE3_COLORS.textSoft,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: METRIC_CARD_WIDTH,
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 14,
    gap: 10,
  },
  metricLabel: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricValue: {
    color: ROLE3_COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  detailCard: {
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 18,
    gap: 10,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailTitle: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  detailSubtitle: {
    color: ROLE3_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  severityDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
  },
  detailBody: {
    color: ROLE3_COLORS.textSoft,
    fontWeight: '600',
  },
  detailReasoning: {
    color: ROLE3_COLORS.textMuted,
    lineHeight: 20,
  },
  detailButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: ROLE3_COLORS.surfaceSoft,
    borderRadius: 14,
  },
  detailButtonText: {
    color: ROLE3_COLORS.accentSoft,
    fontWeight: '700',
  },
  timelineCard: {
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 18,
    gap: 12,
  },
  timelineTitle: {
    color: ROLE3_COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  timelineMinute: {
    color: ROLE3_COLORS.accentSoft,
    fontWeight: '700',
    width: 54,
  },
  timelineItem: {
    color: ROLE3_COLORS.textSoft,
    flex: 1,
    lineHeight: 18,
  },
  timelineStatus: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  feedCard: {
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 18,
    gap: 12,
  },
  feedTitle: {
    color: ROLE3_COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  feedRow: {
    gap: 4,
  },
  feedAgent: {
    color: ROLE3_COLORS.accentSoft,
    fontWeight: '700',
    fontSize: 13,
  },
  feedReason: {
    color: ROLE3_COLORS.textMuted,
    lineHeight: 19,
    fontSize: 12,
  },
});
