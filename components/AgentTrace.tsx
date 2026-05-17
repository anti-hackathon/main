// Role3 | Expandable reasoning card for a single agent step in the crisis workflow
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgentLogStep } from '../store/agentStore';
import { ROLE3_COLORS } from '../constants/role3Theme';

interface AgentTraceProps {
  step: AgentLogStep;
  index: number;
}

const getStatusColors = (status: AgentLogStep['status']) => {
  switch (status) {
    case 'COMPLETE':
      return {
        chipBg: 'rgba(34, 197, 94, 0.14)',
        chipBorder: 'rgba(74, 222, 128, 0.35)',
        chipText: '#4ADE80',
        icon: 'checkmark-circle-outline',
      };
    case 'FAILED':
      return {
        chipBg: 'rgba(239, 68, 68, 0.14)',
        chipBorder: 'rgba(248, 113, 113, 0.35)',
        chipText: '#F87171',
        icon: 'warning-outline',
      };
    case 'RUNNING':
      return {
        chipBg: 'rgba(59, 130, 246, 0.14)',
        chipBorder: 'rgba(96, 165, 250, 0.35)',
        chipText: ROLE3_COLORS.accentSoft,
        icon: 'sync-outline',
      };
    default:
      return {
        chipBg: 'rgba(148, 163, 184, 0.12)',
        chipBorder: 'rgba(148, 163, 184, 0.3)',
        chipText: ROLE3_COLORS.textMuted,
        icon: 'time-outline',
      };
  }
};

export const AgentTrace = ({ step, index }: AgentTraceProps) => {
  const [expanded, setExpanded] = useState(index === 1);
  const statusColors = getStatusColors(step.status);

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={() => setExpanded((value) => !value)}>
        <View style={styles.headerLeft}>
          <View style={styles.indexBubble}>
            <Text style={styles.indexText}>{index}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.agentName}>{step.agentName}</Text>
            <Text style={styles.agentAction}>{step.action}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: statusColors.chipBg,
                borderColor: statusColors.chipBorder,
              },
            ]}>
            <Ionicons
              name={statusColors.icon as never}
              size={14}
              color={statusColors.chipText}
            />
            <Text style={[styles.statusText, { color: statusColors.chipText }]}>{step.status}</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={18}
            color={ROLE3_COLORS.textMuted}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <Text style={styles.reasoning}>{step.reasoning}</Text>

          {step.inputSummary ? (
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Input</Text>
              <Text style={styles.metaValue}>{step.inputSummary}</Text>
            </View>
          ) : null}

          {step.outputSummary ? (
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Output</Text>
              <Text style={styles.metaValue}>{step.outputSummary}</Text>
            </View>
          ) : null}

          {step.rawJson ? (
            <View style={styles.jsonBlock}>
              <Text style={styles.metaLabel}>Raw JSON</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.jsonText}>{JSON.stringify(step.rawJson, null, 2)}</Text>
              </ScrollView>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  indexBubble: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.16)',
  },
  indexText: {
    color: ROLE3_COLORS.accentSoft,
    fontWeight: '700',
  },
  agentName: {
    color: ROLE3_COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
  agentAction: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: ROLE3_COLORS.border,
    padding: 16,
    gap: 12,
  },
  reasoning: {
    color: ROLE3_COLORS.textSoft,
    lineHeight: 20,
  },
  metaBlock: {
    gap: 4,
  },
  metaLabel: {
    color: ROLE3_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
    fontWeight: '700',
  },
  metaValue: {
    color: ROLE3_COLORS.text,
    fontSize: 12,
    lineHeight: 18,
  },
  jsonBlock: {
    gap: 6,
    backgroundColor: '#030712',
    borderRadius: 16,
    padding: 12,
  },
  jsonText: {
    color: '#4ADE80',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
