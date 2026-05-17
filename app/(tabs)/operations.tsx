// Role3 | Added an operations overview tab for active incidents and recent agent decisions
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CrisisCard } from '../../components/CrisisCard';
import { ROLE3_COLORS } from '../../constants/role3Theme';
import { useAgentStore } from '../../store/agentStore';
import { useCrisisStore } from '../../store/crisisStore';

export default function OperationsScreen() {
  const crises = useCrisisStore((state) => state.crises);
  const responsePlan = useCrisisStore((state) => state.responsePlan);
  const logs = useAgentStore((state) => state.logs);

  const latestSteps = useMemo(() => {
    const latestLog = logs[logs.length - 1];
    return latestLog?.steps.slice(-3).reverse() ?? [];
  }, [logs]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Operations Overview</Text>
        <Text style={styles.subtitle}>
          Live incident summaries, latest agent decisions, and a quick read on the current coordination posture.
        </Text>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Incidents</Text>
          <Text style={styles.kpiValue}>{crises.length}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Teams</Text>
          <Text style={styles.kpiValue}>{responsePlan?.teams.length ?? 0}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Routes</Text>
          <Text style={styles.kpiValue}>{responsePlan?.alternateRoutes.length ?? 0}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Incidents</Text>
        {crises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No incidents yet</Text>
            <Text style={styles.emptyText}>
              Use the Report tab to submit the first crisis and populate the dashboard.
            </Text>
          </View>
        ) : (
          crises.map((crisis) => <CrisisCard key={crisis.id} crisis={crisis} />)
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest Agent Decisions</Text>
        {latestSteps.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No trace available yet</Text>
            <Text style={styles.emptyText}>Once the mock pipeline runs, the latest reasoning steps will land here.</Text>
          </View>
        ) : (
          latestSteps.map((step) => (
            <View key={step.id} style={styles.feedCard}>
              <Text style={styles.feedAgent}>{step.agentName}</Text>
              <Text style={styles.feedAction}>{step.action}</Text>
              <Text style={styles.feedReason}>{step.reasoning}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ROLE3_COLORS.background,
  },
  content: {
    padding: 18,
    paddingBottom: 120,
    gap: 18,
  },
  header: {
    gap: 8,
  },
  title: {
    color: ROLE3_COLORS.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: ROLE3_COLORS.textMuted,
    lineHeight: 20,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '31%',
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 14,
    gap: 8,
  },
  kpiLabel: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  kpiValue: {
    color: ROLE3_COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: ROLE3_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 18,
    gap: 8,
  },
  emptyTitle: {
    color: ROLE3_COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: ROLE3_COLORS.textMuted,
    lineHeight: 20,
  },
  feedCard: {
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 16,
    gap: 6,
  },
  feedAgent: {
    color: ROLE3_COLORS.accentSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  feedAction: {
    color: ROLE3_COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  feedReason: {
    color: ROLE3_COLORS.textMuted,
    lineHeight: 19,
  },
});
