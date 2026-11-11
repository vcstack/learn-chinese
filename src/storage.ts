import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReminderInterval, SpeechRateKey } from './types';

const KEY_INTERVAL = 'reminder_interval_hours';
const KEY_RATE = 'speech_rate';

export const DEFAULT_INTERVAL: ReminderInterval = 2;
export const DEFAULT_RATE: SpeechRateKey = 'normal';

export async function getIntervalHours(): Promise<ReminderInterval> {
  const raw = await AsyncStorage.getItem(KEY_INTERVAL);
  const n = raw === null ? NaN : Number(raw);
  if (n === 0 || n === 1 || n === 2 || n === 4) return n;
  return DEFAULT_INTERVAL;
}

export async function setIntervalHours(hours: ReminderInterval): Promise<void> {
  await AsyncStorage.setItem(KEY_INTERVAL, String(hours));
}

export async function getSpeechRate(): Promise<SpeechRateKey> {
  const raw = await AsyncStorage.getItem(KEY_RATE);
  if (raw === 'slow' || raw === 'normal' || raw === 'fast') return raw;
  return DEFAULT_RATE;
}

export async function setSpeechRate(rate: SpeechRateKey): Promise<void> {
  await AsyncStorage.setItem(KEY_RATE, rate);
}
