import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, Icon, IconButton, Text, useTheme } from 'react-native-paper';
import { getTotals, LESSONS } from '../data/lessons';
import { getHsk1Totals } from '../data/hsk1';
import { ensureReminders } from '../notifications/reminders';
import { getVoiceInfo, initTts, openGoogleTtsInstall } from '../speech/tts';
import {
  getDueZhList,
  getFavorites,
  getIntervalHours,
  getStats,
  recordStudyDay,
} from '../storage';
import { brand, radii, spacing } from '../theme';
import type { LearningStats, Lesson, RootStackParamList } from '../types';
import { VoiceBanner } from '../components/VoiceBanner';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: { navigation: HomeNav }) {
  const theme = useTheme();
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const totals = getTotals();
  const hsk1Totals = getHsk1Totals();

  // Mỗi lần mở màn hình chính: ghi nhận ngày học (cho streak), kiểm tra
  // lại giọng (người dùng có thể vừa cài xong giọng rồi quay lại), nạp thêm
  // lịch nhắc học, và tải lại thống kê / số từ đến hạn ôn / số từ yêu thích.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const [info, hours, freshStats, due, favs] = await Promise.all([
          initTts(),
          getIntervalHours(),
          recordStudyDay(),
          getDueZhList(),
          getFavorites(),
        ]);
        await ensureReminders(hours);
        if (alive) {
          setVoiceAvailable(info.available);
          setStats(freshStats);
          setDueCount(due.length);
          setFavCount(favs.length);
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const renderLesson = ({ item }: { item: Lesson }) => (
    <Card
      style={styles.lessonCard}
      mode="elevated"
      elevation={2}
      onPress={() => navigation.navigate('Lesson', { lessonId: item.id })}>
      <Card.Content style={styles.lessonContent}>
        <Avatar.Text
          size={48}
          label={String(item.id)}
          style={{ backgroundColor: theme.colors.primary }}
          labelStyle={{ fontSize: 20, fontWeight: 'bold' }}
        />
        <View style={styles.lessonTexts}>
          <Text variant="titleLarge" style={styles.lessonTitle}>
            Bài {item.id}: {item.title}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {item.titleVi}
          </Text>
          <Text variant="labelLarge" style={{ color: theme.colors.primary, marginTop: 6 }}>
            {item.vocab.length} từ • {item.sentences.length} câu •{' '}
            {item.dialogue.length} hội thoại
          </Text>
        </View>
        <Icon source="chevron-right" size={28} color={theme.colors.onSurfaceVariant} />
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" />
      {/* Hero gradient */}
      <LinearGradient
        colors={[brand.green700, brand.green800]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text variant="headlineLarge" style={styles.heroZh}>
              学中文
            </Text>
            <Text variant="titleLarge" style={styles.heroTitle}>
              Học Tiếng Trung
            </Text>
            <Text variant="bodyMedium" style={styles.heroSub}>
              Giao tiếp mỗi ngày • Học nói trước
            </Text>
          </View>
          <IconButton
            icon="cog-outline"
            iconColor="#FFFFFF"
            size={26}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
        <Chip
          icon="book-open-variant"
          style={styles.heroChip}
          textStyle={{ color: '#FFFFFF', fontWeight: '700' }}>
          {totals.lessons} bài • {totals.vocab} từ • {totals.sentences} câu
        </Chip>
      </LinearGradient>

      <VoiceBanner
        visible={!voiceAvailable && !bannerDismissed}
        onInstall={() => void openGoogleTtsInstall()}
        onDismiss={() => setBannerDismissed(true)}
      />

      <FlatList
        data={LESSONS}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderLesson}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Thống kê + chuỗi ngày học */}
            <Card style={styles.infoCard} mode="elevated" elevation={2}>
              <Card.Content>
                <View style={styles.statsRow}>
                  <View style={styles.statCell}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: '800' }}>
                      🔥 {stats?.streak ?? 0}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      ngày liên tiếp
                    </Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: '800' }}>
                      {stats?.totalDays ?? 0}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      ngày đã học
                    </Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: '800' }}>
                      {stats?.totalPracticed ?? 0}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      lượt đã luyện
                    </Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: '800' }}>
                      {stats?.lessonsOpened.length ?? 0}/{totals.lessons}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      bài đã mở
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Ôn tập hôm nay (SRS) */}
            <Card
              style={styles.infoCard}
              mode="elevated"
              elevation={2}
              onPress={() => navigation.navigate('Review')}>
              <Card.Content style={styles.actionRow}>
                <Avatar.Icon
                  size={44}
                  icon="calendar-refresh-outline"
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                  color={theme.colors.primary}
                />
                <View style={styles.actionTexts}>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                    Ôn tập hôm nay
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {dueCount > 0
                      ? `${dueCount} từ đến hạn ôn — bấm để ôn ngay`
                      : 'Hôm nay không có từ nào cần ôn'}
                  </Text>
                </View>
                <Icon source="chevron-right" size={26} color={theme.colors.onSurfaceVariant} />
              </Card.Content>
            </Card>

            {/* Từ yêu thích */}
            <Card
              style={styles.infoCard}
              mode="elevated"
              elevation={2}
              onPress={() => navigation.navigate('Favorites')}>
              <Card.Content style={styles.actionRow}>
                <Avatar.Icon
                  size={44}
                  icon="star"
                  style={{ backgroundColor: theme.colors.tertiaryContainer }}
                  color={theme.colors.tertiary}
                />
                <View style={styles.actionTexts}>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                    Từ yêu thích
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {favCount > 0
                      ? `${favCount} từ đã lưu — bấm để xem lại`
                      : 'Chưa có từ nào — bấm sao ⭐ ở mỗi từ để lưu'}
                  </Text>
                </View>
                <Icon source="chevron-right" size={26} color={theme.colors.onSurfaceVariant} />
              </Card.Content>
            </Card>

            {/* Ngữ pháp HSK1 */}
            <Card
              style={styles.infoCard}
              mode="elevated"
              elevation={2}
              onPress={() => navigation.navigate('Grammar')}>
              <Card.Content style={styles.actionRow}>
                <Avatar.Icon
                  size={44}
                  icon="format-list-numbered"
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                  color={theme.colors.primary}
                />
                <View style={styles.actionTexts}>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                    Ngữ pháp HSK1
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {hsk1Totals.grammarLessons} bài • {hsk1Totals.grammarExamples} ví dụ — bấm để học
                  </Text>
                </View>
                <Icon source="chevron-right" size={26} color={theme.colors.onSurfaceVariant} />
              </Card.Content>
            </Card>

            {/* Mẫu câu giao tiếp */}
            <Card
              style={styles.infoCard}
              mode="elevated"
              elevation={2}
              onPress={() => navigation.navigate('Patterns')}>
              <Card.Content style={styles.actionRow}>
                <Avatar.Icon
                  size={44}
                  icon="message-text-outline"
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                  color={theme.colors.primary}
                />
                <View style={styles.actionTexts}>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                    Mẫu câu giao tiếp
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {hsk1Totals.topics} chủ đề • {hsk1Totals.patterns} mẫu câu — bấm để nói theo
                  </Text>
                </View>
                <Icon source="chevron-right" size={26} color={theme.colors.onSurfaceVariant} />
              </Card.Content>
            </Card>

            <Text variant="titleLarge" style={styles.sectionTitle}>
              Danh sách bài học
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radii.hero,
    borderBottomRightRadius: radii.hero,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroZh: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 34,
  },
  heroTitle: {
    color: brand.green100,
    fontWeight: '700',
    marginTop: 4,
  },
  heroSub: {
    color: '#BBF7D0',
    marginTop: 8,
  },
  heroChip: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoCard: {
    borderRadius: radii.card,
    marginTop: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionTexts: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  lessonCard: {
    borderRadius: radii.card,
    marginTop: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  lessonTexts: {
    flex: 1,
  },
  lessonTitle: {
    fontWeight: '700',
  },
});
