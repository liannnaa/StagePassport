import { Alert } from 'react-native';
import type { RootStackParamList } from '../../../navigation/types';

type AddMenuNavigation = {
  navigate<RouteName extends keyof RootStackParamList>(
    ...args: undefined extends RootStackParamList[RouteName]
      ? [screen: RouteName] | [screen: RouteName, params: RootStackParamList[RouteName]]
      : [screen: RouteName, params: RootStackParamList[RouteName]]
  ): void;
};

export function openAddMenu(navigation: AddMenuNavigation) {
  Alert.alert('Add', 'Choose what to add', [
    {
      text: 'Performance',
      onPress: () => navigation.navigate('PerformanceForm', { mode: 'add' }),
    },
    {
      text: 'Concert',
      onPress: () => navigation.navigate('ConcertForm', { mode: 'add' }),
    },
    {
      text: 'Artist',
      onPress: () => navigation.navigate('ArtistForm', { mode: 'add' }),
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}