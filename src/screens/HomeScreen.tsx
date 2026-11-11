import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, Icon, IconButton, Text, useTheme } from 'react-native-paper';
import { getTotals, LESSONS } from '../data/lessons';
import { ensureReminders } from '../notifications/reminders';
import { getVoiceInfo, initTts, openGoogleTtsInstall } from '../speech/tts';
import { getIntervalHours } from '../storage';
import { brand, radii, spacing } from '../theme';
import type { Lesson, RootStackParamList } from '../types';
import { VoiceBanner } from '../components/VoiceBanner';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: { navigation: HomeNav }) {
  const theme = useTheme();
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const totals = getTotals();

  // Mỗi lần mở màn hình chính: kiểm tra lại giọng (người dùng có thể vừa
  // cài xong giọng rồi quay lại) và nạp thêm lịch nhắc học.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const info = await initTts();
        if (alive) setVoiceAvailable(info.available);
        const hours = await getIntervalHours();
        await ensureReminders(hours);
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
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Danh sách bài học
          </Text>
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
