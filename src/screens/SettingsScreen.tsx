import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, List, RadioButton, Snackbar, Text, useTheme } from 'react-native-paper';
import { ensureReminders, sendTestWord } from '../notifications/reminders';
import { getVoiceInfo, initTts, openGoogleTtsInstall, openTtsSettings, type VoiceInfo } from '../speech/tts';
import { getIntervalHours, setIntervalHours } from '../storage';
import { radii, spacing } from '../theme';
import type { ReminderInterval } from '../types';
import { REMINDER_OPTIONS } from '../types';

export function SettingsScreen() {
  const theme = useTheme();
  const [interval, setInterval] = useState<ReminderInterval>(2);
  const [voice, setVoice] = useState<VoiceInfo>({ available: false, voiceName: null, language: null });
  const [snack, setSnack] = useState('');

  // Mỗi lần mở Cài đặt: tải lại khoảng nhắc + trạng thái giọng (người dùng
  // có thể vừa cài xong giọng rồi quay lại).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const [h, info] = await Promise.all([getIntervalHours(), initTts()]);
        if (alive) {
          setInterval(h);
          setVoice(info);
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const changeInterval = async (hours: ReminderInterval) => {
    setInterval(hours);
    await setIntervalHours(hours);
    await ensureReminders(hours);
    setSnack(hours === 0 ? 'Đã tắt nhắc học' : `Nhắc học mỗi ${hours} giờ`);
  };

  const testWord = async () => {
    const ok = await sendTestWord();
    setSnack(
      ok
        ? 'Đã gửi thử 1 từ vựng lên thanh thông báo'
        : 'Chưa cấp quyền thông báo — hãy bật quyền trong Cài đặt hệ thống',
    );
  };

  const refreshVoice = async () => {
    const info = await initTts();
    setVoice(info);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Nhắc học */}
        <Card style={styles.card} mode="elevated" elevation={2}>
          <Card.Content>
            <List.Subheader style={styles.subheader}>Nhắc học</List.Subheader>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Hiện từ vựng lên thanh thông báo để ôn theo giờ
            </Text>
            <RadioButton.Group
              value={String(interval)}
              onValueChange={(v) => void changeInterval(Number(v) as ReminderInterval)}>
              {REMINDER_OPTIONS.map((opt) => (
                <RadioButton.Item
                  key={opt.hours}
                  label={opt.label}
                  value={String(opt.hours)}
                  labelStyle={{ fontSize: 15 }}
                />
              ))}
            </RadioButton.Group>
            <Button
              mode="contained"
              icon="bell-ring-outline"
              onPress={() => void testWord()}
              style={styles.button}
              contentStyle={styles.buttonContent}>
              Gửi thử 1 từ ngay
            </Button>
          </Card.Content>
        </Card>

        {/* Giọng đọc */}
        <Card style={[styles.card, { marginTop: spacing.lg }]} mode="elevated" elevation={2}>
          <Card.Content>
            <List.Subheader style={styles.subheader}>Giọng đọc tiếng Trung</List.Subheader>
            <Text variant="bodyLarge">
              {voice.available
                ? `Đã sẵn sàng ✓\nGiọng: ${voice.voiceName ?? ''} (${voice.language ?? ''})\nNút Nghe sẽ phát âm được bình thường.`
                : 'Chưa có giọng tiếng Trung trên máy nên nút Nghe chưa phát ra tiếng. Bấm nút dưới để cài giọng Google TTS (miễn phí, một lần duy nhất).'}
            </Text>
            {!voice.available ? (
              <Button
                mode="contained"
                icon="download-outline"
                onPress={() => void openGoogleTtsInstall()}
                style={styles.button}
                contentStyle={styles.buttonContent}>
                Cài giọng tiếng Trung
              </Button>
            ) : null}
            <Button
              mode="outlined"
              icon="cog-outline"
              onPress={() => void openTtsSettings()}
              style={styles.button}
              contentStyle={styles.buttonContent}>
              Mở cài đặt giọng đọc hệ thống
            </Button>
            <Button
              mode="text"
              icon="refresh"
              onPress={() => void refreshVoice()}
              style={styles.button}>
              Kiểm tra lại giọng
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snack.length > 0}
        onDismiss={() => setSnack('')}
        duration={3000}
        action={{ label: 'OK', onPress: () => setSnack('') }}>
        {snack}
      </Snackbar>
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
  subheader: {
    fontWeight: '700',
    fontSize: 18,
    paddingLeft: 0,
    paddingBottom: 0,
  },
  button: {
    borderRadius: radii.button,
    marginTop: spacing.md,
  },
  buttonContent: {
    height: 52,
  },
});
