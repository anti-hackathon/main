import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useToastStore } from '../store/toastStore';
import { ROLE3_COLORS } from '../constants/role3Theme';

export function NotificationToast() {
  const insets = useSafeAreaInsets();
  const { toast, hideToast } = useToastStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -80,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [toast.visible]);

  if (!toast.visible) {
    return null;
  }

  const getTheme = () => {
    switch (toast.type) {
      case 'success':
        return {
          glowColor: ROLE3_COLORS.success,
          iconName: 'checkmark-circle-sharp',
          defaultTitle: 'SUCCESS INGESTION',
        };
      case 'error':
        return {
          glowColor: ROLE3_COLORS.danger,
          iconName: 'alert-circle-sharp',
          defaultTitle: 'CRITICAL ERROR',
        };
      default:
        return {
          glowColor: ROLE3_COLORS.accent,
          iconName: 'information-circle-sharp',
          defaultTitle: 'CIRO NOTIFICATION',
        };
    }
  };

  const theme = getTheme();

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          top: insets.top + 12,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <View style={[styles.toastCard, { borderColor: theme.glowColor }]}>
        <View style={[styles.sideIndicator, { backgroundColor: theme.glowColor }]} />
        <View style={styles.iconContainer}>
          <Ionicons name={theme.iconName as any} size={24} color={theme.glowColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.titleText, { color: theme.glowColor }]}>
            {toast.title || theme.defaultTitle}
          </Text>
          <Text style={styles.messageText}>{toast.message}</Text>
        </View>
        <Pressable style={styles.closeButton} onPress={hideToast} hitSlop={12}>
          <Ionicons name="close" size={18} color={ROLE3_COLORS.textMuted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0F19',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  sideIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  titleText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  messageText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
});
