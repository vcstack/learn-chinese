export interface Vocab {
  zh: string;
  py: string;
  vi: string;
}

export interface Sentence {
  zh: string;
  py: string;
  vi: string;
}

export interface DialogueLine {
  sp: string;
  zh: string;
  py: string;
  vi: string;
}

export interface Lesson {
  id: number;
  title: string;
  titleVi: string;
  vocab: Vocab[];
  sentences: Sentence[];
  dialogue: DialogueLine[];
}

export interface LessonsFile {
  lessons: Lesson[];
}

/** Tốc độ đọc: chậm / vừa / nhanh. */
export type SpeechRateKey = 'slow' | 'normal' | 'fast';

export const SPEECH_RATES: Record<
  SpeechRateKey,
  { label: string; rate: number }
> = {
  slow: { label: 'Chậm', rate: 0.55 },
  normal: { label: 'Vừa', rate: 0.85 },
  fast: { label: 'Nhanh', rate: 1.0 },
};

export const RATE_ORDER: SpeechRateKey[] = ['slow', 'normal', 'fast'];

/** Khoảng nhắc học (giờ). 0 = tắt. */
export type ReminderInterval = 0 | 1 | 2 | 4;

export const REMINDER_OPTIONS: { hours: ReminderInterval; label: string }[] = [
  { hours: 0, label: 'Tắt nhắc học' },
  { hours: 1, label: 'Mỗi 1 giờ' },
  { hours: 2, label: 'Mỗi 2 giờ' },
  { hours: 4, label: 'Mỗi 4 giờ' },
];

/** Thống kê học tập + chuỗi ngày liên tiếp (streak). */
export interface LearningStats {
  /** Ngày học gần nhất, dạng YYYY-MM-DD (giờ địa phương). null = chưa học. */
  lastStudyDate: string | null;
  /** Số ngày liên tiếp đã học (tính đến ngày gần nhất). */
  streak: number;
  /** Tổng số ngày khác nhau đã học. */
  totalDays: number;
  /** Tổng số lượt luyện tập đã hoàn thành (trả lời trắc nghiệm / luyện nghe / lật flashcard). */
  totalPracticed: number;
  /** Các bài đã mở (id bài). */
  lessonsOpened: number[];
}

/** Tiến độ SRS của một từ: mức nhớ và ngày ôn tiếp theo (YYYY-MM-DD). */
export interface SrsEntry {
  level: number; // 0–5
  nextReview: string; // YYYY-MM-DD
}

export type SrsMap = Record<string, SrsEntry>;

/** Số ngày chờ đến lần ôn tiếp theo theo từng level (index = level). */
export const SRS_INTERVALS_DAYS: readonly number[] = [1, 2, 4, 7, 14, 30];

export const SRS_MAX_LEVEL = 5;

/** Tham số điều hướng của stack. */
export type RootStackParamList = {
  Home: undefined;
  Lesson: { lessonId: number };
  Practice: { lessonId: number };
  Favorites: undefined;
  Review: undefined;
  Grammar: undefined;
  Patterns: undefined;
  Settings: undefined;
};
