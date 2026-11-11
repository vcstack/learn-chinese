import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text, useTheme } from 'react-native-paper';
import { findEntryByZh } from '../data/lessons';
import { NoVoiceDialog } from '../components/NoVoiceDialog';
import { SpeakFab } from '../components/SpeakFab';
import {
  getDueZhList,
  getSpeechRate,
  recordPractice,
  recordSrsAnswer,
} from '../storage';
import { radii, spacing } from '../theme';
import type { SpeechRateKey, Vocab } from '../types';

/**
 * Màn hình "Ôn tập hôm nay": flashcard chỉ với các từ đến hạn ôn theo SRS.
 * Lật đáp án rồi bấm "Nhớ rồi" (level +1, dời lịch ôn xa hơn) hoặc
 * "Chưa nhớ" (level về 0, ôn lại ngay hôm nay).
 */
export function ReviewScreen() {
  const theme = useTheme();
  const [due, setDue] = useState<Vocab[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [rateKey, setRateKey] = useState<SpeechRateKey>('normal');
  const [noVoiceVisible, setNoVoiceVisible] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  // Mỗi lần mở màn hình: tải lại danh sách từ đến hạn (có thể vừa trả lời
  // xong ở màn hình khác, lịch ôn đã thay đổi).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const [zhList, rate] = await Promise.all([getDueZhList(), getSpeechRate()]);
        if (!alive) return;
        const entries = zhList
          .map((zh) => findEntryByZh(zh))
          .filter((e): e is Vocab => e !== undefined);
        setDue(entries);
        setRateKey(rate);
        setIndex(0);
        setRevealed(false);
        setDoneCount(0);
        setLoaded(true);
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const current = due[index];
  const finished = loaded && (due.length === 0 || index >= due.length);

  const answer = async (remembered: boolean) => {
    if (!current) return;
    await recordSrsAnswer(current.zh, remembered);
    await recordPractice();
    setDoneCount((n) => n + 1);
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!loaded ? (
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Đang tải danh sách ôn tập…
          </Text>
        ) : finished ? (
          <Card style={styles.card} mode="elevated" elevation={2}>
            <Card.Content style={styles.doneContent}>
              <Text variant="headlineMedium" style={{ textAlign: 'center' }}>
                🎉
              </Text>
              <Text variant="titleLarge" style={[styles.doneTitle, { color: theme.colors.primary }]}>
                {due.length === 0
                  ? 'Hôm nay không có từ nào cần ôn.'
                  : `Đã ôn xong ${doneCount} từ!`}
              </Text>
              <Text variant="bodyMedium" style={[styles.doneText, { color: theme.colors.onSurfaceVariant }]}>
                {due.length === 0
                  ? 'Các từ đã học sẽ xuất hiện ở đây khi đến hạn ôn theo lịch lặp lại ngắt quãng. Trả lời đúng trong Trắc nghiệm hoặc Luyện nghe để bắt đầu tính lịch ôn.'
                  : 'Những từ bấm "Nhớ rồi" sẽ được dời lịch ôn xa hơn, từ "Chưa nhớ" sẽ ôn lại ngay hôm nay.'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <View>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Còn {due.length - index} từ đến hạn • Đã ôn {doneCount} từ
            </Text>

            <Card style={[styles.card, { marginTop: spacing.lg }]} mode="elevated" elevation={2}>
              <Card.Content style={styles.flashContent}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Tự nói tiếng Trung cho nghĩa dưới đây:
                </Text>
                <Text variant="headlineMedium" style={styles.flashVi}>
                  {current.vi}
                </Text>
                <Divider style={{ marginTop: spacing.lg }} />
                {revealed ? (
                  <View style={styles.answer}>
                    <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: '800' }}>
                      {current.zh}
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                      {current.py}
                    </Text>
                    <View style={{ marginTop: spacing.lg }}>
                      <SpeakFab
                        text={current.zh}
                        rateKey={rateKey}
                        size="medium"
                        onNoVoice={() => setNoVoiceVisible(true)}
                      />
                    </View>
                  </View>
                ) : (
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.lg }}>
                    Bấm &quot;Hiện đáp án&quot; để xem chữ Hán và nghe phát âm.
                  </Text>
                )}
              </Card.Content>
            </Card>

            {!revealed ? (
              <Button
                mode="contained"
                icon="eye-outline"
                onPress={() => setRevealed(true)}
                style={styles.mainButton}
                contentStyle={styles.buttonContent}>
                Hiện đáp án
              </Button>
            ) : (
              <View style={styles.answerRow}>
                <Button
                  mode="outlined"
                  icon="close-circle-outline"
                  onPress={() => void answer(false)}
                  style={styles.answerButton}
                  contentStyle={styles.buttonContent}
                  textColor={theme.colors.error}>
                  Chưa nhớ
                </Button>
                <Button
                  mode="contained"
                  icon="check-circle-outline"
                  onPress={() => void answer(true)}
                  style={styles.answerButton}
                  contentStyle={styles.buttonContent}>
                  Nhớ rồi
                </Button>
              </View>
            )}
          </View>
        )}
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
  card: {
    borderRadius: radii.card,
    backgroundColor: '#FFFFFF',
  },
  flashContent: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  flashVi: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  answer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  mainButton: {
    borderRadius: radii.button,
    marginTop: spacing.md,
  },
  buttonContent: {
    height: 52,
  },
  answerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  answerButton: {
    flex: 1,
    borderRadius: radii.button,
  },
  doneContent: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  doneTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  doneText: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
