/**
 * Canonical playable lesson content (Lessons 1–8), authored in TS.
 *
 * Each lesson is split into sequential sub-parts (1a / 1b / 1c …) so a learner
 * meets a small set of words + the phrases that use them, instead of a whole
 * lesson at once (spec_lesson_split_map). Lesson 4 is intentionally a single
 * section (too thin to split); the runner tolerates that and tolerates a
 * section that is words-only or phrases-only.
 *
 * Text + transliterations are a verbatim mirror of the live `public.lessons`
 * reference content (verified:false). Known inconsistencies are catalogued in
 * docs/audits/lesson-content-flags.md for the content-verification pass — they
 * are NOT silently corrected here, so this stays a faithful mirror.
 *
 * Lesson 0 (Kannada basics) is NOT here — it has a different content shape and
 * its own screen, and keeps loading from the DB.
 */
import {
  flattenSections,
  type Lesson,
  type LessonSection,
  type Phrase,
  type Word,
} from './types';

const w = (kannada: string, transliteration: string, english: string): Word => ({
  kannada,
  transliteration,
  english,
});

const p = (kannada: string, transliteration: string, english: string): Phrase => ({
  kannada,
  transliteration,
  english,
});

const sec = (
  key: string,
  label: string,
  words: Word[],
  phrases: Phrase[],
): LessonSection => ({ key, label, words, phrases });

type AuthoredLesson = Omit<Lesson, 'words' | 'phrases'>;

