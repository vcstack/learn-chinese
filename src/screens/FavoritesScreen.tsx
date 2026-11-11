import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { EntryRow } from '../components/EntryRow';
import { NoVoiceDialog } from '../components/NoVoiceDialog';
import { getFavorites, getSpeechRate, removeFavorite } from '../storage';
import { spacing } from '../theme';
import type { SpeechRateKey, Vocab } from '../types';

/**
 * Màn hình "Từ yêu thích": xem lại toàn bộ từ/câu đã đánh dấu sao,
 * mỗi dòng có nút nghe và nút sao (bấm sao để bỏ đánh dấu).
 */
export function FavoritesScreen() {
  const theme = useTheme();
  const [favorites, setFavorites] = useState<Vocab[]>([]);
  const [rateKey, setRateKey] = useState<SpeechRateKey>('normal');
  const [noVoiceVisible, setNoVoiceVisible] = useState(false);

  // Mỗi lần mở màn hình: tải lại danh sách yêu thích (có thể vừa đánh dấu
  // ở màn hình bài học rồi quay lại).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const [favs, rate] = await Promise.all([getFavorites(), getSpeechRate()]);
        if (alive) {
          setFavorites(favs);
          setRateKey(rate);
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const unFav = async (zh: string) => {
    await removeFavorite(zh);
    setFavorites((prev) => prev.filter((f) => f.zh !== zh));
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="headlineMedium" style={{ textAlign: 'center' }}>
            ⭐
          </Text>
          <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            Chưa có từ yêu thích nào.
          </Text>
          <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            Bấm ngôi sao ⭐ ở mỗi dòng từ vựng, câu mẫu hoặc hội thoại để lưu
            lại đây ôn sau.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.zh}
          renderItem={({ item }) => (
            <EntryRow
              zh={item.zh}
              py={item.py}
              vi={item.vi}
              rateKey={rateKey}
              onNoVoice={() => setNoVoiceVisible(true)}
              favorite
              onToggleFavorite={() => void unFav(item.zh)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text variant="titleMedium" style={[styles.header, { color: theme.colors.onSurfaceVariant }]}>
              {favorites.length} từ đã lưu — bấm loa để nghe, bấm sao để bỏ
              đánh dấu.
            </Text>
          }
        />
      )}

      <NoVoiceDialog visible={noVoiceVisible} onDismiss={() => setNoVoiceVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginTop: spacing.sm,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
