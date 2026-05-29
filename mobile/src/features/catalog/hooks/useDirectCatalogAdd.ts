import { Alert } from 'react-native';

type AddHandler<T> = (name: string) => Promise<T>;

export function useDirectCatalogAdd() {
  async function addDirectly<T>({
    value,
    addOption,
    onSuccess,
    errorTitle,
  }: {
    value: string;
    addOption: AddHandler<T>;
    onSuccess: (added: T) => void;
    errorTitle: string;
  }) {
    const trimmed = value.trim();
    if (!trimmed) return;

    try {
      const added = await addOption(trimmed);
      onSuccess(added);
    } catch (error) {
      Alert.alert(
        errorTitle,
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    }
  }

  return { addDirectly };
}