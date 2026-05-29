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

  async function handleRemoveVenue(id: string, name: string) {
    if (isVenueOptionInUse(id)) {
      Alert.alert(
        'Venue is in use',
        'Open the usage list to replace or remove this venue from performances first.'
      );
      return;
    }

    Alert.alert(
      'Remove venue',
      `Are you sure you want to remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVenueOption(id);
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Something went wrong.';
              Alert.alert('Unable to remove venue', message);
            }
          },
        },
      ]
    );
  }

  return (
    <ScreenContainer
      showHeader
      title="Venues"
      subtitle={`${venueOptions.length} ${
        venueOptions.length === 1 ? 'venue' : 'venues'
      }`}
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
          venueOptions.map((venue) => {
            const inUse = isVenueOptionInUse(venue.id);

            return (
              <CatalogRow
                key={venue.id}
                title={venue.venueName}
                subtitle={venue.city}
                inUse={inUse}
                usageLabel={
                  inUse ? 'Used by existing performances' : undefined
                }
                onViewUsage={() =>
                  navigation.navigate('CatalogUsage', {
                    type: 'venue',
                    id: venue.id,
                    label: [venue.venueName, venue.city]
                      .filter((value) => value.trim().length > 0)
                      .join(' • '),
                  })
                }
                onDelete={() => handleRemoveVenue(venue.id, venue.venueName)}
              />
            );
          })
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