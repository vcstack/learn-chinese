import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { NoVoiceDialog } from '../components/NoVoiceDialog';
import { SpeakFab } from '../components/SpeakFab';
import {
  getLessonById,
  getRandomEntriesExcluding,
  getRandomEntry,
  getRandomVocabExcluding,
} from '../data/lessons';
import { speak, stopSpeaking } from '../speech/tts';
import { getSpeechRate, recordPractice, recordSrsAnswer } from '../storage';
import { radii, spacing } from '../theme';
import type { RootStackParamList, SpeechRateKey, Vocab } from '../types';

type PracticeNav = NativeStackNavigationProp<RootStackParamList, 'Practice'>;
type PracticeRoute = RouteProp<RootStackParamList, 'Practice'>;

type Mode = 'flash' | 'quiz' | 'listen';

interface QuizItem {
  question: Vocab;
  options: Vocab[];
}

interface ListenItem {
  /** Từ/câu được phát âm (đáp án đúng). */
  question: Vocab;
  options: Vocab[];
  /** true = đáp án hiển thị chữ Hán, false = đáp án hiển thị nghĩa tiếng Việt. */
  askZh: boolean;
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

  // ---- Luyện nghe ----
  const [listen, setListen] = useState<ListenItem | null>(null);
  const [listenSelected, setListenSelected] = useState<Vocab | null>(null);
  const [listenScore, setListenScore] = useState(0);
  const [listenAnswered, setListenAnswered] = useState(0);
  // Luân phiên 2 dạng câu hỏi (đáp án chữ Hán / đáp án nghĩa Việt).
  const askZhRef = useRef(false);

  const cards = useMemo(() => (lesson ? shuffle(lesson.vocab) : []), [lesson]);

  const newQuiz = useCallback(() => {
    if (!lesson || lesson.vocab.length < 4) return;
    const q = lesson.vocab[Math.floor(Math.random() * lesson.vocab.length)];
    const distractors = getRandomVocabExcluding(q, 3);
    setQuiz({ question: q, options: shuffle([q, ...distractors]) });
    setSelected(null);
  }, [lesson]);

  const playListenQuestion = useCallback(
    async (item: ListenItem) => {
      const ok = await speak(item.question.zh, rateKey);
      if (!ok) setNoVoiceVisible(true);
    },
    [rateKey],
  );

  const newListen = useCallback(() => {
    const q = getRandomEntry();
    const distractors = getRandomEntriesExcluding(q, 3);
    askZhRef.current = !askZhRef.current;
    const item: ListenItem = {
      question: q,
      options: shuffle([q, ...distractors]),
      askZh: askZhRef.current,
    };
    setListen(item);
    setListenSelected(null);
  }, []);

  useEffect(() => {
    void getSpeechRate().then(setRateKey);
  }, []);

  useEffect(() => {
    if (mode === 'quiz' && !quiz) newQuiz();
  }, [mode, quiz, newQuiz]);

  useEffect(() => {
    if (mode === 'listen' && !listen) newListen();
  }, [mode, listen, newListen]);

  // Tự phát âm câu hỏi ngay khi có câu luyện nghe mới.
  useEffect(() => {
    if (mode === 'listen' && listen && !listenSelected) {
      void playListenQuestion(listen);
    }
  }, [mode, listen, listenSelected, playListenQuestion]);

  // Đổi chế độ thì dừng phát âm đang chạy (tránh chồng tiếng).
  useEffect(() => {
    stopSpeaking();
  }, [mode]);

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

  const revealFlash = () => {
    setRevealed(true);
    void recordPractice();
  };

  const chooseOption = (opt: Vocab) => {
    if (!quiz || selected) return;
    const correct = opt.zh === quiz.question.zh;
    setSelected(opt);
    setAnswered((n) => n + 1);
    if (correct) setScore((s) => s + 1);
    void recordSrsAnswer(quiz.question.zh, correct);
    void recordPractice();
  };

  const chooseListen = (opt: Vocab) => {
    if (!listen || listenSelected) return;
    const correct = opt.zh === listen.question.zh;
    setListenSelected(opt);
    setListenAnswered((n) => n + 1);
    if (correct) setListenScore((s) => s + 1);
    void recordSrsAnswer(listen.question.zh, correct);
    void recordPractice();
    // Tự phát lại đáp án đúng để nghe lại và ghi nhớ.
    const answerZh = listen.question.zh;
    setTimeout(() => {
      void speak(answerZh, rateKey).then((ok) => {
        if (!ok) setNoVoiceVisible(true);
      });
    }, 500);
  };

  const replayListen = () => {
    if (!listen) return;
    void playListenQuestion(listen);
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
            { value: 'listen', label: 'Luyện nghe', icon: 'headphones' },
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
              onPress={revealFlash}
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
        ) : mode === 'quiz' ? (
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
        ) : (
          <View>
            {listen ? (
              <View>
                <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]} mode="contained">
                  <Card.Content style={styles.quizQuestion}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      Nghe và chọn đáp án đúng:
                    </Text>
                    <View style={{ marginTop: spacing.lg }}>
                      <SpeakFab
                        text={listen.question.zh}
                        rateKey={rateKey}
                        size="large"
                        onNoVoice={() => setNoVoiceVisible(true)}
                      />
                    </View>
                    <Button
                      mode="text"
                      icon="replay"
                      onPress={replayListen}
                      style={{ marginTop: spacing.md }}>
                      Nghe lại
                    </Button>
                  </Card.Content>
                </Card>

                {listen.options.map((opt) => {
                  const isCorrect = opt.zh === listen.question.zh;
                  const isSelected = listenSelected?.zh === opt.zh;
                  let buttonColor: string | undefined;
                  let textColor: string | undefined;
                  if (listenSelected && isCorrect) {
                    buttonColor = theme.colors.primary;
                    textColor = '#FFFFFF';
                  } else if (listenSelected && isSelected && !isCorrect) {
                    buttonColor = theme.colors.error;
                    textColor = '#FFFFFF';
                  }
                  return (
                    <Button
                      key={opt.zh}
                      mode="outlined"
                      onPress={() => chooseListen(opt)}
                      disabled={!!listenSelected}
                      buttonColor={buttonColor}
                      textColor={textColor}
                      style={styles.optionButton}
                      contentStyle={styles.optionContent}>
                      {listen.askZh ? opt.zh : opt.vi}
                    </Button>
                  );
                })}

                {listenSelected ? (
                  <Card style={[styles.card, { marginTop: spacing.lg }]} mode="elevated" elevation={1}>
                    <Card.Content style={styles.listenAnswer}>
                      <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: '800' }}>
                        {listen.question.zh}
                      </Text>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {listen.question.py} • {listen.question.vi}
                      </Text>
                    </Card.Content>
                  </Card>
                ) : null}

                <Text variant="titleMedium" style={styles.score}>
                  Điểm: {listenScore}/{listenAnswered}
                </Text>

                <Button
                  mode="contained"
                  icon="arrow-right"
                  onPress={newListen}
                  disabled={!listenSelected}
                  style={styles.mainButton}
                  contentStyle={styles.buttonContent}>
                  Câu tiếp
                </Button>
              </View>
            ) : (
              <Text variant="bodyLarge">Đang chuẩn bị câu luyện nghe…</Text>
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
  listenAnswer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
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
