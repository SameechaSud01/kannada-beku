/**
 * AnswerOption is the practice-phase multiple-choice card. Reveal semantics
 * (spec_lesson_flow_fixed §2 + the owner-approved green/red exception):
 * correct option shows "Correct", a wrong pick shows what the learner chose,
 * and every option stops accepting taps once revealed.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AnswerOption } from '../../components/lesson/AnswerOption';

const baseProps = {
  label: 'Who',
  index: 0,
  correctIndex: 0,
  onPick: jest.fn(),
};

describe('AnswerOption', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reports its index when picked before reveal', () => {
    render(<AnswerOption {...baseProps} index={2} picked={null} />);
    fireEvent.press(screen.getByRole('button', { name: 'Who' }));
    expect(baseProps.onPick).toHaveBeenCalledWith(2);
  });

  it('shows the Correct tag on the right answer after reveal', () => {
    render(<AnswerOption {...baseProps} picked={0} />);
    expect(screen.getByText('Correct')).toBeTruthy();
  });

  it('shows the generic Try again tag on a wrong pick without a transliteration', () => {
    render(<AnswerOption {...baseProps} index={1} correctIndex={0} picked={1} />);
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  it('turns a wrong pick into a comparison when the transliteration is known', () => {
    render(
      <AnswerOption {...baseProps} index={1} correctIndex={0} picked={1} transliteration="yāru" />,
    );
    expect(screen.getByText('That’s “yāru”')).toBeTruthy();
    expect(screen.queryByText('Try again')).toBeNull();
  });

  it('ignores taps once revealed', () => {
    render(<AnswerOption {...baseProps} picked={0} />);
    fireEvent.press(screen.getByRole('button', { name: 'Who' }));
    expect(baseProps.onPick).not.toHaveBeenCalled();
  });

  it('shows no feedback tags on unpicked, incorrect options', () => {
    render(<AnswerOption {...baseProps} index={1} correctIndex={0} picked={2} />);
    expect(screen.queryByText('Correct')).toBeNull();
    expect(screen.queryByText('Try again')).toBeNull();
  });
});
