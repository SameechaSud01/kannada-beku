import { fireEvent, render, screen } from '@testing-library/react-native';
import { LipButton } from '../../components/ui/LipButton';

describe('LipButton', () => {
  it('renders its label as an accessible button and fires onPress', () => {
    const onPress = jest.fn();
    render(<LipButton label="Try again" onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Try again' });
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress while disabled, and exposes the disabled state', () => {
    const onPress = jest.fn();
    render(<LipButton label="Continue" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'Continue' });
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
  });

  it('prefers an explicit accessibilityLabel over the visual label', () => {
    render(<LipButton label="+" accessibilityLabel="Add lesson" onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Add lesson' })).toBeTruthy();
  });
});
