// Role3 | Numeric severity badge aligned to the dark mobile crisis theme
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getSeverityColor, getSeverityLabel, ROLE3_COLORS } from '../constants/role3Theme';
import { SeverityLevel } from '../store/crisisStore';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  compact?: boolean;
}

export const SeverityBadge = ({ severity, compact = false }: SeverityBadgeProps) => (
  <View
    style={[
      styles.badge,
      {
        backgroundColor: `${getSeverityColor(severity)}25`,
        borderColor: `${getSeverityColor(severity)}70`,
        paddingHorizontal: compact ? 10 : 12,
        paddingVertical: compact ? 5 : 7,
      },
    ]}>
    <Text style={[styles.label, { color: getSeverityColor(severity) }]}>
      Sev {severity} | {getSeverityLabel(severity)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: ROLE3_COLORS.text,
  },
});
