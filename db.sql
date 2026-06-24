-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  avatar_url text,
  learning_mode text CHECK (learning_mode IS NULL OR (learning_mode = ANY (ARRAY['spoken'::text, 'written'::text, 'both'::text]))),
  current_streak integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  motivations ARRAY NOT NULL DEFAULT '{}'::text[],
  daily_goal_minutes integer CHECK (daily_goal_minutes IS NULL OR (daily_goal_minutes = ANY (ARRAY[5, 10, 20]))),
  onboarding_completed_at timestamp with time zone,
  daily_reminder_time text,
  tts_rate numeric NOT NULL DEFAULT 1.00,
  auto_replay boolean NOT NULL DEFAULT true,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_no integer NOT NULL UNIQUE CHECK (lesson_no >= 0),
  title text NOT NULL,
  content_json jsonb NOT NULL,
  audio_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  slug text,
  situation text,
  real_world_prompt text,
  CONSTRAINT lessons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_lesson_progress (
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  completed_at timestamp with time zone,
  score integer CHECK (score IS NULL OR score >= 0 AND score <= 100),
  CONSTRAINT user_lesson_progress_pkey PRIMARY KEY (user_id, lesson_id),
  CONSTRAINT user_lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.quick_quiz_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL,
  question text,
  options_json jsonb,
  correct_index integer,
  sort_order integer NOT NULL DEFAULT 0,
  kannada text,
  transliteration text,
  meaning text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  section text,
  CONSTRAINT quick_quiz_items_pkey PRIMARY KEY (id),
  CONSTRAINT quick_quiz_items_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.quick_quiz_progress (
  user_id uuid NOT NULL,
  item_id uuid NOT NULL,
  is_correct boolean,
  attempts integer NOT NULL DEFAULT 0,
  last_played timestamp with time zone,
  CONSTRAINT quick_quiz_progress_pkey PRIMARY KEY (user_id, item_id),
  CONSTRAINT quick_quiz_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT quick_quiz_progress_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.quick_quiz_items(id)
);
CREATE TABLE public.dictation_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id uuid,
  audio_url text,
  expected_answer text NOT NULL,
  accepted_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  phonetic text,
  sort_order integer NOT NULL DEFAULT 0,
  section text,
  CONSTRAINT dictation_items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.dictation_progress (
  user_id uuid NOT NULL,
  item_id uuid NOT NULL,
  is_correct boolean,
  attempts integer NOT NULL DEFAULT 0,
  last_played timestamp with time zone,
  CONSTRAINT dictation_progress_pkey PRIMARY KEY (user_id, item_id),
  CONSTRAINT dictation_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT dictation_progress_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.dictation_items(id)
);
CREATE TABLE public.conversation_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id uuid,
  scenario text,
  turns_json jsonb,
  scenario_id uuid,
  turn_index integer NOT NULL DEFAULT 0,
  speaker_line_kn text,
  speaker_line_en text,
  options_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_option_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT conversation_items_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_items_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT conversation_items_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.conversation_scenarios(id)
);
CREATE TABLE public.conversation_progress (
  user_id uuid NOT NULL,
  item_id uuid NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  last_played timestamp with time zone,
  is_correct boolean NOT NULL DEFAULT false,
  CONSTRAINT conversation_progress_pkey PRIMARY KEY (user_id, item_id),
  CONSTRAINT conversation_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT conversation_progress_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.conversation_items(id)
);
CREATE TABLE public.opposites_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id uuid,
  word text NOT NULL,
  opposite text NOT NULL,
  options_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  transliteration text,
  meaning text,
  sort_order integer NOT NULL DEFAULT 0,
  section text,
  CONSTRAINT opposites_items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.opposites_progress (
  user_id uuid NOT NULL,
  item_id uuid NOT NULL,
  is_correct boolean,
  attempts integer NOT NULL DEFAULT 0,
  last_played timestamp with time zone,
  CONSTRAINT opposites_progress_pkey PRIMARY KEY (user_id, item_id),
  CONSTRAINT opposites_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT opposites_progress_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.opposites_items(id)
);
CREATE TABLE public.user_overall_progress (
  user_id uuid NOT NULL,
  total_score integer NOT NULL DEFAULT 0,
  progress_pct numeric NOT NULL DEFAULT 0 CHECK (progress_pct >= 0::numeric AND progress_pct <= 100::numeric),
  recomputed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_overall_progress_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_overall_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.emergency_phrases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category text NOT NULL,
  kannada text NOT NULL,
  meaning text NOT NULL,
  audio_url text,
  sort_order integer NOT NULL,
  transliteration text,
  CONSTRAINT emergency_phrases_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conversation_scenarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id uuid,
  sort_order integer NOT NULL DEFAULT 0,
  title text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  section text,
  CONSTRAINT conversation_scenarios_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_scenarios_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.user_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text,
  message text NOT NULL,
  app_version text,
  device text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  email text NOT NULL,
  name text,
  city text,
  motivation jsonb,
  motivation_note text,
  struggles jsonb,
  struggles_note text,
  wants jsonb,
  wants_note text,
  pricing_model text,
  price text,
  community_optin boolean NOT NULL DEFAULT false,
  CONSTRAINT waitlist_pkey PRIMARY KEY (id)
);