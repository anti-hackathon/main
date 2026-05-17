// Role3 | Reanimated pulse skeleton used while the mock crisis pipeline is working
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ROLE3_COLORS } from '../constants/role3Theme';

export const LoadingPulse = () => {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 650, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.card}>
      {[0, 1, 2].map((row) => (
        <Animated.View
          key={row}
          style={[
            styles.bar,
            row === 0 ? styles.barWide : row === 1 ? styles.barMedium : styles.barShort,
            animatedStyle,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: ROLE3_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ROLE3_COLORS.border,
    padding: 18,
    gap: 12,
  },
  bar: {
    height: 14,
    borderRadius: 999,
    backgroundColor: ROLE3_COLORS.surfaceSoft,
  },
  barWide: {
    width: '82%',
  },
  barMedium: {
    width: '68%',
  },
  barShort: {
    width: '56%',
  },
});
