import * as Linking from 'expo-linking';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import type { SpeechRateKey } from '../types';
import { SPEECH_RATES } from '../types';

/**
 * Phát âm tiếng Trung bằng expo-speech.
 *
 * Máy cần có giọng tiếng Trung. Nhiều máy (vd: Xiaomi/MIUI) mặc định không
 * có giọng này nên sẽ không phát ra tiếng — module này phát hiện và trả về
 * false để UI hiện hướng dẫn cài giọng Google TTS thay vì im lặng.
 */

export interface VoiceInfo {
  available: boolean;
  /** Tên giọng đang dùng, vd: "zh-CN-language". */
  voiceName: string | null;
  language: string | null;
}

let cachedVoice: Speech.Voice | null = null;
let voiceChecked = false;

/** Ưu tiên giọng: zh-CN trước, rồi zh-TW/zh-HK/zh-SG, rồi bất kỳ giọng zh nào. */
function pickChineseVoice(voices: Speech.Voice[]): Speech.Voice | null {
  const zh = voices.filter((v) => v.language.toLowerCase().startsWith('zh'));
  if (zh.length === 0) return null;
  const byLang = (prefix: string) =>
    zh.find((v) => v.language.toLowerCase().startsWith(prefix));
  const enhanced = (list: Speech.Voice[]) =>
    list.find((v) => v.quality === Speech.VoiceQuality.Enhanced) ?? list[0];
  return (
    byLang('zh-cn') ??
    byLang('zh-tw') ??
    byLang('zh-hk') ??
    byLang('zh-sg') ??
    enhanced(zh)
  );
}

/** Quét giọng có sẵn trên máy. Gọi một lần khi app khởi động. */
export async function initTts(): Promise<VoiceInfo> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    cachedVoice = pickChineseVoice(voices);
  } catch {
    cachedVoice = null;
  }
  voiceChecked = true;
  return getVoiceInfo();
}

export function getVoiceInfo(): VoiceInfo {
  return {
    available: cachedVoice !== null,
    voiceName: cachedVoice?.name ?? null,
    language: cachedVoice?.language ?? null,
  };
}

/**
 * Phát âm một đoạn tiếng Trung.
 * Trả về false nếu máy không có giọng tiếng Trung (caller hiện hướng dẫn
 * cài giọng). Trả về true nếu đã phát (hoặc đang chờ quét giọng xong).
 */
export async function speak(text: string, rateKey: SpeechRateKey): Promise<boolean> {
  if (!voiceChecked) await initTts();
  if (!cachedVoice) return false;
  const rate = SPEECH_RATES[rateKey].rate;
  Speech.speak(text, {
    language: cachedVoice.language,
    voice: cachedVoice.identifier,
    rate,
    pitch: 1.0,
  });
  return true;
}

/** Đọc liền nhiều câu, mỗi câu một lượt (nối tiếp bằng onDone). */
export async function speakAll(texts: string[], rateKey: SpeechRateKey): Promise<boolean> {
  if (texts.length === 0) return true;
  if (!voiceChecked) await initTts();
  if (!cachedVoice) return false;
  const rate = SPEECH_RATES[rateKey].rate;
  const voice = cachedVoice;
  const speakNext = (index: number) => {
    if (index >= texts.length) return;
    Speech.speak(texts[index], {
      language: voice.language,
      voice: voice.identifier,
      rate,
      pitch: 1.0,
      onDone: () => speakNext(index + 1),
      onError: () => speakNext(index + 1),
      onStopped: () => {},
    });
  };
  speakNext(0);
  return true;
}

export function stopSpeaking(): void {
  Speech.stop();
}

/** Mở trang Google TTS trên Play Store để cài giọng đọc. */
export async function openGoogleTtsInstall(): Promise<void> {
  const pkg = 'com.google.android.tts';
  if (Platform.OS === 'android') {
    try {
      await Linking.openURL(`market://details?id=${pkg}`);
      return;
    } catch {
      // Rơi xuống link web bên dưới.
    }
  }
  await Linking.openURL(
    `https://play.google.com/store/apps/details?id=${pkg}`,
  );
}

/** Mở màn hình cài đặt Text-to-speech của hệ thống (Android). */
export async function openTtsSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Linking.sendIntent('android.settings.TTS_SETTINGS');
      return;
    } catch {
      // Rơi xuống mở cài đặt chung của app.
    }
  }
  await Linking.openSettings();
}
