import React from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { openGoogleTtsInstall, openTtsSettings } from '../speech/tts';

interface NoVoiceDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Hộp thoại hướng dẫn khi máy chưa có giọng tiếng Trung.
 * Hiện khi người dùng bấm nút Nghe mà phát âm trả về false.
 */
export function NoVoiceDialog({ visible, onDismiss }: NoVoiceDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Chưa có giọng tiếng Trung</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Máy của bạn chưa có giọng đọc tiếng Trung nên nút Nghe chưa phát
            ra tiếng.
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            Cần cài giọng Google TTS tiếng Trung (miễn phí, làm một lần duy
            nhất):
            {'\n'}1. Bấm &quot;Cài giọng ngay&quot; để tải Google TTS.
            {'\n'}2. Mở Google TTS → Cài đặt → Cài đặt dữ liệu giọng nói →
            Tiếng Trung (Trung Quốc) → Tải về.
            {'\n'}3. Quay lại app, bấm Nghe là đọc được.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Để sau</Button>
          <Button onPress={() => void openTtsSettings()}>Mở cài đặt giọng</Button>
          <Button onPress={() => void openGoogleTtsInstall()}>Cài giọng ngay</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
