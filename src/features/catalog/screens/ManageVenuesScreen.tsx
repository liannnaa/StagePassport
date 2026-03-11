import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import EmptyState from '../../../components/EmptyState';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../../performances/context/PerformancesContext';
import CatalogRow from '../components/CatalogRow';
import AddVenueModal from '../../venues/components/AddVenueModal';
import { spacing } from '../../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageVenues'>;

export default function ManageVenuesScreen({ navigation }: Props) {
  const {
    venueOptions,
    addVenueOption,
    deleteVenueOption,
    isVenueOptionInUse,
  } = usePerformances();

  const [showAddVenueModal, setShowAddVenueModal] = useState(false);

  async function handleRemoveVenue(id: string) {
    if (isVenueOptionInUse(id)) {
      Alert.alert(
        'Cannot remove venue',
        'This venue is used by existing performances.'
      );
      return;
    }

    try {
      await deleteVenueOption(id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Unable to remove venue', message);
    }
  }

  return (
    <ScreenContainer
      showHeader
      title="Venues"
      subtitle="Manage venue and city pairs"
      showBackButton
      onBackPress={() => navigation.goBack()}
      rightActionLabel="Add"
      onRightActionPress={() => setShowAddVenueModal(true)}
    >
      <AppScrollView contentContainerStyle={styles.container}>
        {venueOptions.length === 0 ? (
          <EmptyState
            title="No venues yet"
            body="Add a venue to build your catalog."
          />
        ) : (
          venueOptions.map((option) => (
            <CatalogRow
              key={option.id}
              title={option.venueName}
              subtitle={option.city}
              disabled={isVenueOptionInUse(option.id)}
              disabledReason={
                isVenueOptionInUse(option.id)
                  ? 'Used by existing performances'
                  : undefined
              }
              onDelete={() => {
                void handleRemoveVenue(option.id);
              }}
            />
          ))
        )}
      </AppScrollView>

      <AddVenueModal
        visible={showAddVenueModal}
        onClose={() => setShowAddVenueModal(false)}
        onSave={async (venueName, city) => {
          try {
            await addVenueOption(venueName, city);
            setShowAddVenueModal(false);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Something went wrong.';
            Alert.alert('Unable to add venue', message);
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});