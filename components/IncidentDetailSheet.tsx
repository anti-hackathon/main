// Role3 | Marker-triggered incident sheet with status timeline and quick access to AI reasoning
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CATEGORY_ICON_MAP,
  ROLE3_COLORS,
  formatRelativeTime,
  getCrisisStatusIndex,
} from '../constants/role3Theme';
import { Crisis, ResponsePlan } from '../store/crisisStore';
import { useUserStore } from '../store/userStore';
import { SeverityBadge } from './SeverityBadge';
import { SlidingSheet } from './SlidingSheet';

interface IncidentDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  crisis: Crisis | null;
  plan: ResponsePlan | null;
  onViewReasoning: () => void;
}

const TIMELINE = ['Reported', 'Analyzing', 'Plan Active', 'Resolved'];

export const IncidentDetailSheet = ({
  visible,
  onClose,
  crisis,
  plan,
  onViewReasoning,
}: IncidentDetailSheetProps) => {
  const role = useUserStore((state) => state.role);
  const isAdmin = role === 'admin';

  if (!crisis) {
    return (
      <SlidingSheet visible={visible} onClose={onClose} title="Incident Detail">
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Select an incident</Text>
          <Text style={styles.emptyText}>
            Tap any crisis marker on the map to inspect its status, assigned team, and reasoning trace.
          </Text>
        </View>
      </SlidingSheet>
    );
  }

  const iconName = CATEGORY_ICON_MAP[crisis.category];
  const activeTimelineIndex = getCrisisStatusIndex(crisis.status);
  const assignedTeam = plan?.teams[0];

  return (
    <SlidingSheet visible={visible} onClose={onClose} title="Incident Detail">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.categoryIconWrap}>
              <Ionicons name={iconName as never} size={22} color={ROLE3_COLORS.accentSoft} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{crisis.title}</Text>
              <Text style={styles.heroSubtitle}>{crisis.location.address}</Text>
            </View>
            <SeverityBadge severity={crisis.severity} compact />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="time-outline" size={14} color={ROLE3_COLORS.accentSoft} />
              <Text style={styles.metaText}>{formatRelativeTime(crisis.timestamp)}</Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="locate-outline" size={14} color={ROLE3_COLORS.accentSoft} />
              <Text style={styles.metaText}>
                {crisis.location.lat.toFixed(3)}, {crisis.location.lng.toFixed(3)}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{crisis.description}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Assigned Response Team</Text>
          <Text style={styles.primaryInfo}>{assignedTeam?.role ?? 'Awaiting coordinated plan'}</Text>
          <Text style={styles.secondaryInfo}>
            {assignedTeam
              ? `${assignedTeam.area} • ETA ${assignedTeam.eta} min`
              : 'The planner will assign field resources after analysis.'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <View style={styles.timeline}>
            {TIMELINE.map((label, index) => {
              const isActive = index + 1 <= activeTimelineIndex;
              return (
                <View key={label} style={styles.timelineRow}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: isActive ? ROLE3_COLORS.accent : ROLE3_COLORS.surfaceSoft,
                        borderColor: isActive ? ROLE3_COLORS.accentSoft : ROLE3_COLORS.borderStrong,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.timelineText,
                      { color: isActive ? ROLE3_COLORS.text : ROLE3_COLORS.textMuted },
                    ]}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {isAdmin ? (
          <Pressable style={styles.reasoningButton} onPress={onViewReasoning}>
            <Ionicons name="sparkles-outline" size={16} color={ROLE3_COLORS.text} />
            <Text style={styles.reasoningButtonText}>View AI Reasoning</Text>
          </Pressable>
        ) : (
          <View style={styles.disabledReasoningButton}>
            <Ionicons name="lock-closed-outline" size={16} color={ROLE3_COLORS.textMuted} />
            <Text style={styles.disabledReasoningButtonText}>View AI Reasoning (Admin Clearance Required)</Text>
          </View>
        )}
      </ScrollView>
    </SlidingSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 8,
  },
  heroCard: {
    backgroundColor: ROLE3_COLORS.surfaceSoft,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 18,
    gap: 14,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    color: ROLE3_COLORS.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ROLE3_COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  metaText: {
    color: ROLE3_COLORS.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: ROLE3_COLORS.textSoft,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 18,
    gap: 8,
  },
  sectionTitle: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  primaryInfo: {
    color: ROLE3_COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryInfo: {
    color: ROLE3_COLORS.textMuted,
    lineHeight: 19,
  },
  timeline: {
    gap: 12,
    marginTop: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 2,
  },
  timelineText: {
    fontWeight: '600',
    fontSize: 13,
  },
  reasoningButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ROLE3_COLORS.accent,
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 4,
  },
  reasoningButtonText: {
    color: ROLE3_COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
  disabledReasoningButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ROLE3_COLORS.surface,
    borderColor: ROLE3_COLORS.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 4,
    opacity: 0.65,
  },
  disabledReasoningButtonText: {
    color: ROLE3_COLORS.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: ROLE3_COLORS.surfaceSoft,
    borderRadius: 24,
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
});