const AUTHORED: AuthoredLesson[] = [
  // ============================================================
  // Lesson 1 — Greetings
  // ============================================================
  {
    id: 'e12dbb2d-c8ae-4764-bf4d-1afca5a45978',
    lessonNo: 1,
    title: 'Greetings',
    slug: 'greetings',
    situation:
      'You have just met someone — a neighbour, a shopkeeper, someone at work. This is how you open.',
    realWorldPrompt:
      'Next time you see your auto driver, building guard, or a shopkeeper — open with "namaste, heegiddira?" before anything else.',
    sections: [
      sec(
        '1a',
        'Saying hello',
        [
          w('ನಮಸ್ಕಾರ', 'namaskāra', 'Hello / greetings'),
          w('ನಮಸ್ತೆ', 'namaste', 'Hello'),
          w('ನೀವು', 'nīvu', 'You (respectful/plural)'),
          w('ನೀನು', 'nīnu', 'You (neutral/singular)'),
        ],
        [],
      ),
      sec(
        '1b',
        "How are you / I'm fine",
        [
          w('ಹೇಗಿದ್ದೀರ?', 'hēgiddīra?', 'How are you? (respectful)'),
          w('ಹೇಗಿದ್ದೀಯ?', 'hēgiddīya?', 'How are you? (neutral)'),
          w('ಚೆನ್ನಾಗಿದ್ದೇನೆ', 'chennāgiddēne', 'I am fine'),
          w('ಚೆನ್ನಾಗಿದ್ದೇವೆ', 'chennāgiddēve', 'We are fine'),
        ],
        [
          p('ನೀವು ಚೆನ್ನಾಗಿದ್ದೀರಾ?', 'nīvu chennāgiddīrā?', 'Are you fine? (respectful)'),
          p('ನೀನು ಚೆನ್ನಾಗಿದ್ದೀಯಾ?', 'nīnu chennāgiddīyā?', 'Are you fine? (neutral)'),
          p('ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ', 'nānu chennāgiddēne', 'I am fine'),
        ],
      ),
      sec(
        '1c',
        'Greeting someone',
        [],
        [
          p('ನಮಸ್ತೆ, ಹೇಗಿದ್ದೀರ?', 'namaste, hēgiddīra?', 'Hello, how are you? (respectful)'),
          p('ನಮಸ್ತೆ, ಹೇಗಿದ್ದೀಯ?', 'namaste, hēgiddīya?', 'Hello, how are you? (neutral)'),
          p('ನಾವು ಚೆನ್ನಾಗಿದ್ದೇವೆ', 'nāvu chennāgiddēve', 'We are fine'),
        ],
      ),
    ],
  },

  // ============================================================
  // Lesson 2 — Names
  // ============================================================
  {
    id: '891e589e-3a22-4faa-a03d-c7ec26ae25b6',
    lessonNo: 2,
    title: 'Names',
    slug: 'names',
    situation:
      'You are meeting someone for the first time — at work, in your building, or at a social event.',
    realWorldPrompt:
      'Next time you meet someone new, ask "nimma hesaru enu?" — even if they speak English back, you opened in Kannada.',
    sections: [
      sec(
        '2a',
        'I / you / your',
        [
          w('ನಾನು', 'nānu', 'I'),
          w('ನೀನು', 'nīnu', 'You (neutral)'),
          w('ನೀವು', 'nīvu', 'You (respectful)'),
          w('ನಿನ್ನ', 'ninna', 'Your (neutral)'),
          w('ನಿಮ್ಮ', 'nimma', 'Your (respectful)'),
        ],
        [],
      ),
      sec(
        '2b',
        'He / she / they',
        [
          w('ಇವರು', 'ivaru', 'This person / these people'),
          w('ಇವನು', 'ivanu', 'This person (he)'),
          w('ಇವಳು', 'ivaḷu', 'This person (she)'),
          w('ಅವರು', 'avaru', 'That person / those people'),
          w('ಅವನು', 'avanu', 'That person (he)'),
          w('ಅವಳು', 'avaḷu', 'That person (she)'),
        ],
        [],
      ),
      sec(
        '2c',
        'Name & home',
        [
          w('ಹೆಸರು', 'hesaru', 'Name'),
          w('ಮನೆ', 'mane', 'House / home'),
        ],
        [
          p('ನಿಮ್ಮ ಹೆಸರು ಏನು?', 'nimma hesaru ēnu?', 'What is your name? (respectful)'),
          p('ನಿನ್ನ ಹೆಸರು ಏನು?', 'ninna hesaru ēnu?', 'What is your name? (neutral)'),
          p('ನಾನು ಪ್ರಿಯಾ', 'nānu priyā', 'I am Priya'),
          p('ನಿಮ್ಮ ಮನೆ ಎಲ್ಲಿ?', 'nimma mane elli?', 'Where is your house?'),
        ],
      ),
    ],
  },

  // ============================================================
  // Lesson 3 — Wanting
  // ============================================================
  {
    id: '18806243-8aac-4fb8-9f34-eb21b2bf1c49',
    lessonNo: 3,
    title: 'Wanting',
    slug: 'wanting',
    situation:
      'You are at a street market, vegetable vendor, or small shop. You want something, you want to know the price, and you want to negotiate.',
    realWorldPrompt:
      'Next time you buy vegetables or anything from a street vendor, ask "idu estu?" instead of pointing at the price.',
    sections: [
      sec(
        '3a',
        "Want / don't want",
        [
          w('ನನಗೆ', 'nanage', 'For me / to me'),
          w('ನಮಗೆ', 'namage', 'For us / to us'),
          w('ನಿನಗೆ', 'ninage', 'For you (neutral)'),
          w('ನಿಮಗೆ', 'nimage', 'For you (respectful)'),
          w('ಬೇಕು', 'bēku', 'Want / need'),
          w('ಬೇಡ', 'bēḍa', "Don't want"),
          w('ಹೌದು', 'haudu', 'Yes'),
          w('ಇಲ್ಲ', 'illa', 'No'),
        ],
        [
          p('ನನಗೆ ಇದು ಬೇಕು', 'nanage idu bēku', 'I want this'),
          p('ನಮಗೆ ಅದು ಬೇಕು', 'namage adu bēku', 'We want that'),
          p('ನಿನಗೆ ಬೇಕಾ?', 'ninage bēkā?', 'Do you want? (neutral)'),
          p('ನಿಮಗೆ ಬೇಕಾ?', 'nimage bēkā?', 'Do you want? (respectful)'),
          p('ಹೌದು, ಬೇಕು', 'haudu, bēku', 'Yes, I want'),
          p('ಇಲ್ಲ, ನನಗೆ ಬೇಡ', 'illa, nanage bēḍa', "No, I don't want"),
        ],
      ),
      sec(
        '3b',
        'Price & quantity',
        [
          w('ಇಲ್ಲಿ', 'illi', 'Here'),
          w('ಎಷ್ಟು', 'eṣṭu', 'How much'),
          w('ಯಾಕೆ', 'yāke', 'Why'),
          w('ಕಡಿಮೆ', 'kaḍime', 'Less'),
          w('ಸ್ವಲ್ಪ', 'svalpa', 'A little'),
          w('ಜಾಸ್ತಿ', 'jāsti', 'A lot / too much'),
        ],
        [
          p('ಇದು ಎಷ್ಟು?', 'idu eṣṭu?', 'How much is this?'),
          p('ಯಾಕೆ?', 'yāke?', 'Why?'),
          p('ಇದು ಜಾಸ್ತಿ', 'idu jāsti', 'This is too much'),
          p('ಸ್ವಲ್ಪ', 'svalpa', 'A little'),
        ],
      ),
      sec(
        '3c',
        'Polite requests',
        [
          w('ಮಾಡಿ', 'māḍi', 'Please do'),
          w('ಮಾಡಬೇಡಿ', 'māḍabēḍi', "Please don't do"),
          w('ದಯವಿಟ್ಟು', 'dayaviṭṭu', 'Please'),
          w('ಧನ್ಯವಾದಗಳು', 'dhanyavādagaḷu', 'Thank you'),
        ],
        [
          p('ಇದು ಕಮ್ಮಿ ಮಾಡಿ', 'idu kammi māḍi', 'Please reduce the price'),
          p('ದಯವಿಟ್ಟು ಮಾಡಿ', 'dayaviṭṭu māḍi', 'Please do'),
          p('ದಯವಿಟ್ಟು ಮಾಡಬೇಡಿ', 'dayaviṭṭu māḍabēḍi', "Please don't"),
        ],
      ),
    ],
  },

  // ============================================================
  // Lesson 4 — Pointing  (single section — not split)
  // ============================================================
  {
    id: '58c7a04f-7d69-4a57-a4dc-26b6d99b9e10',
    lessonNo: 4,
    title: 'Pointing',
    slug: 'pointing',
    situation:
      'You need to point something out, ask where something is, or describe a location.',
    realWorldPrompt:
      'Next time you need to point something out, use "illi" and "alli" instead of just pointing silently.',
    sections: [
      sec(
        '4',
        'This, that, here, there',
        [
          w('ಇಲ್ಲಿ', 'illi', 'Here'),
          w('ಇದು', 'idu', 'This'),
          w('ಅಲ್ಲಿ', 'alli', 'There'),
          w('ಅದು', 'adu', 'That'),
          w('ಎಲ್ಲಿ', 'elli', 'Where'),
          w('ಹೇಗೆ', 'hēge', 'How'),
        ],
        [
          p('ಅದು ಎಲ್ಲಿ?', 'adu elli?', 'Where is that?'),
          p('ಇದು ಎಲ್ಲಿ?', 'idu elli?', 'Where is this?'),
          p('ನಿಮ್ಮ ಮನೆ ಎಲ್ಲಿ?', 'nimma mane elli?', 'Where is your house?'),
        ],
      ),
    ],
  },

  // ============================================================
  // Lesson 5 — Easy verbs
  // ============================================================
  {
    id: 'e6f22705-9f4c-4c8d-874e-cc50a3068e81',
    lessonNo: 5,
    title: 'Easy verbs',
    slug: 'easy-verbs',
    situation:
      'You want to ask someone to do something, or describe what you or someone else is doing.',
    realWorldPrompt:
      'Next time you want someone to do something, use the respectful form — "maadi", "hoogi", "noodi" — instead of English.',
    sections: [
      sec(
        '5a',
        'Everyday actions',
        [
          w('ಮಾಡು', 'maadu', 'Do / make (casual)'),
          w('ಮಾಡಿ', 'maadi', 'Do / make (respectful)'),
          w('ಹೋಗು', 'hogu', 'Go (casual)'),
          w('ಹೋಗಿ', 'hogi', 'Go (respectful)'),
          w('ಬಾ', 'baa', 'Come (casual)'),
          w('ಬನ್ನಿ', 'banni', 'Come (respectful)'),
          w('ತಿನ್ನು', 'tinnu', 'Eat (casual)'),
          w('ತಿನ್ನಿ', 'tinni', 'Eat (respectful)'),
          w('ಕುಡಿ', 'kudi', 'Drink (casual)'),
          w('ಕುಡಿಯಿರಿ', 'kudiyiri', 'Drink (respectful)'),
          w('ನೋಡು', 'nodu', 'See / watch (casual)'),
          w('ನೋಡಿ', 'nodi', 'See / watch (respectful)'),
        ],
        [
          p('ಇದು ನೋಡಿ', 'idu nodi', 'Look at this'),
          p('ಬನ್ನಿ', 'banni', 'Please come'),
        ],
      ),
      sec(
        '5b',
        'Communicating & giving',
        [
          w('ಕೇಳು', 'kelu', 'Ask / listen (casual)'),
          w('ಕೇಳಿ', 'keli', 'Ask / listen (respectful)'),
          w('ಹೇಳು', 'helu', 'Say / tell (casual)'),
          w('ಹೇಳಿ', 'heli', 'Say / tell (respectful)'),
          w('ಕೊಡು', 'kodu', 'Give (casual)'),
          w('ಕೊಡಿ', 'kodi', 'Give (respectful)'),
          w('ತೆಗೊ', 'tego', 'Take (casual)'),
          w('ತೆಗೊಳಿ', 'tegolli', 'Take (respectful)'),
        ],
        [
          p('ನನಗೆ ಕೊಡಿ', 'nanage kodi', 'Give it to me'),
          p('ದಯವಿಟ್ಟು ಹೇಳಿ', 'dayavittu heli', 'Please tell me'),
        ],
      ),
      sec(
        '5c',
        'Body & movement',
        [
          w('ಕುಳಿತುಕೋ', 'kulituko', 'Sit (casual)'),
          w('ಕುಳಿತುಕೊಳ್ಳಿ', 'kulitukolli', 'Sit (respectful)'),
          w('ನಿಲ್ಲು', 'nillu', 'Stand / stop (casual)'),
          w('ನಿಲ್ಲಿ', 'nilli', 'Stand / stop (respectful)'),
          w('ಮಲಗು', 'malagu', 'Sleep (casual)'),
          w('ಮಲಗಿ', 'malagi', 'Sleep (respectful)'),
          w('ಏಳು', 'elu', 'Get up (casual)'),
          w('ಏಳಿ', 'eli', 'Get up (respectful)'),
          w('ಓಡು', 'odu', 'Run (casual)'),
          w('ಓಡಿ', 'odi', 'Run (respectful)'),
          w('ನಡೆ', 'nade', 'Walk (casual)'),
          w('ನಡೆಯಿರಿ', 'nadeyiri', 'Walk (respectful)'),
          w('ಮುಚ್ಚು', 'mucchu', 'Close (casual)'),
          w('ಮುಚ್ಚಿ', 'mucchi', 'Close (respectful)'),
        ],
        [p('ಕುಳಿತುಕೊಳ್ಳಿ', 'kulitukolli', 'Please sit')],
      ),
    ],
  },

  // ============================================================
  // Lesson 6 — Questions
  // ============================================================
  {
    id: 'e7e6f0a6-936a-4e48-b714-6222088b4178',
    lessonNo: 6,
    title: 'Questions',
    slug: 'questions',
    situation:
      'You need to ask a question — about a person, a place, a thing, or a situation.',
    realWorldPrompt:
      'Next time you want to ask someone something, open with the Kannada question word — "yaaru", "enu", "elli" — even if the rest comes out in English.',
    sections: [
      sec(
        '6a',
        'Question words',
        [
          w('ಯಾರು', 'yaaru', 'Who'),
          w('ಏನು', 'enu', 'What'),
          w('ಎಲ್ಲಿ', 'elli', 'Where'),
          w('ಯಾವಾಗ', 'yaavaaga', 'When'),
          w('ಏಕೆ', 'eke', 'Why'),
          w('ಹೇಗೆ', 'hege', 'How'),
          w('ಯಾವದು', 'yaavadu', 'Which'),
          w('ಎಷ್ಟು', 'estu', 'How much / many'),
          w('ಯಾರದು', 'yaaradu', 'Whose'),
          w('ಯಾರಿಗೆ', 'yaarige', 'To whom'),
        ],
        [],
      ),
      sec(
        '6b',
        'Place, time & yes/no',
        [
          w('ಇಲ್ಲಿ', 'illi', 'Here'),
          w('ಅಲ್ಲಿ', 'alli', 'There'),
          w('ಎಲ್ಲಿಗೆ', 'ellige', 'To where'),
          w('ಈಗ', 'iiga', 'Now'),
          w('ಹೌದು', 'haudu', 'Yes'),
          w('ಇಲ್ಲ', 'illa', 'No / not'),
          w('ಸರಿ', 'sari', 'Okay'),
        ],
        [],
      ),
      sec(
        '6c',
        'Wanting & knowing',
        [
          w('ಬೇಕು', 'beku', 'Want / need'),
          w('ಬೇಡ', 'beda', 'Do not want / no need'),
          w('ಗೊತ್ತಾ?', 'gottaa', 'Do you know? (casual)'),
          w('ಗೊತ್ತೇ?', 'gottee', 'Do you know? (respectful)'),
          w('ಗೊತ್ತಿಲ್ಲ', 'gottilla', 'Do not know'),
          w('ಯಾಕೆ ಇಲ್ಲ?', 'yaake illa', 'Why not?'),
        ],
        [
          p('ಹೇಗಿದ್ದೀರಾ?', 'hēgiddīrā?', 'How are you? (respectful)'),
          p('ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ', 'nānu chennāgiddēne', 'I am fine'),
          p('ನಿಮ್ಮ ಹೆಸರು ಏನು?', 'nimma hesaru ēnu?', 'What is your name?'),
          p('ನನ್ನ ಹೆಸರು…', 'nanna hesaru…', 'My name is…'),
          p('ಊಟ ಆಯಿತಾ?', 'ūṭa āyitā?', 'Have you eaten?'),
          p('ನನಗೆ ಗೊತ್ತಿಲ್ಲ', 'nanage gottilla', "I don't know"),
        ],
      ),
    ],
  },

  // ============================================================
  // Lesson 7 — Hard verbs
  // ============================================================
  {
    id: 'd5a0a365-73b5-4bf7-bd1d-5f2392e042d7',
    lessonNo: 7,
    title: 'Hard verbs',
    slug: 'hard-verbs',
    situation:
      'More actions — reading, writing, working, sending. These come up every day.',
    realWorldPrompt:
      'Next time someone asks what you are doing, answer in Kannada — "naanu kelasa maaduttiddene" or "naanu oduttiddene".',
    sections: [
      sec(
        '7a',
        'Work & study',
        [
          w('ನೋಡು', 'nodu', 'See / look (casual)'),
          w('ನೋಡಿ', 'nodi', 'See / look (respectful)'),
          w('ಮಾಡು', 'maadu', 'Do / make (casual)'),
          w('ಮಾಡಿ', 'maadi', 'Do / make (respectful)'),
          w('ಆಡು', 'aadu', 'Play (casual)'),
          w('ಆಡಿ', 'aadi', 'Play (respectful)'),
          w('ಕೆಲಸ ಮಾಡು', 'kelasa maadu', 'Work (casual)'),
          w('ಕೆಲಸ ಮಾಡಿ', 'kelasa maadi', 'Work (respectful)'),
          w('ಓದು', 'odu', 'Read / study (casual)'),
          w('ಓದಿ', 'odi', 'Read / study (respectful)'),
          w('ಬರೆ', 'bareyu', 'Write (casual)'),
          w('ಬರೆಯಿರಿ', 'bareyiri', 'Write (respectful)'),
        ],
        [
          p('ನೀವು ಏನು ಮಾಡುತ್ತಿದ್ದೀರಾ?', 'neevu enu maaduttiddiraa?', 'What are you doing?'),
          p('ನಾನು ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದೇನೆ', 'naanu kelasa maaduttiddene', 'I am working'),
          p('ನಾನು ಓದುತ್ತಿದ್ದೇನೆ', 'naanu oduttiddene', 'I am studying'),
          p('ಇದು ನೋಡಿ', 'idu nodi', 'Look at this'),
          p('ನನಗೆ ಅರ್ಥ ಆಗಲಿಲ್ಲ', 'nanage artha aagalilla', 'I did not understand'),
        ],
      ),
      sec(
        '7b',
        'Handling things',
        [
          w('ತೆಗೊ', 'tego', 'Take (casual)'),
          w('ತೆಗೊಳ್ಳಿ', 'tegolli', 'Take (respectful)'),
          w('ಹಾಕು', 'haaku', 'Put (casual)'),
          w('ಹಾಕಿ', 'haaki', 'Put (respectful)'),
          w('ಇಡು', 'idu', 'Keep (casual)'),
          w('ಇಡಿ', 'idi', 'Keep (respectful)'),
          w('ಹಿಡಿ', 'hidi', 'Hold / catch (casual)'),
          w('ಹಿಡಿಯಿರಿ', 'hidiyiri', 'Hold / catch (respectful)'),
        ],
        [p('ನನಗೆ ಕೊಡಿ', 'nanage kodi', 'Give it to me')],
      ),
      sec(
        '7c',
        'Sending & sequencing',
        [
          w('ಕಳಿಸು', 'kalisu', 'Send (casual)'),
          w('ಕಳಿಸಿ', 'kalisi', 'Send (respectful)'),
          w('ತಂದುಕೊಡು', 'tandukodu', 'Bring (casual)'),
          w('ತಂದುಕೊಡಿ', 'tandukodi', 'Bring (respectful)'),
          w('ಶುರು ಮಾಡು', 'shuru maadu', 'Start (casual)'),
          w('ಶುರು ಮಾಡಿ', 'shuru maadi', 'Start (respectful)'),
          w('ಮುಗಿಸು', 'mugisu', 'Finish (casual)'),
          w('ಮುಗಿಸಿ', 'mugisi', 'Finish (respectful)'),
        ],
        [
          p('ದಯವಿಟ್ಟು ಕಳುಹಿಸಿ', 'dayavittu kalisi', 'Please send'),
          p('ಶುರು ಮಾಡಿ', 'shuru maadi', 'Please start'),
          p('ಮುಗಿಸಿ', 'mugisi', 'Please finish'),
        ],
      ),
    ],
  },

  // ============================================================
  // Lesson 8 — Putting it together
  // ============================================================
  {
    id: 'fc323dbd-0956-44b9-85bf-335d2d9c1b12',
    lessonNo: 8,
    title: 'Putting it together',
    slug: 'putting-it-together',
    situation:
      'Putting everything together — greeting, names, shopping, questions. A real conversation from start to finish.',
    realWorldPrompt:
      'Have a full Kannada conversation today — greeting, name, one question. Even 3 exchanges counts.',
    sections: [
      sec(
        '8a',
        'Meeting & introductions',
        [],
        [
          p('ನಮಸ್ತೆ, ಹೇಗಿದ್ದೀರಾ?', 'namaste, heegiddiraa?', 'Hello, how are you?'),
          p('ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ', 'naanu chennagiddene', 'I am fine'),
          p('ನಿಮ್ಮ ಹೆಸರು ಏನು?', 'nimma hesaru enu?', 'What is your name?'),
          p('ನನ್ನ ಹೆಸರು ರಾಹುಲ್', 'nanna hesaru rahul', 'My name is Rahul'),
          p('ನಿಮ್ಮ ಊರು ಯಾವುದು?', 'nimma ooru yaavudu?', 'Which town are you from?'),
          p('ನನ್ನ ಊರು ಬೆಂಗಳೂರು', 'nanna ooru bengaluru', 'I am from Bangalore'),
        ],
      ),
      sec(
        '8b',
        'Shopping & negotiating',
        [
          w('ಸರಿ', 'sari', 'Okay'),
          w('ಧನ್ಯವಾದಗಳು', 'dhanyavadagalu', 'Thank you'),
        ],
        [
          p('ನಿಮಗೆ ಇದು ಬೇಕಾ?', 'nimage idu bekaa?', 'Do you want this?'),
          p('ಹೌದು, ನನಗೆ ಬೇಕು', 'haudu, nanage beku', 'Yes, I want it'),
          p('ಇದು ಎಷ್ಟು?', 'idu estu?', 'How much is this?'),
          p('ಸ್ವಲ್ಪ ಕಮ್ಮಿ ಮಾಡಿ', 'svalpa kammi maadi', 'Please reduce it a little'),
          p('ಸರಿ', 'sari', 'Okay'),
          p('ಧನ್ಯವಾದಗಳು', 'dhanyavadagalu', 'Thank you'),
        ],
      ),
      sec(
        '8c',
        'Getting around & wrapping up',
        [
          w('ನಿಧಾನವಾಗಿ', 'nidhanavagi', 'Slowly'),
          w('ಮತ್ತೆ', 'matte', 'Again / later'),
        ],
        [
          p('ಅವನು ಇಲ್ಲಿ ಇದ್ದಾನೆ', 'avanu illi iddaane', 'He is here'),
          p('ಅವಳು ಅಲ್ಲಿ ಇದ್ದಾಳೆ', 'avalu alli iddaale', 'She is there'),
          p('ನೀವು ಎಲ್ಲಿ ಹೋಗುತ್ತಿದ್ದೀರಾ?', 'neevu elli hooguttiddiraa?', 'Where are you going?'),
          p('ನಾನು ಮನೆಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ', 'naanu manege hooguttiddene', 'I am going home'),
          p('ನಿಮಗೆ ಕನ್ನಡ ಗೊತ್ತಾ?', 'nimage kannada gottaa?', 'Do you know Kannada?'),
          p('ಸ್ವಲ್ಪ ಗೊತ್ತು', 'svalpa gottu', 'I know a little'),
          p('ನನಗೆ ಗೊತ್ತಿಲ್ಲ', 'nanage gottilla', "I don't know"),
          p('ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಹೇಳಿ', 'dayavittu nidhanavagi heli', 'Please speak slowly'),
          p('ನೀವು ಊಟ ಮಾಡಿದ್ದೀರಾ?', 'neevu oota maadiddiraa?', 'Have you eaten?'),
          p('ಹೌದು, ಮಾಡಿದ್ದೇನೆ', 'haudu, maadiddene', 'Yes, I have'),
          p('ಇಲ್ಲ, ಇನ್ನೂ ಬೇಡ', 'illa, innu beda', 'No, not yet'),
          p('ಮತ್ತೆ ಭೇಟಿ ಆಗೋಣ', 'matte bheti aagona', "Let's meet again"),
        ],
      ),
    ],
  },
];

/** Playable lessons (1–8), each with `sections` plus flattened `words`/`phrases`. */
export const TS_LESSONS: Lesson[] = AUTHORED.map((l) => ({
  ...l,
  ...flattenSections(l.sections),
}));

export const TS_LESSONS_BY_SLUG: Record<string, Lesson> = Object.fromEntries(
  TS_LESSONS.map((l) => [l.slug, l]),
);

/**
 * Section keys + labels for a lesson, in order — the canonical taxonomy the
 * games reuse to label their sub-parts (spec_game_subsection_split). Returns
 * [] for an unknown lesson number.
 */
export function lessonSectionsByNo(lessonNo: number): { key: string; label: string }[] {
  const lesson = TS_LESSONS.find((l) => l.lessonNo === lessonNo);
  return lesson ? lesson.sections.map((s) => ({ key: s.key, label: s.label })) : [];
}
