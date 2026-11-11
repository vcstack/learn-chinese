import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, List, Text, useTheme } from 'react-native-paper';
import { EntryRow } from '../components/EntryRow';
import { NoVoiceDialog } from '../components/NoVoiceDialog';
import { GRAMMAR_LESSONS, getGrammarById } from '../data/hsk1';
import type { GrammarLesson } from '../data/hsk1';
import { speakAll } from '../speech/tts';
import { getSpeechRate, setSpeechRate } from '../storage';
import { radii, spacing } from '../theme';
import type { SpeechRateKey } from '../types';
import { RATE_ORDER, SPEECH_RATES } from '../types';

/**
 * Ngữ pháp HSK1 — màn hình standalone (chưa gắn navigation).
 * Danh sách 10 bài; bấm vào một bài để xem giải thích + ví dụ có phát âm.
 * Parent tích hợp sau bằng cách thêm route 'Grammar' và render <GrammarScreen />.
 */
export function GrammarScreen() {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<number | null>(null);
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

  const selected = selectedId !== null ? getGrammarById(selectedId) : undefined;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {selected ? (
        <GrammarDetailContent
          grammar={selected}
          rateKey={rateKey}
          onCycleRate={() => void cycleRate()}
          onNoVoice={() => setNoVoiceVisible(true)}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text variant="headlineSmall" style={styles.title}>
            Ngữ pháp HSK1
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, marginBottom: spacing.md }}>
            10 bài ngữ pháp trọng tâm trình độ HSK1 — bấm vào từng bài để xem giải thích và ví dụ có
            phát âm.
          </Text>
          <Card style={styles.listCard} mode="elevated" elevation={1}>
            {GRAMMAR_LESSONS.map((g, i) => (
              <View key={g.id}>
                {i > 0 ? <Divider style={styles.divider} /> : null}
                <List.Item
                  title={`Bài ${g.id}: ${g.title}`}
                  description={`${g.examples.length} ví dụ`}
                  left={(props) => <List.Icon {...props} icon="book-open-variant" />}
                  right={(props) => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => setSelectedId(g.id)}
                />
              </View>
            ))}
          </Card>
        </ScrollView>
      )}

      <NoVoiceDialog visible={noVoiceVisible} onDismiss={() => setNoVoiceVisible(false)} />
    </View>
  );
}

/**
 * Chi tiết một bài ngữ pháp — dùng được độc lập khi tích hợp navigation
 * (vd: route 'GrammarDetail' nhận grammarId rồi render
 * <GrammarDetailScreen grammarId={...} onBack={...} />).
 */
export function GrammarDetailScreen({
  grammarId,
  onBack,
}: {
  grammarId: number;
  onBack?: () => void;
}) {
  const theme = useTheme();
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

  const grammar = getGrammarById(grammarId);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {grammar ? (
        <GrammarDetailContent
          grammar={grammar}
          rateKey={rateKey}
          onCycleRate={() => void cycleRate()}
          onNoVoice={() => setNoVoiceVisible(true)}
          onBack={onBack}
        />
      ) : (
        <View style={styles.scroll}>
          <Text variant="bodyLarge">Không tìm thấy bài ngữ pháp.</Text>
        </View>
      )}

      <NoVoiceDialog visible={noVoiceVisible} onDismiss={() => setNoVoiceVisible(false)} />
    </View>
  );
}

/** Phần nội dung chi tiết dùng chung cho cả 2 màn hình trên. */
function GrammarDetailContent({
  grammar,
  rateKey,
  onCycleRate,
  onNoVoice,
  onBack,
}: {
  grammar: GrammarLesson;
  rateKey: SpeechRateKey;
  onCycleRate: () => void;
  onNoVoice: () => void;
  onBack?: () => void;
}) {
  const theme = useTheme();

  const playAll = async () => {
    const ok = await speakAll(
      grammar.examples.map((e) => e.zh),
      rateKey,
    );
    if (!ok) onNoVoice();
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {onBack ? (
        <Button
          mode="text"
          icon="arrow-left"
          onPress={onBack}
          style={styles.backButton}
          contentStyle={styles.backContent}>
          Quay lại danh sách
        </Button>
      ) : null}

      {/* Tiêu đề + giải thích */}
      <Card style={styles.headerCard} mode="contained">
        <Card.Content>
          <Text
            variant="headlineMedium"
            style={{ color: theme.colors.onPrimaryContainer, fontWeight: '800' }}>
            Bài {grammar.id}: {grammar.title}
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            {grammar.explanation}
          </Text>
        </Card.Content>
      </Card>

      {/* Nút hành động */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="volume-high"
          onPress={() => void playAll()}
          style={styles.actionButton}
          contentStyle={styles.actionContent}>
          Nghe tất cả ví dụ
        </Button>
        <Button
          mode="outlined"
          icon="speedometer"
          onPress={onCycleRate}
          style={styles.actionButton}
          contentStyle={styles.actionContent}>
          {SPEECH_RATES[rateKey].label}
        </Button>
      </View>

      {/* Ví dụ */}
      <List.Section>
        <List.Subheader style={styles.subheader}>Ví dụ</List.Subheader>
        {grammar.examples.map((e, i) => (
          <EntryRow
            key={`${e.zh}-${i}`}
            zh={e.zh}
            py={e.py}
            vi={e.vi}
            rateKey={rateKey}
            onNoVoice={onNoVoice}
          />
        ))}
      </List.Section>
    </ScrollView>
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
  listCard: {
    borderRadius: radii.card,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  divider: {
    marginLeft: spacing.lg,
  },
  headerCard: {
    borderRadius: radii.card,
    backgroundColor: '#F0FDF4',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    borderRadius: radii.button,
  },
  actionContent: {
    height: 48,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -spacing.sm,
    marginBottom: spacing.sm,
  },
  backContent: {
    height: 40,
  },
  subheader: {
    fontWeight: '700',
    fontSize: 18,
    paddingLeft: 0,
    paddingBottom: 0,
  },
});
