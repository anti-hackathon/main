// Role3 | Safe-area aware animated sliding sheet used for reasoning and incident details
import React, { ReactNode, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ROLE3_COLORS } from '../constants/role3Theme';

interface SlidingSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  heightRatio?: number;
}

export const SlidingSheet = ({
  visible,
  onClose,
  title,
  children,
  heightRatio = 0.68,
}: SlidingSheetProps) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const progress = useSharedValue(0);
  const sheetHeight = Math.max(360, Math.min(height * heightRatio, height - 56));

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [sheetHeight + insets.bottom + 64, 0]),
      },
    ],
  }));

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight + insets.bottom,
            paddingBottom: insets.bottom + 18,
          },
          sheetStyle,
        ]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ROLE3_COLORS.overlay,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ROLE3_COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.borderStrong,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: ROLE3_COLORS.borderStrong,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: ROLE3_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  close: {
    color: ROLE3_COLORS.accentSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});
