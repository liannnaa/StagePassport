import React from 'react';
import {
  Keyboard,
  ScrollView,
  ScrollViewProps,
  TouchableWithoutFeedback,
} from 'react-native';

type Props = ScrollViewProps & {
  children: React.ReactNode;
};

export default function AppScrollView({
  children,
  keyboardShouldPersistTaps = 'handled',
  ...props
}: Props) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        {...props}
      >
        {children}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}