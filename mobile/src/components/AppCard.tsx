import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

type AppCardProps = {
  children: React.ReactNode;
  onPress?: PressableProps['onPress'];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function AppCard({
  children,
  onPress,
  style,
  contentStyle,
}: AppCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.cardPressed : null,
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl ?? 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardPressed: {
    backgroundColor: colors.surfaceHover,
    transform: [{ scale: 0.995 }],
  },
  content: {
    padding: spacing.lg,
  },
});