import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../components/ScreenContainer';
import { useAuth } from '../../auth/context/AuthContext';
import { colors, radius, spacing } from '../../../theme/tokens';

export default function SettingsScreen({ navigation }: any) {
  const { logOut } = useAuth();

  return (
    <ScreenContainer
      showHeader
      title="Settings"
      showBackButton
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <SettingsCard
          title="Manage Catalog"
          subtitle="Tags, venues, genres"
          onPress={() => navigation.navigate('ManageCatalog')}
        />

        <SettingsCard
          title="Credits"
          subtitle="Icon attributions"
          onPress={() => navigation.navigate('Credits')}
        />

        <SettingsCard
          title="Log Out"
          subtitle="Sign out of your account"
          destructive
          onPress={() =>
            Alert.alert(
              'Log out',
              'Are you sure you want to log out?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: logOut },
              ]
            )
          }
        />
      </View>
    </ScreenContainer>
  );
}

function SettingsCard({
  title,
  subtitle,
  onPress,
  destructive,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.title,
          destructive && { color: colors.destructive },
        ]}
      >
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});