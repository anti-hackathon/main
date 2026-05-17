// Role3 | Compact crisis summary card for operations and active incident lists
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CATEGORY_ICON_MAP, ROLE3_COLORS, formatRelativeTime } from '../constants/role3Theme';
import { Crisis } from '../store/crisisStore';
import { SeverityBadge } from './SeverityBadge';
import { Ionicons } from '@expo/vector-icons';

export const CrisisCard = ({ crisis }: { crisis: Crisis }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={CATEGORY_ICON_MAP[crisis.category] as never}
          size={18}
          color={ROLE3_COLORS.accentSoft}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{crisis.title}</Text>
        <Text style={styles.subTitle}>
          {crisis.category} • {formatRelativeTime(crisis.timestamp)}
        </Text>
      </View>
      <SeverityBadge severity={crisis.severity} compact />
    </View>

    <Text style={styles.location}>{crisis.location.address}</Text>
    <Text style={styles.description}>{crisis.description}</Text>

    {crisis.reasoning ? (
      <View style={styles.reasoningBox}>
        <Text style={styles.reasoningTitle}>AI Summary</Text>
        <Text style={styles.reasoningText}>{crisis.reasoning}</Text>
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: ROLE3_COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
  subTitle: {
    color: ROLE3_COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  location: {
    color: ROLE3_COLORS.textSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    color: ROLE3_COLORS.textMuted,
    lineHeight: 19,
    fontSize: 13,
  },
  reasoningBox: {
    backgroundColor: ROLE3_COLORS.surfaceSoft,
    borderRadius: 18,
    padding: 12,
    gap: 6,
  },
  reasoningTitle: {
    color: ROLE3_COLORS.accentSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  reasoningText: {
    color: ROLE3_COLORS.textSoft,
    lineHeight: 19,
    fontSize: 12,
  },
});
