import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  LearningStats,
  ReminderInterval,
  SpeechRateKey,
  SrsEntry,
  SrsMap,
  Vocab,
} from './types';
import { SRS_INTERVALS_DAYS, SRS_MAX_LEVEL } from './types';

const KEY_INTERVAL = 'reminder_interval_hours';
const KEY_RATE = 'speech_rate';
const KEY_FAVORITES = 'favorites';
const KEY_STATS = 'learning_stats';
const KEY_SRS = 'srs_progress';

export const DEFAULT_INTERVAL: ReminderInterval = 2;
export const DEFAULT_RATE: SpeechRateKey = 'normal';

// ---------------------------------------------------------------------------
// Cài đặt có sẵn (khoảng nhắc, tốc độ đọc)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Ngày (YYYY-MM-DD, giờ địa phương) — dùng chung cho streak và SRS
// ---------------------------------------------------------------------------

export function todayStr(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return todayStr(date);
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// ---------------------------------------------------------------------------
// Từ yêu thích — lưu theo chữ Hán (zh làm khóa duy nhất)
// ---------------------------------------------------------------------------

export async function getFavorites(): Promise<Vocab[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_FAVORITES);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Vocab[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function isFavorite(zh: string): Promise<boolean> {
  const favs = await getFavorites();
  return favs.some((f) => f.zh === zh);
}

/**
 * Đánh dấu / bỏ đánh dấu một từ. Trả về trạng thái mới (true = đã yêu thích).
 */
export async function toggleFavorite(entry: Vocab): Promise<boolean> {
  const favs = await getFavorites();
  const idx = favs.findIndex((f) => f.zh === entry.zh);
  if (idx >= 0) {
    favs.splice(idx, 1);
    await AsyncStorage.setItem(KEY_FAVORITES, JSON.stringify(favs));
    return false;
  }
  favs.push({ zh: entry.zh, py: entry.py, vi: entry.vi });
  await AsyncStorage.setItem(KEY_FAVORITES, JSON.stringify(favs));
  return true;
}

export async function removeFavorite(zh: string): Promise<void> {
  const favs = await getFavorites();
  const next = favs.filter((f) => f.zh !== zh);
  await AsyncStorage.setItem(KEY_FAVORITES, JSON.stringify(next));
}

// ---------------------------------------------------------------------------
// Chuỗi ngày học + thống kê
// ---------------------------------------------------------------------------

const EMPTY_STATS: LearningStats = {
  lastStudyDate: null,
  streak: 0,
  totalDays: 0,
  totalPracticed: 0,
  lessonsOpened: [],
};

export async function getStats(): Promise<LearningStats> {
  try {
    const raw = await AsyncStorage.getItem(KEY_STATS);
    if (!raw) return { ...EMPTY_STATS, lessonsOpened: [] };
    const parsed = JSON.parse(raw) as Partial<LearningStats>;
    return {
      lastStudyDate: parsed.lastStudyDate ?? null,
      streak: parsed.streak ?? 0,
      totalDays: parsed.totalDays ?? 0,
      totalPracticed: parsed.totalPracticed ?? 0,
      lessonsOpened: Array.isArray(parsed.lessonsOpened) ? parsed.lessonsOpened : [],
    };
  } catch {
    return { ...EMPTY_STATS, lessonsOpened: [] };
  }
}

async function saveStats(stats: LearningStats): Promise<void> {
  await AsyncStorage.setItem(KEY_STATS, JSON.stringify(stats));
}

/**
 * Ghi nhận một ngày học. Tính streak đúng:
 * - Hôm nay đã ghi rồi: không đổi.
 * - Hôm qua đã học: streak +1.
 * - Cách hơn 1 ngày (hoặc lần đầu): streak reset về 1.
 * Trả về stats mới.
 */
export async function recordStudyDay(): Promise<LearningStats> {
  const stats = await getStats();
  const today = todayStr();
  if (stats.lastStudyDate === today) return stats;
  const yesterday = addDaysStr(today, -1);
  const continued = stats.lastStudyDate === yesterday;
  const next: LearningStats = {
    ...stats,
    lastStudyDate: today,
    streak: continued ? stats.streak + 1 : 1,
    totalDays: stats.totalDays + 1,
  };
  await saveStats(next);
  return next;
}

/** Ghi nhận một lượt luyện tập hoàn thành (đồng thời ghi nhận ngày học). */
export async function recordPractice(): Promise<LearningStats> {
  const stats = await recordStudyDay();
  const next: LearningStats = {
    ...stats,
    totalPracticed: stats.totalPracticed + 1,
  };
  await saveStats(next);
  return next;
}

/** Ghi nhận đã mở một bài học (đồng thời ghi nhận ngày học). */
export async function recordLessonOpened(lessonId: number): Promise<LearningStats> {
  const stats = await recordStudyDay();
  if (stats.lessonsOpened.includes(lessonId)) return stats;
  const next: LearningStats = {
    ...stats,
    lessonsOpened: [...stats.lessonsOpened, lessonId],
  };
  await saveStats(next);
  return next;
}

// ---------------------------------------------------------------------------
// Ôn tập lặp lại ngắt quãng (SRS) — nhẹ, theo từng từ
// ---------------------------------------------------------------------------

export async function getSrsMap(): Promise<SrsMap> {
  try {
    const raw = await AsyncStorage.getItem(KEY_SRS);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SrsMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function saveSrsMap(map: SrsMap): Promise<void> {
  await AsyncStorage.setItem(KEY_SRS, JSON.stringify(map));
}

/**
 * Ghi nhận kết quả trả lời một từ trong Trắc nghiệm / Luyện nghe / Ôn tập.
 * - Đúng: level +1 (tối đa 5), ngày ôn tiếp theo = hôm nay + khoảng của level mới.
 * - Sai: level về 0, ôn lại ngay hôm nay.
 */
export async function recordSrsAnswer(zh: string, correct: boolean): Promise<SrsEntry> {
  const map = await getSrsMap();
  const today = todayStr();
  let entry: SrsEntry;
  if (correct) {
    const prev = map[zh]?.level ?? 0;
    const level = Math.min(prev + 1, SRS_MAX_LEVEL);
    entry = { level, nextReview: addDaysStr(today, SRS_INTERVALS_DAYS[level]) };
  } else {
    entry = { level: 0, nextReview: today };
  }
  map[zh] = entry;
  await saveSrsMap(map);
  return entry;
}

/** Số ngày nữa đến lần ôn tiếp theo của một từ (0 = đến hạn hôm nay). */
export function daysUntilReview(entry: SrsEntry, today = todayStr()): number {
  const diffMs = parseDate(entry.nextReview).getTime() - parseDate(today).getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

/** Các chữ Hán đến hạn ôn (nextReview <= hôm nay), sắp xếp theo ngày ôn. */
export async function getDueZhList(): Promise<string[]> {
  const map = await getSrsMap();
  const today = todayStr();
  return Object.entries(map)
    .filter(([, entry]) => entry.nextReview <= today)
    .sort((a, b) => a[1].nextReview.localeCompare(b[1].nextReview))
    .map(([zh]) => zh);
}
