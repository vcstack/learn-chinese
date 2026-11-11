import React from 'react';
import { Banner, useTheme } from 'react-native-paper';

interface VoiceBannerProps {
  visible: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

/**
 * Banner cảnh báo khi máy chưa có giọng tiếng Trung — hiện ở đầu màn hình
 * chính. Bấm "Cài giọng ngay" mở Play Store trang Google TTS.
 */
export function VoiceBanner({ visible, onInstall, onDismiss }: VoiceBannerProps) {
  const theme = useTheme();
  return (
    <Banner
      visible={visible}
      icon="alert-circle-outline"
      style={{ backgroundColor: theme.colors.tertiaryContainer }}
      actions={[
        {
          label: 'Cài giọng ngay',
          onPress: onInstall,
        },
        {
          label: 'Để sau',
          onPress: onDismiss,
        },
      ]}>
      Máy chưa có giọng đọc tiếng Trung nên nút Nghe sẽ không phát ra tiếng.
      Cài giọng Google TTS một lần là dùng được mãi.
    </Banner>
  );
}
