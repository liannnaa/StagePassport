import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing } from '../../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageCatalog'>;

export default function ManageCatalogScreen({ navigation }: Props) {
  return (
    <ScreenContainer
      showHeader
      title="Manage Catalog"
      subtitle="Manage venues, genres, and sub-genres"
      showBackButton
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <CatalogLinkCard
          title="Billings"
          subtitle="Manage reusable billings"
          onPress={() => navigation.navigate('ManageBillings')}
        />

        <CatalogLinkCard
          title="Tags"
          subtitle="Manage reusable tags"
          onPress={() => navigation.navigate('ManageTags')}
        />

        <CatalogLinkCard
          title="Venues"
          subtitle="Manage venue and city pairs"
          onPress={() => navigation.navigate('ManageVenues')}
        />

        <CatalogLinkCard
          title="Genres"
          subtitle="Manage genres and their sub-genres"
          onPress={() => navigation.navigate('ManageGenres')}
        />
      </View>
    </ScreenContainer>
  );
}

type CatalogLinkCardProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

function CatalogLinkCard({
  title,
  subtitle,
  onPress,
}: CatalogLinkCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.card,
      pressed && styles.cardPressed,
    ]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
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
  cardPressed: {
    opacity: 0.85,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});