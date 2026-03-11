import { Keyboard } from 'react-native';

export function dismissKeyboardAndRun(action: () => void) {
  Keyboard.dismiss();
  action();
}