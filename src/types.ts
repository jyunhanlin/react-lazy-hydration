export interface LazyHydrationProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
  // Trigger options
  intersectionObserver?: {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
  };
  idleCallback?: {
    timeout?: number;
  };
  events?: string[];
}
