// Role3 | Collapsible response plan summary card shown below the live crisis map
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPlanStatusTone, ROLE3_COLORS } from '../constants/role3Theme';
import { ResponsePlan } from '../store/crisisStore';

interface ResponsePlanCardProps {
  plan: ResponsePlan | null;
}

export const ResponsePlanCard = ({ plan }: ResponsePlanCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const tone = useMemo(
    () => getPlanStatusTone(plan?.status ?? 'pending'),
    [plan?.status]
  );

  if (!plan) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Response Plan</Text>
        <Text style={styles.emptyText}>
          Submit a crisis report to unlock the coordinated plan, assigned teams, and route impact.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Response Plan</Text>
          <Text style={styles.summary}>{plan.summary}</Text>
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: tone.backgroundColor,
              borderColor: tone.borderColor,
            },
          ]}>
          <Text style={[styles.badgeText, { color: tone.textColor }]}>{tone.label}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricPill}>
          <Ionicons name="timer-outline" size={14} color={ROLE3_COLORS.accentSoft} />
          <Text style={styles.metricText}>{plan.estimatedResponseTime} min ETA</Text>
        </View>
        <View style={styles.metricPill}>
          <Ionicons name="people-outline" size={14} color={ROLE3_COLORS.accentSoft} />
          <Text style={styles.metricText}>{plan.teams.length} teams assigned</Text>
        </View>
      </View>

      <View style={styles.teamList}>
        {plan.teams.slice(0, expanded ? plan.teams.length : 2).map((team) => (
          <View key={`${team.role}-${team.area}`} style={styles.teamRow}>
            <Text style={styles.teamRole}>{team.role}</Text>
            <Text style={styles.teamArea}>{team.area}</Text>
            <Text style={styles.teamEta}>{team.eta}m</Text>
          </View>
        ))}
      </View>

      {expanded && plan.actions.length > 0 ? (
        <View style={styles.actionSection}>
          {plan.actions.map((action) => (
            <View key={action.actionId} style={styles.actionRow}>
              <Ionicons name="flash-outline" size={14} color={ROLE3_COLORS.accentSoft} />
              <Text style={styles.actionText}>{action.description}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Pressable style={styles.toggle} onPress={() => setExpanded((value) => !value)}>
        <Text style={styles.toggleText}>{expanded ? 'Collapse plan' : 'Expand plan details'}</Text>
        <Ionicons
          name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={16}
          color={ROLE3_COLORS.accentSoft}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  title: {
    color: ROLE3_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  summary: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ROLE3_COLORS.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metricText: {
    color: ROLE3_COLORS.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  teamList: {
    gap: 10,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ROLE3_COLORS.surfaceSoft,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  teamRole: {
    color: ROLE3_COLORS.text,
    fontWeight: '700',
    flex: 1.2,
    fontSize: 13,
  },
  teamArea: {
    color: ROLE3_COLORS.textMuted,
    flex: 1.6,
    fontSize: 12,
  },
  teamEta: {
    color: ROLE3_COLORS.accentSoft,
    fontWeight: '700',
    fontSize: 12,
  },
  actionSection: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  actionText: {
    color: ROLE3_COLORS.textSoft,
    flex: 1,
    lineHeight: 18,
    fontSize: 12,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: ROLE3_COLORS.border,
    paddingTop: 14,
  },
  toggleText: {
    color: ROLE3_COLORS.accentSoft,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyText: {
    color: ROLE3_COLORS.textMuted,
    lineHeight: 20,
  },
});
