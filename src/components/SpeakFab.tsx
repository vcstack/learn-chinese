import React from 'react';
import { FAB } from 'react-native-paper';
import { speak } from '../speech/tts';
import type { SpeechRateKey } from '../types';

interface SpeakFabProps {
  /** Chữ Hán cần đọc. */
  text: string;
  rateKey: SpeechRateKey;
  size?: 'small' | 'medium' | 'large';
  /** Gọi khi máy không có giọng tiếng Trung (để hiện hướng dẫn cài giọng). */
  onNoVoice: () => void;
  disabled?: boolean;
}

/**
 * Nút nghe hình tròn xanh lá (Paper FAB) — dùng xuyên suốt app.
 * Bấm mà máy không có giọng tiếng Trung thì báo cho màn hình cha xử lý.
 */
export function SpeakFab({
  text,
  rateKey,
  size = 'small',
  onNoVoice,
  disabled = false,
}: SpeakFabProps) {
  const handlePress = async () => {
    const ok = await speak(text, rateKey);
    if (!ok) onNoVoice();
  };

  return (
    <FAB
      icon="volume-high"
      size={size}
      onPress={handlePress}
      disabled={disabled}
      color="#FFFFFF"
      style={{ backgroundColor: '#15803D', borderRadius: 28 }}
    />
  );
}
