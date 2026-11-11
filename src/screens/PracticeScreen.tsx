import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { NoVoiceDialog } from '../components/NoVoiceDialog';
import { SpeakFab } from '../components/SpeakFab';
import { getLessonById, getRandomVocabExcluding } from '../data/lessons';
import { getSpeechRate } from '../storage';
import { radii, spacing } from '../theme';
import type { RootStackParamList, SpeechRateKey, Vocab } from '../types';

type PracticeNav = NativeStackNavigationProp<RootStackParamList, 'Practice'>;
type PracticeRoute = RouteProp<RootStackParamList, 'Practice'>;

type Mode = 'flash' | 'quiz';

interface QuizItem {
  question: Vocab;
  options: Vocab[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PracticeScreen({ route }: { navigation: PracticeNav; route: PracticeRoute }) {
  const theme = useTheme();
  const lesson = getLessonById(route.params.lessonId);
  const [mode, setMode] = useState<Mode>('flash');
  const [rateKey, setRateKey] = useState<SpeechRateKey>('normal');
  const [noVoiceVisible, setNoVoiceVisible] = useState(false);

  // ---- Flashcard ----
  const [flashIndex, setFlashIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // ---- Quiz ----
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [selected, setSelected] = useState<Vocab | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const cards = useMemo(() => (lesson ? shuffle(lesson.vocab) : []), [lesson]);

  const newQuiz = useCallback(() => {
    if (!lesson || lesson.vocab.length < 4) return;
    const q = lesson.vocab[Math.floor(Math.random() * lesson.vocab.length)];
    const distractors = getRandomVocabExcluding(q, 3);
    setQuiz({ question: q, options: shuffle([q, ...distractors]) });
    setSelected(null);
  }, [lesson]);

  useEffect(() => {
    void getSpeechRate().then(setRateKey);
  }, []);

  useEffect(() => {
    if (mode === 'quiz' && !quiz) newQuiz();
  }, [mode, quiz, newQuiz]);

  if (!lesson) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge">Không tìm thấy bài học.</Text>
      </View>
    );
  }

  const flashCard = cards[flashIndex % cards.length];

  const nextFlash = () => {
    setRevealed(false);
    setFlashIndex((i) => i + 1);
  };

  const chooseOption = (opt: Vocab) => {
    if (!quiz || selected) return;
    setSelected(opt);
    setAnswered((n) => n + 1);
    if (opt.zh === quiz.question.zh) setScore((s) => s + 1);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SegmentedButtons
          value={mode}
          onValueChange={(v) => setMode(v as Mode)}
          buttons={[
            { value: 'flash', label: 'Flashcard', icon: 'cards-outline' },
            { value: 'quiz', label: 'Trắc nghiệm', icon: 'help-circle-outline' },
          ]}
          style={{ marginBottom: spacing.lg }}
        />

        {mode === 'flash' ? (
          <View>
            <Card style={styles.card} mode="elevated" elevation={2}>
              <Card.Content style={styles.flashContent}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Tự nói tiếng Trung cho nghĩa dưới đây:
                </Text>
                <Text variant="headlineMedium" style={styles.flashVi}>
                  {flashCard.vi}
                </Text>
                <Divider style={{ marginTop: spacing.lg }} />
                {revealed ? (
                  <View style={styles.answer}>
                    <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: '800' }}>
                      {flashCard.zh}
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                      {flashCard.py}
                    </Text>
                    <View style={{ marginTop: spacing.lg }}>
                      <SpeakFab
                        text={flashCard.zh}
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

            <Button
              mode="contained"
              icon="eye-outline"
              onPress={() => setRevealed(true)}
              disabled={revealed}
              style={styles.mainButton}
              contentStyle={styles.buttonContent}>
              Hiện đáp án
            </Button>
            <Button
              mode="outlined"
              icon="arrow-right"
              onPress={nextFlash}
              style={styles.mainButton}
              contentStyle={styles.buttonContent}>
              Từ tiếp
            </Button>
          </View>
        ) : (
          <View>
            {quiz ? (
              <View>
                <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]} mode="contained">
                  <Card.Content style={styles.quizQuestion}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      Từ này nghĩa là gì?
                    </Text>
                    <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: '800', marginTop: 12 }}>
                      {quiz.question.zh}
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                      {quiz.question.py}
                    </Text>
                  </Card.Content>
                </Card>

                {quiz.options.map((opt) => {
                  const isCorrect = opt.zh === quiz.question.zh;
                  const isSelected = selected?.zh === opt.zh;
                  let buttonColor: string | undefined;
                  let textColor: string | undefined;
                  if (selected && isCorrect) {
                    buttonColor = theme.colors.primary;
                    textColor = '#FFFFFF';
                  } else if (selected && isSelected && !isCorrect) {
                    buttonColor = theme.colors.error;
                    textColor = '#FFFFFF';
                  }
                  return (
                    <Button
                      key={opt.zh}
                      mode="outlined"
                      onPress={() => chooseOption(opt)}
                      disabled={!!selected}
                      buttonColor={buttonColor}
                      textColor={textColor}
                      style={styles.optionButton}
                      contentStyle={styles.optionContent}>
                      {opt.vi}
                    </Button>
                  );
                })}

                <Text variant="titleMedium" style={styles.score}>
                  Điểm: {score}/{answered}
                </Text>

                <Button
                  mode="contained"
                  icon="arrow-right"
                  onPress={newQuiz}
                  disabled={!selected}
                  style={styles.mainButton}
                  contentStyle={styles.buttonContent}>
                  Câu tiếp
                </Button>
              </View>
            ) : (
              <Text variant="bodyLarge">Bài này chưa đủ 4 từ để làm trắc nghiệm.</Text>
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
  quizQuestion: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  mainButton: {
    borderRadius: radii.button,
    marginTop: spacing.md,
  },
  buttonContent: {
    height: 52,
  },
  optionButton: {
    borderRadius: radii.button,
    marginTop: spacing.md,
  },
  optionContent: {
    height: 56,
    justifyContent: 'flex-start',
  },
  score: {
    textAlign: 'center',
    color: '#15803D',
    fontWeight: '700',
    marginTop: spacing.lg,
  },
});
