import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { LazyHydration } from "../LazyHydration";

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
beforeAll(() => {
  global.IntersectionObserver = mockIntersectionObserver;
  mockIntersectionObserver.mockImplementation(function () {
    return { observe: vi.fn(), disconnect: vi.fn() };
  });
});

// Mock requestIdleCallback
beforeAll(() => {
  global.requestIdleCallback = (callback: IdleRequestCallback) => {
    const timeoutId = setTimeout(
      () => callback({ didTimeout: false, timeRemaining: () => 0 }),
      0,
    );
    return timeoutId as unknown as number;
  };
  global.cancelIdleCallback = vi.fn();
});

describe("LazyHydration", () => {
  const TestChild = () => <div data-testid="test-child">Test Content</div>;
  const FallbackComponent = () => <div data-testid="fallback">Loading...</div>;

  it("renders fallback initially on client-side", () => {
    render(
      <LazyHydration fallback={<FallbackComponent />}>
        <TestChild />
      </LazyHydration>,
    );

    expect(screen.getByTestId("fallback")).toBeInTheDocument();
  });

  it("hydrates when intersection observer triggers", () => {
    render(
      <LazyHydration fallback={<FallbackComponent />} intersectionObserver={{}}>
        <TestChild />
      </LazyHydration>,
    );

    // Simulate intersection observer callback
    const [[callback]] = mockIntersectionObserver.mock.calls;
    act(() => {
      callback([{ isIntersecting: true }]);
    });

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("hydrates when idle callback triggers", async () => {
    render(
      <LazyHydration
        fallback={<FallbackComponent />}
        idleCallback={{ timeout: 1000 }}
      >
        <TestChild />
      </LazyHydration>,
    );

    // Wait for idle callback to trigger
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("hydrates when specified events trigger", () => {
    render(
      <LazyHydration fallback={<FallbackComponent />} events={["mouseover"]}>
        <TestChild />
      </LazyHydration>,
    );

    // Simulate mouseover event
    act(() => {
      window.dispatchEvent(new Event("mouseover"));
    });

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("renders empty innerHTML when legacy is true", () => {
    const { container } = render(
      <LazyHydration fallback={<FallbackComponent />} legacy>
        <TestChild />
      </LazyHydration>,
    );

    const wrapper = container.firstElementChild!;
    expect(wrapper.innerHTML).toBe("");
    expect(screen.queryByTestId("test-child")).not.toBeInTheDocument();
    expect(screen.queryByTestId("fallback")).not.toBeInTheDocument();
  });

  it("legacy mode still hydrates when trigger fires", async () => {
    render(
      <LazyHydration
        fallback={<FallbackComponent />}
        legacy
        idleCallback={{ timeout: 0 }}
      >
        <TestChild />
      </LazyHydration>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("forwards ref to the wrapper div", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <LazyHydration ref={ref} fallback={<FallbackComponent />}>
        <TestChild />
      </LazyHydration>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.style.display).toBe("contents");
  });

  it("forwards callback ref to the wrapper div", () => {
    const callbackRef = vi.fn();
    render(
      <LazyHydration ref={callbackRef} fallback={<FallbackComponent />}>
        <TestChild />
      </LazyHydration>,
    );

    expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it("does not hydrate when isIntersecting is false", () => {
    mockIntersectionObserver.mockClear();
    render(
      <LazyHydration fallback={<FallbackComponent />} intersectionObserver={{}}>
        <TestChild />
      </LazyHydration>,
    );

    const [[callback]] = mockIntersectionObserver.mock.calls;
    act(() => {
      callback([{ isIntersecting: false }]);
    });

    expect(screen.queryByTestId("test-child")).not.toBeInTheDocument();
  });

  it("stays hydrated after re-render once trigger has fired", async () => {
    const { rerender } = render(
      <LazyHydration
        fallback={<FallbackComponent />}
        idleCallback={{ timeout: 0 }}
      >
        <TestChild />
      </LazyHydration>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId("test-child")).toBeInTheDocument();

    // Re-render with same props — should stay hydrated
    rerender(
      <LazyHydration
        fallback={<FallbackComponent />}
        idleCallback={{ timeout: 0 }}
      >
        <TestChild />
      </LazyHydration>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.queryByTestId("fallback")).not.toBeInTheDocument();
  });

  it("hydrates from first trigger when multiple triggers are combined", () => {
    mockIntersectionObserver.mockClear();
    render(
      <LazyHydration
        fallback={<FallbackComponent />}
        intersectionObserver={{}}
        events={["click"]}
      >
        <TestChild />
      </LazyHydration>,
    );

    // Fire event trigger first
    act(() => {
      window.dispatchEvent(new Event("click"));
    });

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("falls back to setTimeout when requestIdleCallback is unavailable", async () => {
    const original = global.requestIdleCallback;
    // @ts-expect-error -- removing to test fallback path
    delete global.requestIdleCallback;

    render(
      <LazyHydration
        fallback={<FallbackComponent />}
        idleCallback={{ timeout: 0 }}
      >
        <TestChild />
      </LazyHydration>,
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId("test-child")).toBeInTheDocument();

    // Restore
    global.requestIdleCallback = original;
  });

  it("cleans up event listeners and observers on unmount", () => {
    const disconnectMock = vi.fn();
    mockIntersectionObserver.mockImplementation(function () {
      return { observe: vi.fn(), disconnect: disconnectMock };
    });

    const { unmount } = render(
      <LazyHydration
        fallback={<FallbackComponent />}
        intersectionObserver={{}}
        events={["mouseover"]}
      >
        <TestChild />
      </LazyHydration>,
    );

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
