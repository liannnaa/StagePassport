import { Alert } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { useDirectCatalogAdd } from '../../features/catalog/hooks/useDirectCatalogAdd';

describe('useDirectCatalogAdd', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds a trimmed value and calls onSuccess', async () => {
    const addOption = jest.fn().mockResolvedValue({ id: 'indie', name: 'Indie' });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useDirectCatalogAdd());

    await act(async () => {
      await result.current.addDirectly({
        value: '  Indie  ',
        addOption,
        onSuccess,
        errorTitle: 'Unable to add genre',
      });
    });

    expect(addOption).toHaveBeenCalledWith('Indie');
    expect(onSuccess).toHaveBeenCalledWith({ id: 'indie', name: 'Indie' });
  });

  it('does nothing when value is empty', async () => {
    const addOption = jest.fn();
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useDirectCatalogAdd());

    await act(async () => {
      await result.current.addDirectly({
        value: '   ',
        addOption,
        onSuccess,
        errorTitle: 'Unable to add option',
      });
    });

    expect(addOption).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('shows an alert when addOption fails with an Error', async () => {
    const addOption = jest.fn().mockRejectedValue(new Error('Already exists'));
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useDirectCatalogAdd());

    await act(async () => {
      await result.current.addDirectly({
        value: 'Indie',
        addOption,
        onSuccess,
        errorTitle: 'Unable to add genre',
      });
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Unable to add genre', 'Already exists');
  });

  it('shows fallback alert for non-Error failures', async () => {
    const addOption = jest.fn().mockRejectedValue('bad');
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useDirectCatalogAdd());

    await act(async () => {
      await result.current.addDirectly({
        value: 'Indie',
        addOption,
        onSuccess,
        errorTitle: 'Unable to add genre',
      });
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Unable to add genre',
      'Something went wrong.'
    );
  });
});