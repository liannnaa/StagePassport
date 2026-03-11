import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';
import AppHeader from './AppHeader';

type ScreenContainerProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
  leftActionLabel?: string;
  onLeftActionPress?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function ScreenContainer({
  children,
  title,
  subtitle,
  showHeader = false,
  showBackButton = false,
  onBackPress,
  rightActionLabel,
  onRightActionPress,
  leftActionLabel,
  onLeftActionPress,
  contentStyle,
}: ScreenContainerProps) {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={[styles.container, contentStyle]}>
        {showHeader && title ? (
          <AppHeader
            title={title}
            subtitle={subtitle}
            showBackButton={showBackButton}
            onBackPress={onBackPress}
            rightActionLabel={rightActionLabel}
            onRightActionPress={onRightActionPress}
            leftActionLabel={leftActionLabel}
            onLeftActionPress={onLeftActionPress}
          />
        ) : null}

        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
});