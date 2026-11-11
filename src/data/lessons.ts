import lessonsData from '../../assets/lessons.json';
import type { Lesson, LessonsFile, Vocab } from '../types';

const file = lessonsData as LessonsFile;

/** Toàn bộ 20 bài học (giữ nguyên nội dung file gốc). */
export const LESSONS: Lesson[] = file.lessons;

export function getLessonById(id: number): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getTotals(): {
  lessons: number;
  vocab: number;
  sentences: number;
  dialogue: number;
} {
  return {
    lessons: LESSONS.length,
    vocab: LESSONS.reduce((n, l) => n + l.vocab.length, 0),
    sentences: LESSONS.reduce((n, l) => n + l.sentences.length, 0),
    dialogue: LESSONS.reduce((n, l) => n + l.dialogue.length, 0),
  };
}

/** Tất cả từ vựng của mọi bài (dùng cho nhắc học / luyện nói). */
export function getAllVocab(): Vocab[] {
  return LESSONS.flatMap((l) => l.vocab);
}

/** Tất cả mục có thể nghe/ôn: từ vựng + câu mẫu của mọi bài (cùng dạng zh/py/vi). */
export function getAllEntries(): Vocab[] {
  return LESSONS.flatMap((l) => [...l.vocab, ...l.sentences]);
}

/** Tìm một mục (từ vựng hoặc câu mẫu) theo chữ Hán — dùng cho SRS/Favorites. */
export function findEntryByZh(zh: string): Vocab | undefined {
  return getAllEntries().find((e) => e.zh === zh);
}

export function getRandomVocab(): Vocab {
  const all = getAllVocab();
  return all[Math.floor(Math.random() * all.length)];
}

export function getRandomVocabExcluding(exclude: Vocab, count: number): Vocab[] {
  const pool = getAllVocab().filter((v) => v.zh !== exclude.zh);
  const picked: Vocab[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

export function getRandomEntry(): Vocab {
  const all = getAllEntries();
  return all[Math.floor(Math.random() * all.length)];
}

export function getRandomEntriesExcluding(exclude: Vocab, count: number): Vocab[] {
  const pool = getAllEntries().filter((v) => v.zh !== exclude.zh);
  const picked: Vocab[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}
