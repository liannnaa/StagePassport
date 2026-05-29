import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AppHeader from '../../components/AppHeader';

describe('AppHeader', () => {
  it('renders title and subtitle', () => {
    const screen = render(
      <AppHeader
        title="Performances"
        subtitle="Track every performance"
      />
    );

    expect(screen.getByText('Performances')).toBeTruthy();
    expect(screen.getByText('Track every performance')).toBeTruthy();
  });

  it('renders back button and calls onBackPress', () => {
    const onBackPress = jest.fn();

    const screen = render(
      <AppHeader
        title="Detail"
        showBackButton
        onBackPress={onBackPress}
      />
    );

    fireEvent.press(screen.getByText('ᐸ  Back'));
    expect(onBackPress).toHaveBeenCalled();
  });

  it('renders left action when no back button is shown', () => {
    const onLeftActionPress = jest.fn();

    const screen = render(
      <AppHeader
        title="Performances"
        leftActionLabel="Log Out"
        onLeftActionPress={onLeftActionPress}
      />
    );

    fireEvent.press(screen.getByText('Log Out'));
    expect(onLeftActionPress).toHaveBeenCalled();
  });

  it('prefers back button over left action when both are provided', () => {
    const onBackPress = jest.fn();

    const screen = render(
      <AppHeader
        title="Performances"
        showBackButton
        onBackPress={onBackPress}
        leftActionLabel="Log Out"
        onLeftActionPress={jest.fn()}
      />
    );

    expect(screen.getByText('ᐸ  Back')).toBeTruthy();
    expect(screen.queryByText('Log Out')).toBeNull();
  });

  it('renders right action and calls onRightActionPress', () => {
    const onRightActionPress = jest.fn();

    const screen = render(
      <AppHeader
        title="Performances"
        rightActionLabel="Add"
        onRightActionPress={onRightActionPress}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    expect(onRightActionPress).toHaveBeenCalled();
  });

  it('renders without subtitle', () => {
    const screen = render(<AppHeader title="Performances" />);
    expect(screen.getByText('Performances')).toBeTruthy();
  });
});