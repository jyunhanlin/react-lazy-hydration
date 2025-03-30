# React Lazy Hydration

A React component for lazy hydration of components, allowing you to defer the hydration of components until they're needed. This helps improve initial page load performance by reducing the JavaScript bundle size that needs to be processed immediately.

## Features

- 🔄 Lazy hydration of React components
- 👀 Intersection Observer support for viewport-based hydration
- ⏱️ Idle callback support for background hydration
- 🎯 Event-based hydration triggers
- 🎨 Customizable fallback content
- ⚡ Zero dependencies

## Installation

## Usage

Basic usage:

```tsx
import { LazyHydrate } from 'react-lazy-hydration';

function App() {
  return (
    <LazyHydrate>
      <YourComponent />
    </LazyHydrate>
  );
}
```

Advanced usage with all features:

```tsx
import { LazyHydrate } from 'react-lazy-hydration';

function App() {
  return (
    <LazyHydrate
      fallback={<div>Loading...</div>}
      intersectionObserver={{ threshold: 0.5 }}
      idleCallback={{ timeout: 2000 }}
      events={['scroll', 'mousemove']}
    >
      <YourComponent />
    </LazyHydrate>
  );
}
```

## Props

| Prop                   | Type                     | Description                                        |
| ---------------------- | ------------------------ | -------------------------------------------------- |
| `children`             | ReactNode                | The component to be lazily hydrated                |
| `fallback`             | ReactNode                | Optional fallback content to show before hydration |
| `intersectionObserver` | IntersectionObserverInit | Optional configuration for Intersection Observer   |
| `idleCallback`         | { timeout?: number }     | Optional configuration for requestIdleCallback     |
| `events`               | string[]                 | Optional array of events that trigger hydration    |

## How it works

1. During server-side rendering, the component is rendered normally
2. On the client side, the component initially renders a static version
3. Hydration is triggered based on configured conditions:
   - When the component enters the viewport (if intersectionObserver is configured)
   - When the browser is idle (if idleCallback is configured)
   - When specified events occur (if events are configured)
4. Once triggered, the component fully hydrates and becomes interactive

## Development

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Run tests
pnpm test

# Build
pnpm build

# Lint
pnpm lint

# Format code
pnpm format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
