-- spec_docs/Sameecha/spec_quick_quiz_runner.md — companion seed.
-- Run AFTER 2026-06-02_quick_quiz.sql. Idempotent: upserts on
-- (lesson_id, sort_order) via quick_quiz_items_lesson_sort_unique.
--
-- Vocab sourced verbatim from lessons.content_json.reference.words
-- (2026-05-20_lessons_content.sql). Same `verified: false` caveat applies —
-- none of this Kannada has been audited by a native speaker.
--
-- Coverage: L1 8, L2 8, L3 8, L4 6, L5 8, L6 8. L7/L8 empty (no lesson
-- content authored yet) — the runner shows the existing empty state there.

insert into public.quick_quiz_items
  (lesson_id, sort_order, kannada, transliteration, meaning)
select l.id, s.sort_order, s.kannada, s.transliteration, s.meaning
from (values
  -- ---- L1 Greetings
  (1, 1, 'ನಮಸ್ಕಾರ',          'namaskāra',      'Hello / greetings'),
  (1, 2, 'ನಮಸ್ತೆ',            'namaste',        'Hello'),
  (1, 3, 'ಹೇಗಿದ್ದೀರ?',         'hēgiddīra?',     'How are you? (respectful)'),
  (1, 4, 'ಹೇಗಿದ್ದೀಯ?',         'hēgiddīya?',     'How are you? (neutral)'),
  (1, 5, 'ಚೆನ್ನಾಗಿದ್ದೇನೆ',      'chennāgiddēne',  'I am fine'),
  (1, 6, 'ಚೆನ್ನಾಗಿದ್ದೇವೆ',      'chennāgiddēve',  'We are fine'),
  (1, 7, 'ನೀವು',              'nīvu',           'You (respectful)'),
  (1, 8, 'ನೀನು',              'nīnu',           'You (neutral)'),

  -- ---- L2 Names and People
  (2, 1, 'ನಾನು',              'nānu',           'I'),
  (2, 2, 'ನೀನು',              'nīnu',           'You (neutral)'),
  (2, 3, 'ನೀವು',              'nīvu',           'You (respectful)'),
  (2, 4, 'ನಿನ್ನ',              'ninna',          'Your (neutral)'),
  (2, 5, 'ನಿಮ್ಮ',             'nimma',          'Your (respectful)'),
  (2, 6, 'ಇವರು',              'ivaru',          'This person / these people'),
  (2, 7, 'ಹೆಸರು',             'hesaru',         'Name'),
  (2, 8, 'ಮನೆ',               'mane',           'House / home'),

  -- ---- L3 Wanting
  (3, 1, 'ನನಗೆ',              'nanage',         'For me / to me'),
  (3, 2, 'ಬೇಕು',              'bēku',           'Want / need'),
  (3, 3, 'ಬೇಡ',               'bēḍa',           'Don''t want'),
  (3, 4, 'ಹೌದು',              'haudu',          'Yes'),
  (3, 5, 'ಇಲ್ಲ',               'illa',           'No'),
  (3, 6, 'ಎಷ್ಟು',              'eṣṭu',           'How much'),
  (3, 7, 'ಕಡಿಮೆ',             'kaḍime',         'Less'),
  (3, 8, 'ಧನ್ಯವಾದಗಳು',       'dhanyavādagaḷu', 'Thank you'),

  -- ---- L4 Pointing (only 6 reference words)
  (4, 1, 'ಇಲ್ಲಿ',              'illi',           'Here'),
  (4, 2, 'ಇದು',               'idu',            'This'),
  (4, 3, 'ಅಲ್ಲಿ',              'alli',           'There'),
  (4, 4, 'ಅದು',               'adu',            'That'),
  (4, 5, 'ಎಲ್ಲಿ',              'elli',           'Where'),
  (4, 6, 'ಹೇಗೆ',              'hēge',           'How'),

  -- ---- L5 Easy verbs
  (5, 1, 'ಮಾಡು',              'māḍu',           'Do / make'),
  (5, 2, 'ಹೋಗು',             'hōgu',           'Go'),
  (5, 3, 'ಬಾ',                'bā',             'Come'),
  (5, 4, 'ತಿನ್ನು',             'thinnu',         'Eat'),
  (5, 5, 'ಕುಡಿ',               'kuḍi',           'Drink'),
  (5, 6, 'ನೋಡು',             'nōḍu',           'See / watch'),
  (5, 7, 'ಕೇಳು',              'kēḷu',           'Ask / listen'),
  (5, 8, 'ಹೇಳು',              'hēḷu',           'Say / tell'),

  -- ---- L6 Questions
  (6, 1, 'ಯಾರು',              'yāru',           'Who'),
  (6, 2, 'ಏನು',               'ēnu',            'What'),
  (6, 3, 'ಎಲ್ಲಿ',              'elli',           'Where'),
  (6, 4, 'ಯಾವಾಗ',           'yāvāga',         'When'),
  (6, 5, 'ಏಕೆ',                'ēke',            'Why'),
  (6, 6, 'ಹೇಗೆ',              'hēge',           'How'),
  (6, 7, 'ಯಾವದು',            'yāvadu',         'Which'),
  (6, 8, 'ಈಗ',                'īga',            'Now')
) as s(lesson_no, sort_order, kannada, transliteration, meaning)
join public.lessons l on l.lesson_no = s.lesson_no
on conflict on constraint quick_quiz_items_lesson_sort_unique do update
  set kannada         = excluded.kannada,
      transliteration = excluded.transliteration,
      meaning         = excluded.meaning;
