import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, List, Text, useTheme } from 'react-native-paper';
import { EntryRow } from '../components/EntryRow';
import { NoVoiceDialog } from '../components/NoVoiceDialog';
import { PATTERN_TOPICS } from '../data/hsk1';
import { speakAll } from '../speech/tts';
import { getSpeechRate, setSpeechRate } from '../storage';
import { radii, spacing } from '../theme';
import type { SpeechRateKey } from '../types';
import { RATE_ORDER, SPEECH_RATES } from '../types';

/**
 * Mẫu câu giao tiếp HSK1 — màn hình standalone (chưa gắn navigation).
 * 12 chủ đề dạng Accordion; bấm vào một chủ đề để mở 4 mẫu câu, mỗi mẫu
 * có nút nghe phát âm. Parent tích hợp sau bằng cách thêm route
 * 'Patterns' và render <PatternsScreen />.
 */
export function PatternsScreen() {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState<string | number | undefined>(undefined);
  const [rateKey, setRateKey] = useState<SpeechRateKey>('normal');
  const [noVoiceVisible, setNoVoiceVisible] = useState(false);

  useEffect(() => {
    void getSpeechRate().then(setRateKey);
  }, []);

  const cycleRate = async () => {
    const idx = RATE_ORDER.indexOf(rateKey);
    const next = RATE_ORDER[(idx + 1) % RATE_ORDER.length];
    setRateKey(next);
    await setSpeechRate(next);
  };

  /** Nghe liền tất cả mẫu câu của một chủ đề. */
  const playTopic = async (topicId: number) => {
    const topic = PATTERN_TOPICS.find((t) => t.id === topicId);
    if (!topic) return;
    const ok = await speakAll(
      topic.patterns.map((p) => p.zh),
      rateKey,
    );
    if (!ok) setNoVoiceVisible(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="headlineSmall" style={styles.title}>
          Mẫu câu giao tiếp
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginBottom: spacing.md }}>
          12 chủ đề giao tiếp hằng ngày, mỗi chủ đề 4 mẫu câu sẵn để nói theo — bấm vào chủ đề để
          mở, bấm loa để nghe phát âm.
        </Text>

        {/* Nút tốc độ đọc */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            icon="speedometer"
            onPress={() => void cycleRate()}
            style={styles.rateButton}
            contentStyle={styles.rateContent}>
            Tốc độ: {SPEECH_RATES[rateKey].label}
          </Button>
        </View>

        <Card style={styles.listCard} mode="elevated" elevation={1}>
          <List.AccordionGroup
            expandedId={expandedId}
            onAccordionPress={(id) => setExpandedId(expandedId === id ? undefined : id)}>
            {PATTERN_TOPICS.map((t, i) => (
              <View key={t.id}>
                {i > 0 ? <Divider style={styles.divider} /> : null}
                <List.Accordion
                  id={t.id}
                  title={t.title}
                  description={`${t.patterns.length} mẫu câu`}
                  left={(props) => <List.Icon {...props} icon="message-text-outline" />}>
                  <View style={styles.topicBody}>
                    <Button
                      mode="contained-tonal"
                      icon="volume-high"
                      onPress={() => void playTopic(t.id)}
                      style={styles.playTopicButton}
                      contentStyle={styles.playTopicContent}>
                      Nghe cả chủ đề
                    </Button>
                    {t.patterns.map((p, j) => (
                      <EntryRow
                        key={`${p.zh}-${j}`}
                        zh={p.zh}
                        py={p.py}
                        vi={p.vi}
                        rateKey={rateKey}
                        onNoVoice={() => setNoVoiceVisible(true)}
                      />
                    ))}
                  </View>
                </List.Accordion>
              </View>
            ))}
          </List.AccordionGroup>
        </Card>
      </ScrollView>

      <NoVoiceDialog visible={noVoiceVisible} onDismiss={() => setNoVoiceVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  rateButton: {
    borderRadius: radii.button,
  },
  rateContent: {
    height: 40,
  },
  listCard: {
    borderRadius: radii.card,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  divider: {
    marginLeft: spacing.lg,
  },
  topicBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  playTopicButton: {
    borderRadius: radii.button,
    marginTop: spacing.sm,
  },
  playTopicContent: {
    height: 44,
  },
});
