import * as Sentry from '@sentry/react-native';
import { logger } from '../../lib/logger';

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureMessage: jest.fn(),
  captureException: jest.fn(),
}));

const addBreadcrumb = Sentry.addBreadcrumb as jest.Mock;
const captureMessage = Sentry.captureMessage as jest.Mock;
const captureException = Sentry.captureException as jest.Mock;

describe('logger', () => {
  beforeEach(() => {
    addBreadcrumb.mockClear();
    captureMessage.mockClear();
    captureException.mockClear();
  });

  it('debug/info become breadcrumbs, not captured events', () => {
    logger.debug('boot', 'starting');
    logger.info('auth', 'signed in', { userId: 'u1' });

    expect(addBreadcrumb).toHaveBeenCalledTimes(2);
    expect(addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'auth', message: 'signed in', level: 'info' }),
    );
    expect(captureMessage).not.toHaveBeenCalled();
    expect(captureException).not.toHaveBeenCalled();
  });

  it('warn is captured as a warning message tagged with scope', () => {
    logger.warn('sync', 'queue rehydrate failed');

    expect(captureMessage).toHaveBeenCalledWith(
      '[sync] queue rehydrate failed',
      expect.objectContaining({ level: 'warning', tags: { scope: 'sync' } }),
    );
    expect(captureException).not.toHaveBeenCalled();
  });

  it('error captures the passed Error so the stack is preserved', () => {
    const boom = new Error('network down');
    logger.error('api', 'fetchUserRow failed', { err: boom });

    expect(captureException).toHaveBeenCalledWith(
      boom,
      expect.objectContaining({ tags: { scope: 'api' } }),
    );
  });

  it('error without an Error value synthesizes one from the message', () => {
    logger.error('progress', 'unexpected state');

    const [errArg] = captureException.mock.calls[0];
    expect(errArg).toBeInstanceOf(Error);
    expect((errArg as Error).message).toBe('[progress] unexpected state');
  });

  it('redacts sensitive keys before sending', () => {
    logger.warn('auth', 'token refresh', { access_token: 'xyz', userId: 'u1' });

    const [, opts] = captureMessage.mock.calls[0];
    expect(opts.extra).toEqual({ access_token: '[redacted]', userId: 'u1' });
  });
});
