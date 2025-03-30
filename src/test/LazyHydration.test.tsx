import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { LazyHydration } from '../LazyHydration';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
beforeAll(() => {
  global.IntersectionObserver = mockIntersectionObserver;
  mockIntersectionObserver.mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  }));
});

// Mock requestIdleCallback
beforeAll(() => {
  global.requestIdleCallback = (callback: IdleRequestCallback) => {
    const timeoutId = setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 0);
    return timeoutId as unknown as number;
  };
  global.cancelIdleCallback = vi.fn();
});

describe('LazyHydration', () => {
  const TestChild = () => <div data-testid="test-child">Test Content</div>;
  const FallbackComponent = () => <div data-testid="fallback">Loading...</div>;

  it('renders fallback initially on client-side', () => {
    render(
      <LazyHydration fallback={<FallbackComponent />}>
        <TestChild />
      </LazyHydration>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('hydrates when intersection observer triggers', () => {
    render(
      <LazyHydration fallback={<FallbackComponent />} intersectionObserver={{}}>
        <TestChild />
      </LazyHydration>
    );

    // Simulate intersection observer callback
    const [[callback]] = mockIntersectionObserver.mock.calls;
    act(() => {
      callback([{ isIntersecting: true }]);
    });

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('hydrates when idle callback triggers', async () => {
    render(
      <LazyHydration fallback={<FallbackComponent />} idleCallback={{ timeout: 1000 }}>
        <TestChild />
      </LazyHydration>
    );

    // Wait for idle callback to trigger
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('hydrates when specified events trigger', () => {
    render(
      <LazyHydration fallback={<FallbackComponent />} events={['mouseover']}>
        <TestChild />
      </LazyHydration>
    );

    // Simulate mouseover event
    act(() => {
      window.dispatchEvent(new Event('mouseover'));
    });

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('cleans up event listeners and observers on unmount', () => {
    const disconnectMock = vi.fn();
    mockIntersectionObserver.mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: disconnectMock,
    }));

    const { unmount } = render(
      <LazyHydration
        fallback={<FallbackComponent />}
        intersectionObserver={{}}
        events={['mouseover']}
      >
        <TestChild />
      </LazyHydration>
    );

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
