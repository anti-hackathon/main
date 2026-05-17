// Role3 | Bottom sheet for browsing agent reasoning steps filtered to a selected crisis
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LoadingPulse } from './LoadingPulse';
import { SlidingSheet } from './SlidingSheet';
import { AgentTrace } from './AgentTrace';
import { ROLE3_COLORS } from '../constants/role3Theme';
import { useAgentStore } from '../store/agentStore';

interface ReasoningSheetProps {
  visible: boolean;
  onClose: () => void;
  crisisId: string | null;
}

export const ReasoningSheet = ({ visible, onClose, crisisId }: ReasoningSheetProps) => {
  const logs = useAgentStore((state) => state.logs);
  const pipelineStatus = useAgentStore((state) => state.pipelineStatus);
  const activeCrisisId = useAgentStore((state) => state.activeCrisisId);

  const log = logs.find((item) => item.crisisId === crisisId);
  const isLoading = pipelineStatus === 'running' && activeCrisisId === crisisId;

  return (
    <SlidingSheet visible={visible} onClose={onClose} title="AI Reasoning Feed">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {isLoading && (!log || log.steps.length === 0) ? <LoadingPulse /> : null}

        {!isLoading && (!log || log.steps.length === 0) ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No reasoning trace yet</Text>
            <Text style={styles.emptyBody}>
              Submit a crisis report to watch the signal processor, detector, planner, and simulator reason in sequence.
            </Text>
          </View>
        ) : null}

        {log?.steps.map((step, index) => (
          <AgentTrace key={step.id} step={step} index={index + 1} />
        ))}
      </ScrollView>
    </SlidingSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 8,
  },
  emptyState: {
    backgroundColor: ROLE3_COLORS.surfaceSoft,
    borderRadius: 20,
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
  emptyBody: {
    color: ROLE3_COLORS.textMuted,
    lineHeight: 20,
  },
});
