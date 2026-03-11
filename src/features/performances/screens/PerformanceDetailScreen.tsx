import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../context/PerformancesContext';
import { colors, radius, spacing } from '../../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'PerformanceDetail'>;

export default function PerformanceDetailScreen({ route, navigation }: Props) {
  const { performanceId } = route.params;
  const { getPerformanceById, deletePerformance } = usePerformances();

  const performance = getPerformanceById(performanceId);

  if (!performance) {
    return (
      <ScreenContainer
        showHeader
        title="Performance Detail"
        showBackButton
        onBackPress={() => navigation.goBack()}
      >
        <Text style={styles.notFound}>Performance not found.</Text>
      </ScreenContainer>
    );
  }

  async function handleDeleteConfirmed() {
    try {
      if (!performance) return;
      await deletePerformance(performance.id);
      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Delete failed', message);
    }
  }

  function handleDelete() {
    if (!performance) return;
    Alert.alert(
      'Delete performance',
      `Are you sure you want to delete ${performance.artist}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDeleteConfirmed,
        },
      ]
    );
  }

  return (
    <ScreenContainer
      showHeader
      title={performance.artist}
      subtitle="Performance details"
      showBackButton
      onBackPress={() => navigation.goBack()}
      rightActionLabel="Edit"
      onRightActionPress={() =>
        navigation.navigate('PerformanceForm', {
          mode: 'edit',
          performanceId: performance.id,
        })
      }
    >
      <AppScrollView contentContainerStyle={styles.container}>
        <DetailSection label="Show Name" value={performance.showName} />
        <DetailSection label="Venue" value={performance.venue || '—'} />
        <DetailSection label="City" value={performance.city || '—'} />
        <DetailSection label="Date" value={performance.date} />
        <DetailSection label="Tag" value={performance.tag || '—'} />
        <DetailSection label="Genre" value={performance.genre || '—'} />
        <DetailSection label="Sub-Genre" value={performance.subGenre || '—'} />
        <DetailSection label="Show ID" value={performance.showId} />

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Performance</Text>
        </TouchableOpacity>
      </AppScrollView>
    </ScreenContainer>
  );
}

function DetailSection({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 17,
    color: colors.textPrimary,
  },
  deleteButton: {
    marginTop: spacing.md,
    backgroundColor: colors.destructive,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  notFound: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.lg,
  },
});