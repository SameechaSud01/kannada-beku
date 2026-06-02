import { splitGloss } from '../../utils/gloss';

describe('splitGloss', () => {
  it('extracts a trailing register qualifier', () => {
    expect(splitGloss('you (neutral)')).toEqual({ text: 'you', tag: 'neutral' });
    expect(splitGloss('you (respectful)')).toEqual({ text: 'you', tag: 'respectful' });
  });

  it('extracts a gender qualifier', () => {
    expect(splitGloss('this person (he)')).toEqual({ text: 'this person', tag: 'he' });
    expect(splitGloss('that person (she)')).toEqual({ text: 'that person', tag: 'she' });
  });

  it('keeps a trailing qualifier on a question gloss', () => {
    expect(splitGloss('How are you? (respectful)')).toEqual({
      text: 'How are you?',
      tag: 'respectful',
    });
    expect(splitGloss('do you know? (neutral)')).toEqual({
      text: 'do you know?',
      tag: 'neutral',
    });
  });

  it('preserves compound qualifiers verbatim', () => {
    expect(splitGloss('you (respectful/plural)')).toEqual({
      text: 'you',
      tag: 'respectful/plural',
    });
  });

  it('returns a null tag when there is no qualifier', () => {
    expect(splitGloss('Stop here')).toEqual({ text: 'Stop here', tag: null });
    expect(splitGloss('No, don\'t want')).toEqual({ text: "No, don't want", tag: null });
  });

  it('trims surrounding whitespace', () => {
    expect(splitGloss('  well  ')).toEqual({ text: 'well', tag: null });
  });
});
