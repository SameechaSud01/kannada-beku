import type { Lesson } from './types';

export const meetingSomeoneNew: Lesson = {
  id: 'meeting-someone-new',
  situation: {
    title: 'Meeting someone for the first time',
    setup: "You're at a friend's place. Their parents have just walked in. Time to make a good first impression.",
    imageKey: 'scene/living-room-greeting',
    realWorldPrompt: "Try this the next time you meet a Kannadiga friend's family.",
  },
  intake: [
    {
      id: 'phrase.namaskara',
      kannada: 'ನಮಸ್ಕಾರ',
      transliteration: 'Namaskāra',
      english: 'Hello / Greetings',
      imageKey: 'phrase/namaskara',
      vocabAtoms: ['ನಮಸ್ಕಾರ'],
    },
    {
      id: 'phrase.hesaru-enu',
      kannada: 'ನಿಮ್ಮ ಹೆಸರು ಏನು?',
      transliteration: 'Nimma hesaru enu?',
      english: 'What is your name?',
      vocabAtoms: ['ಹೆಸರು', 'ಏನು'],
    },
    {
      id: 'phrase.naanu-x',
      kannada: 'ನಾನು [name]',
      transliteration: 'Naanu [name]',
      english: 'I am [name]',
      vocabAtoms: ['ನಾನು'],
    },
  ],
  drill: [
    { type: 'listen_pick', phraseId: 'phrase.namaskara', distractorIds: ['phrase.hesaru-enu', 'phrase.naanu-x'] },
    { type: 'translate_pick', phraseId: 'phrase.hesaru-enu', distractorIds: ['phrase.namaskara', 'phrase.naanu-x'] },
    { type: 'listen_pick', phraseId: 'phrase.naanu-x', distractorIds: ['phrase.namaskara', 'phrase.hesaru-enu'] },
    { type: 'translate_pick', phraseId: 'phrase.namaskara', distractorIds: ['phrase.hesaru-enu', 'phrase.naanu-x'] },
    { type: 'listen_pick', phraseId: 'phrase.hesaru-enu', distractorIds: ['phrase.namaskara', 'phrase.naanu-x'] },
  ],
  output: {
    driverLine: {
      id: 'phrase.hesaru-enu',
      kannada: 'ನಿಮ್ಮ ಹೆಸರು ಏನು?',
      transliteration: 'Nimma hesaru enu?',
      english: 'What is your name?',
      vocabAtoms: ['ಹೆಸರು', 'ಏನು'],
    },
    expectedResponse: {
      id: 'phrase.naanu-x',
      kannada: 'ನಾನು [name]',
      transliteration: 'Naanu [name]',
      english: 'I am [name]',
      vocabAtoms: ['ನಾನು'],
    },
  },
  resurfaces: [],
};
