import { Alert } from 'react-native';
import { openAddMenu } from '../../features/performances/utils/openAddMenu';

describe('openAddMenu', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows add menu options', () => {
    const navigation = { navigate: jest.fn() };

    openAddMenu(navigation);

    expect(alertSpy).toHaveBeenCalledWith(
      'Add',
      'Choose what to add',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Performance' }),
        expect.objectContaining({ text: 'Concert' }),
        expect.objectContaining({ text: 'Artist' }),
        expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
      ])
    );
  });

  it('navigates to add performance', () => {
    const navigation = { navigate: jest.fn() };

    openAddMenu(navigation);

    const buttons = alertSpy.mock.calls[0][2] as any[];
    buttons.find((button) => button.text === 'Performance').onPress();

    expect(navigation.navigate).toHaveBeenCalledWith('PerformanceForm', {
      mode: 'add',
    });
  });

  it('navigates to add concert', () => {
    const navigation = { navigate: jest.fn() };

    openAddMenu(navigation);

    const buttons = alertSpy.mock.calls[0][2] as any[];
    buttons.find((button) => button.text === 'Concert').onPress();

    expect(navigation.navigate).toHaveBeenCalledWith('ConcertForm', {
      mode: 'add',
    });
  });

  it('navigates to add artist', () => {
    const navigation = { navigate: jest.fn() };

    openAddMenu(navigation);

    const buttons = alertSpy.mock.calls[0][2] as any[];
    buttons.find((button) => button.text === 'Artist').onPress();

    expect(navigation.navigate).toHaveBeenCalledWith('ArtistForm', {
      mode: 'add',
    });
  });
});