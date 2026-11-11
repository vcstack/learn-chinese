import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import React from 'react';
import { Appbar } from 'react-native-paper';
import { theme } from '../theme';

/**
 * Header của stack navigator, vẽ bằng Paper Appbar để đồng bộ theme
 * (nền xanh lá, chữ trắng, nút back của Paper).
 */
export function PaperHeader({ navigation, route, options, back }: NativeStackHeaderProps) {
  const title = options.title ?? route.name;
  return (
    <Appbar.Header
      style={{ backgroundColor: theme.colors.primary }}
      statusBarHeight={0}>
      {back ? (
        <Appbar.BackAction color="#FFFFFF" onPress={navigation.goBack} />
      ) : null}
      <Appbar.Content
        title={title}
        titleStyle={{ color: '#FFFFFF', fontWeight: '700', fontSize: 19 }}
      />
      {options.headerRight
        ? options.headerRight({ tintColor: '#FFFFFF', canGoBack: !!back })
        : null}
    </Appbar.Header>
  );
}
