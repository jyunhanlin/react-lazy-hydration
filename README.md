# React Lazy Hydration

A React component for lazy hydration of components, allowing you to defer the hydration of server-side rendered components until they're needed.

## Why

[Traditional approaches](https://github.com/facebook/react/issues/10923#issuecomment-338715787) to lazy hydration in React 18+ can lead to components temporarily rendering as empty string, causing layout shifts (CLS) that negatively impact user experience.

This library solves these issues by:

- Preserving the server-rendered HTML until hydration is needed
- Preventing Content Layout Shifts (CLS) during hydration

## Features

- Maintaining SEO-friendly server-rendered content
- Lazy hydration of React components
- Providing flexible triggers for when hydration should occur
  - Intersection Observer support for viewport-based hydration
  - Idle callback support for background hydration
  - Event-based hydration triggers
- `ref` forwarding support
- Legacy mode for pure client-side rendering scenarios
- Zero dependencies

## Installation

```bash
npm install react-lazy-hydration
```

## Usage

Basic usage:

```tsx
import { LazyHydration } from 'react-lazy-hydration';

function App() {
  return (
    <LazyHydration fallback={<div>Loading...</div>}>
      <YourComponent />
    </LazyHydration>
  );
}
```

Advanced usage with all features:

```tsx
import { LazyHydration } from 'react-lazy-hydration';

function App() {
  return (
    <LazyHydration
      fallback={<div>Loading...</div>}
      intersectionObserver={{ threshold: 0.5 }}
      idleCallback={{ timeout: 2000 }}
      events={['scroll', 'mousemove']}
    >
      <YourComponent />
    </LazyHydration>
  );
}
```

Legacy mode (skips SSR HTML preservation, renders empty content until hydration):

```tsx
<LazyHydration
  fallback={<div>Loading...</div>}
  legacy
  idleCallback={{ timeout: 1000 }}
>
  <YourComponent />
</LazyHydration>
```

## Props

| Prop                   | Type                     | Required | Default | Description                                      |
| ---------------------- | ------------------------ | -------- | ------- | ------------------------------------------------ |
| `children`             | `ReactNode`              | Yes      | -       | The component to be lazily hydrated              |
| `fallback`             | `ReactNode`              | Yes      | -       | Fallback content to show before hydration        |
| `intersectionObserver` | `IntersectionObserverInit` | No     | -       | Configuration for Intersection Observer trigger  |
| `idleCallback`         | `{ timeout?: number }`   | No       | -       | Configuration for requestIdleCallback trigger    |
| `events`               | `string[]`               | No       | `[]`    | Array of events that trigger hydration           |
| `legacy`               | `boolean`                | No       | `false` | Skip SSR HTML preservation, use empty innerHTML  |
| `ref`                  | `Ref<HTMLDivElement>`    | No       | -       | Forwarded ref to the wrapper div                 |

## How It Works

1. During server-side rendering, the component renders normally
2. On the client side, the server-rendered HTML is preserved via `dangerouslySetInnerHTML` to prevent layout shifts
3. Hydration is triggered based on configured conditions:
   - When the component enters the viewport (Intersection Observer)
   - When the browser is idle (`requestIdleCallback`, falls back to `setTimeout`)
   - When specified DOM events occur
4. Once triggered, the component fully hydrates and becomes interactive
5. Once hydrated, the component stays hydrated across re-renders

When `legacy` is enabled, step 2 is skipped — the wrapper renders with empty innerHTML instead of preserving server-rendered content.

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
