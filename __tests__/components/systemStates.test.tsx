import { fireEvent, render, screen } from '@testing-library/react-native';
import { ErrorState } from '../../components/states/ErrorState';
import { OfflineState } from '../../components/states/OfflineState';

describe('ErrorState', () => {
  it('renders the default copy and retries on the primary action', () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(
      screen.getByText("We couldn't load this. Check your connection and give it another try."),
    ).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the tertiary help action only when onHelp is provided', () => {
    const { rerender } = render(<ErrorState onRetry={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Get help' })).toBeNull();

    const onHelp = jest.fn();
    rerender(<ErrorState onRetry={jest.fn()} onHelp={onHelp} />);
    fireEvent.press(screen.getByRole('button', { name: 'Get help' }));
    expect(onHelp).toHaveBeenCalledTimes(1);
  });

  it('accepts custom title, body, and action labels', () => {
    render(
      <ErrorState
        onRetry={jest.fn()}
        title="Lesson failed"
        body="Custom body"
        retryLabel="Reload"
      />,
    );
    expect(screen.getByText('Lesson failed')).toBeTruthy();
    expect(screen.getByText('Custom body')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy();
  });
});

describe('OfflineState', () => {
  it('renders the work-is-safe copy and retries', () => {
    const onRetry = jest.fn();
    render(<OfflineState onRetry={onRetry} />);

    expect(screen.getByText("You're offline")).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('offers offline practice only when a handler is provided', () => {
    const { rerender } = render(<OfflineState onRetry={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Practice offline phrases' })).toBeNull();

    const onPracticeOffline = jest.fn();
    rerender(<OfflineState onRetry={jest.fn()} onPracticeOffline={onPracticeOffline} />);
    fireEvent.press(screen.getByRole('button', { name: 'Practice offline phrases' }));
    expect(onPracticeOffline).toHaveBeenCalledTimes(1);
  });
});
