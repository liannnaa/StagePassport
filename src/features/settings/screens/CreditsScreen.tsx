import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../../../components/ScreenContainer';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../theme/tokens';
import { Image } from 'react-native';

const microphoneIcon = require('../../../../assets/icons/microphone.png');
const ticketIcon = require('../../../../assets/icons/ticket.png');
const guitarIcon = require('../../../../assets/icons/guitar.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Credits'>;

export default function CreditsScreen({ navigation }: Props) {
  return (
    <ScreenContainer
      showHeader
      title="Credits"
      subtitle="Icon Attributions"
      showBackButton
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <CreditItem
          icon={microphoneIcon}
          text="Microphone icons created by Freepik - Flaticon"
          url="https://www.flaticon.com/free-icons/microphone"
        />

        <CreditItem
          icon={ticketIcon}
          text="Coupon icons created by iconmas - Flaticon"
          url="https://www.flaticon.com/free-icons/coupon"
        />

        <CreditItem
          icon={guitarIcon}
          text="Electric-guitar icons created by juicy_fish - Flaticon"
          url="https://www.flaticon.com/free-icons/electric-guitar"
        />
      </View>
    </ScreenContainer>
  );
}

function CreditItem({
  text,
  url,
  icon,
}: {
  text: string;
  url: string;
  icon: any;
}) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <Image source={icon} style={styles.icon} resizeMode="contain" />

      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
    color: colors.accent,
    fontSize: 14,
    lineHeight: 20,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: spacing.md,
    tintColor: colors.accent,
  },
});