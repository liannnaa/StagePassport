import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TagMultiSelectField from '../../features/tags/components/TagMultiSelectField';

jest.mock('../../features/catalog/components/SearchablePickerField', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  return function MockSearchablePickerField({
    label,
    selectedLabel,
    placeholder,
    options,
    onSelect,
    onClear,
    onAddNew,
  }: any) {
    return React.createElement(
      View,
      null,
      React.createElement(Text, null, label),
      React.createElement(Text, null, selectedLabel || placeholder),
      React.createElement(
        Pressable,
        { onPress: () => onSelect(options[0]) },
        React.createElement(Text, null, 'Select First Tag')
      ),
      React.createElement(
        Pressable,
        { onPress: onClear },
        React.createElement(Text, null, 'Clear Tags')
      ),
      React.createElement(
        Pressable,
        { onPress: () => onAddNew('new tag') },
        React.createElement(Text, null, 'Add New Tag')
      )
    );
  };
});

describe('TagMultiSelectField', () => {
  const options = [
    { id: 'favorite', title: 'Favorite' },
    { id: 'outdoor', title: 'Outdoor' },
  ];

  it('shows helper text when no tags are selected', () => {
    const screen = render(
      <TagMultiSelectField
        tags={[]}
        options={options}
        onAddTag={jest.fn()}
        onRemoveTag={jest.fn()}
        onClearTags={jest.fn()}
        onAddNew={jest.fn()}
      />
    );

    expect(screen.getByText('You can select more than one tag.')).toBeTruthy();
  });

  it('shows selected tag count', () => {
    const screen = render(
      <TagMultiSelectField
        tags={['Favorite', 'Outdoor']}
        options={options}
        onAddTag={jest.fn()}
        onRemoveTag={jest.fn()}
        onClearTags={jest.fn()}
        onAddNew={jest.fn()}
      />
    );

    expect(screen.getByText('2 tags selected')).toBeTruthy();
  });

  it('adds a selected tag', () => {
    const onAddTag = jest.fn();

    const screen = render(
      <TagMultiSelectField
        tags={[]}
        options={options}
        onAddTag={onAddTag}
        onRemoveTag={jest.fn()}
        onClearTags={jest.fn()}
        onAddNew={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText('Select First Tag'));

    expect(onAddTag).toHaveBeenCalledWith('Favorite');
  });

  it('removes a selected tag when chip is pressed', () => {
    const onRemoveTag = jest.fn();

    const screen = render(
      <TagMultiSelectField
        tags={['Favorite']}
        options={options}
        onAddTag={jest.fn()}
        onRemoveTag={onRemoveTag}
        onClearTags={jest.fn()}
        onAddNew={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText('Favorite'));

    expect(onRemoveTag).toHaveBeenCalledWith('Favorite');
  });

  it('clears tags', () => {
    const onClearTags = jest.fn();

    const screen = render(
      <TagMultiSelectField
        tags={['Favorite']}
        options={options}
        onAddTag={jest.fn()}
        onRemoveTag={jest.fn()}
        onClearTags={onClearTags}
        onAddNew={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText('Clear Tags'));

    expect(onClearTags).toHaveBeenCalled();
  });

  it('calls onAddNew with search text', () => {
    const onAddNew = jest.fn();

    const screen = render(
      <TagMultiSelectField
        tags={[]}
        options={options}
        onAddTag={jest.fn()}
        onRemoveTag={jest.fn()}
        onClearTags={jest.fn()}
        onAddNew={onAddNew}
      />
    );

    fireEvent.press(screen.getByText('Add New Tag'));

    expect(onAddNew).toHaveBeenCalledWith('new tag');
  });
});