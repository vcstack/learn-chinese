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
