import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AddTagModal from '../../features/tags/components/AddTagModal';

jest.mock('../../components/TopSheetModal', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  return function MockTopSheetModal({
    visible,
    title,
    onClose,
    onConfirm,
    children,
  }: {
    visible: boolean;
    title: string;
    onClose: () => void;
    onConfirm: () => void;
    children: React.ReactNode;
  }) {
    if (!visible) return null;

    return React.createElement(
      View,
      null,
      React.createElement(Text, null, title),
      children,
      React.createElement(
        Pressable,
        { onPress: onConfirm },
        React.createElement(Text, null, 'Save')
      ),
      React.createElement(
        Pressable,
        { onPress: onClose },
        React.createElement(Text, null, 'Cancel')
      )
    );
  };
});

jest.mock('../../components/AppTextInput', () => {
  const React = require('react');
  const { TextInput } = require('react-native');

  return function MockAppTextInput(props: any) {
    return React.createElement(TextInput, {
      ...props,
      testID: 'tag-input',
    });
  };
});

describe('AddTagModal', () => {
  it('does not render when hidden', () => {
    const screen = render(
      <AddTagModal visible={false} onClose={jest.fn()} onSave={jest.fn()} />
    );

    expect(screen.queryByText('Add Tag')).toBeNull();
  });

  it('renders initial tag name when visible', () => {
    const screen = render(
      <AddTagModal
        visible
        initialTagName="Favorite"
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue('Favorite')).toBeTruthy();
  });

  it('saves trimmed tag name', () => {
    const onSave = jest.fn();

    const screen = render(
      <AddTagModal visible onClose={jest.fn()} onSave={onSave} />
    );

    fireEvent.changeText(screen.getByTestId('tag-input'), '  Outdoor  ');
    fireEvent.press(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith('Outdoor');
  });

  it('does not save empty tag name', () => {
    const onSave = jest.fn();

    const screen = render(
      <AddTagModal visible onClose={jest.fn()} onSave={onSave} />
    );

    fireEvent.changeText(screen.getByTestId('tag-input'), '   ');
    fireEvent.press(screen.getByText('Save'));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onClose when cancelled', () => {
    const onClose = jest.fn();

    const screen = render(
      <AddTagModal visible initialTagName="Favorite" onClose={onClose} onSave={jest.fn()} />
    );

    fireEvent.press(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });
});