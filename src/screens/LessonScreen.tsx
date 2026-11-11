import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, List, Text, useTheme } from 'react-native-paper';
import { EntryRow } from '../components/EntryRow';
import { NoVoiceDialog } from '../components/NoVoiceDialog';
import { getLessonById } from '../data/lessons';
import { speakAll } from '../speech/tts';
import {
  getFavorites,
  getSpeechRate,
  recordLessonOpened,
  setSpeechRate,
  toggleFavorite,
} from '../storage';
import { radii, spacing } from '../theme';
import type { RootStackParamList, SpeechRateKey, Vocab } from '../types';
import { RATE_ORDER, SPEECH_RATES } from '../types';

type LessonNav = NativeStackNavigationProp<RootStackParamList, 'Lesson'>;
type LessonRoute = RouteProp<RootStackParamList, 'Lesson'>;

export function LessonScreen({
  navigation,
  route,
}: {
  navigation: LessonNav;
  route: LessonRoute;
}) {
  const theme = useTheme();
  const lesson = getLessonById(route.params.lessonId);
  const [rateKey, setRateKey] = useState<SpeechRateKey>('normal');
  const [noVoiceVisible, setNoVoiceVisible] = useState(false);
  // Tập chữ Hán đã đánh dấu yêu thích (đồng bộ với AsyncStorage).
  const [favSet, setFavSet] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    void getSpeechRate().then(setRateKey);
  }, []);

  // Mỗi lần mở bài: ghi nhận đã mở bài (cho thống kê) + tải lại yêu thích.
  useFocusEffect(
    useCallback(() => {
      if (!lesson) return;
      void recordLessonOpened(lesson.id);
      void getFavorites().then((favs) =>
        setFavSet(new Set(favs.map((f) => f.zh))),
      );
    }, [lesson]),
  );

  const toggleFav = async (entry: Vocab) => {
    const nowFav = await toggleFavorite(entry);
    setFavSet((prev) => {
      const next = new Set(prev);
      if (nowFav) next.add(entry.zh);
      else next.delete(entry.zh);
      return next;
    });
  };

  if (!lesson) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge">Không tìm thấy bài học.</Text>
      </View>
    );
  }

  const cycleRate = async () => {
    const idx = RATE_ORDER.indexOf(rateKey);
    const next = RATE_ORDER[(idx + 1) % RATE_ORDER.length];
    setRateKey(next);
    await setSpeechRate(next);
  };

  const playAll = async () => {
    const ok = await speakAll(
      lesson.dialogue.map((d) => d.zh),
      rateKey,
    );
    if (!ok) setNoVoiceVisible(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Tiêu đề bài */}
        <Card style={styles.headerCard} mode="contained">
          <Card.Content>
            <Text variant="headlineMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: '800' }}>
              {lesson.title}
            </Text>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Bài {lesson.id}: {lesson.titleVi}
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
            Nghe cả đoạn
          </Button>
          <Button
            mode="outlined"
            icon="microphone-outline"
            onPress={() => navigation.navigate('Practice', { lessonId: lesson.id })}
            style={styles.actionButton}
            contentStyle={styles.actionContent}>
            Luyện nói
          </Button>
          <Button
            mode="outlined"
            icon="speedometer"
            onPress={() => void cycleRate()}
            style={styles.actionButton}
            contentStyle={styles.actionContent}>
            {SPEECH_RATES[rateKey].label}
          </Button>
        </View>

        {/* Từ vựng */}
        <List.Section>
          <List.Subheader style={styles.subheader}>Từ vựng</List.Subheader>
          {lesson.vocab.map((w, i) => (
            <EntryRow
              key={`${w.zh}-${i}`}
              zh={w.zh}
              py={w.py}
              vi={w.vi}
              rateKey={rateKey}
              onNoVoice={() => setNoVoiceVisible(true)}
              favorite={favSet.has(w.zh)}
              onToggleFavorite={() => void toggleFav(w)}
            />
          ))}
        </List.Section>

        {/* Câu mẫu */}
        <List.Section>
          <List.Subheader style={styles.subheader}>Câu mẫu</List.Subheader>
          {lesson.sentences.map((s, i) => (
            <EntryRow
              key={`${s.zh}-${i}`}
              zh={s.zh}
              py={s.py}
              vi={s.vi}
              rateKey={rateKey}
              onNoVoice={() => setNoVoiceVisible(true)}
              favorite={favSet.has(s.zh)}
              onToggleFavorite={() => void toggleFav(s)}
            />
          ))}
        </List.Section>

        {/* Hội thoại */}
        <List.Section>
          <List.Subheader style={styles.subheader}>Hội thoại</List.Subheader>
          {lesson.dialogue.map((d, i) => (
            <EntryRow
              key={`${d.zh}-${i}`}
              zh={d.zh}
              py={d.py}
              vi={d.vi}
              speaker={d.sp}
              rateKey={rateKey}
              onNoVoice={() => setNoVoiceVisible(true)}
              favorite={favSet.has(d.zh)}
              onToggleFavorite={() => void toggleFav(d)}
            />
          ))}
        </List.Section>
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
  subheader: {
    fontWeight: '700',
    fontSize: 18,
    paddingLeft: 0,
    paddingBottom: 0,
  },
});
