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

/** Tham số điều hướng của stack. */
export type RootStackParamList = {
  Home: undefined;
  Lesson: { lessonId: number };
  Practice: { lessonId: number };
  Settings: undefined;
};
