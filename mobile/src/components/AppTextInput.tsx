import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

export default function AppTextInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      keyboardAppearance="dark"
      autoCorrect={false}
    />
  );
}