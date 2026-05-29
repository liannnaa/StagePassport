import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import AppScrollView from '../../../components/AppScrollView';
import EmptyState from '../../../components/EmptyState';
import { RootStackParamList } from '../../../navigation/types';
import { usePerformances } from '../../performances/context/PerformancesContext';
import CatalogRow from '../components/CatalogRow';
import AddBillingModal from '../../billings/components/AddBillingModal';
import { spacing } from '../../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageBillings'>;

export default function ManageBillingsScreen({ navigation }: Props) {
  const {
    billingOptions,
    addBillingOption,
    deleteBillingOption,
    isBillingOptionInUse,
  } = usePerformances();

  const [showAddBillingModal, setShowAddBillingModal] = useState(false);

  async function handleRemoveBilling(id: string, name: string) {
    if (isBillingOptionInUse(id)) {
      Alert.alert(
        'Billing is in use',
        'Open the usage list to replace or remove this billing from performances first.'
      );
      return;
    }

    Alert.alert(
      'Remove billing',
      `Are you sure you want to remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBillingOption(id);
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Something went wrong.';
              Alert.alert('Unable to remove billing', message);
            }
          },
        },
      ]
    );
  }

  return (
    <ScreenContainer
      showHeader
      title="Billings"
      subtitle={`${billingOptions.length} ${
        billingOptions.length === 1 ? 'billing' : 'billings'
      }`}
      showBackButton
      onBackPress={() => navigation.goBack()}
      rightActionLabel="Add"
      onRightActionPress={() => setShowAddBillingModal(true)}
    >
      <AppScrollView contentContainerStyle={styles.container}>
        {billingOptions.length === 0 ? (
          <EmptyState
            title="No billings yet"
            body="Add a billing to build your catalog."
          />
        ) : (
          billingOptions.map((billing) => (
            <CatalogRow
              key={billing.id}
              title={billing.name}
              inUse={isBillingOptionInUse(billing.id)}
              usageLabel={
                isBillingOptionInUse(billing.id)
                  ? 'Used by existing performances'
                  : undefined
              }
              onViewUsage={() =>
                navigation.navigate('CatalogUsage', {
                  type: 'billing',
                  id: billing.id,
                  label: billing.name,
                })
              }
              onDelete={() => handleRemoveBilling(billing.id, billing.name)}
            />
          ))
        )}
      </AppScrollView>

      <AddBillingModal
        visible={showAddBillingModal}
        onClose={() => setShowAddBillingModal(false)}
        onSave={async (billingName) => {
          try {
            await addBillingOption(billingName);
            setShowAddBillingModal(false);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Something went wrong.';
            Alert.alert('Unable to add billing', message);
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