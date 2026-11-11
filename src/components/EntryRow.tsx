import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Text, useTheme } from 'react-native-paper';
import type { SpeechRateKey } from '../types';
import { radii, spacing } from '../theme';
import { SpeakFab } from './SpeakFab';

interface EntryRowProps {
  zh: string;
  py: string;
  vi: string;
  /** Chữ cái người nói (A/B) — chỉ dùng cho dòng hội thoại. */
  speaker?: string;
  rateKey: SpeechRateKey;
  onNoVoice: () => void;
}

/**
 * Một dòng Từ vựng / Câu mẫu / Hội thoại: chữ Hán to, pinyin xám,
 * nghĩa tiếng Việt, và nút nghe tròn xanh lá bên phải.
 */
export function EntryRow({ zh, py, vi, speaker, rateKey, onNoVoice }: EntryRowProps) {
  const theme = useTheme();
  return (
    <Card style={styles.card} mode="elevated" elevation={1}>
      <Card.Content style={styles.content}>
        {speaker ? (
          <Avatar.Text
            size={36}
            label={speaker}
            style={{ backgroundColor: theme.colors.primary }}
            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
          />
        ) : null}
        <View style={styles.texts}>
          <Text variant="titleLarge" style={styles.zh}>
            {zh}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {py}
          </Text>
          <Text variant="bodyLarge" style={styles.vi}>
            {vi}
          </Text>
        </View>
        <SpeakFab text={zh} rateKey={rateKey} onNoVoice={onNoVoice} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    marginTop: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  texts: {
    flex: 1,
  },
  zh: {
    fontWeight: '700',
    fontSize: 21,
    lineHeight: 28,
  },
  vi: {
    marginTop: 2,
  },
});
