import React$1 from "react";
//#region src/types.d.ts
interface LazyHydrationProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  intersectionObserver?: {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
  };
  idleCallback?: {
    timeout?: number;
  };
  events?: string[];
  legacy?: boolean;
}
//#endregion
//#region src/LazyHydration.d.ts
declare const LazyHydration: React$1.ForwardRefExoticComponent<LazyHydrationProps & React$1.RefAttributes<HTMLDivElement>>;
//#endregion
export { LazyHydration };
//# sourceMappingURL=index.d.mts.map