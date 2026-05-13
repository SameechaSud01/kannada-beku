import type { Lesson, LessonId } from './types';
import { meetingSomeoneNew } from './meeting-someone-new';

export const LESSONS: Record<LessonId, Lesson> = {
  [meetingSomeoneNew.id]: meetingSomeoneNew,
};

export const LESSON_ORDER: LessonId[] = [
  meetingSomeoneNew.id,
];
