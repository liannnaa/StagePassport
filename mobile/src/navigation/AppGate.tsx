import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../features/auth/context/AuthContext';
import AuthScreen from '../features/auth/screens/AuthScreen';
import { colors } from '../theme/tokens';

export default function AppGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isInitializing, isAuthenticated } = useAuth();

  if (isInitializing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});