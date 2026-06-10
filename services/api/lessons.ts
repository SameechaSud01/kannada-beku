import { supabase } from './supabase';
import { mapDbLesson, type Lesson, type LessonRow } from '../../constants/lessons/types';
import { TS_LESSONS, TS_LESSONS_BY_SLUG } from '../../constants/lessons/lessonContent';

const slugToId = new Map<string, string>();

export async function fetchLessonIdBySlug(slug: string): Promise<string | null> {
  const cached = slugToId.get(slug);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('lessons')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  slugToId.set(slug, data.id as string);
  return data.id as string;
}

// Playable Lessons 1–8 are authored in TS (constants/lessons/lessonContent.ts);
// the DB `lessons` rows stay the source of truth for uuids + progress, but are
// no longer read for content. Lesson 0 (basics) keeps its different DB shape.
for (const l of TS_LESSONS) slugToId.set(l.slug, l.id);

export async function fetchAllLessons(): Promise<Lesson[]> {
  return TS_LESSONS;
}

export async function fetchLessonBySlug(slug: string): Promise<Lesson | null> {
  const authored = TS_LESSONS_BY_SLUG[slug];
  if (authored) return authored;

  // Fallback to the DB (e.g. Lesson 0 / basics).
  const { data, error } = await supabase
    .from('lessons')
    .select('id, lesson_no, title, slug, situation, real_world_prompt, content_json')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as LessonRow;
  slugToId.set(row.slug, row.id);
  return mapDbLesson(row);
}

export function resetLessonsCache(): void {
  slugToId.clear();
}
