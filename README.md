# React Lazy Hydration

A React component for lazy hydration of components, allowing you to defer the hydration of server-side rendered components until they're needed.

## Why

Lazy hydration is a powerful optimization — skip hydrating non-critical components until they're actually needed — but [existing approaches in React 18+](https://github.com/facebook/react/issues/10923#issuecomment-338715787) have a catch: the un-hydrated component temporarily renders as an empty string, causing layout shift (CLS) and a flash of missing content.

`LazyHydration` avoids this by keeping the server-rendered HTML on screen, untouched, until a trigger fires. Your users see the real content from the first paint; React just defers the work of attaching interactivity.

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

This package is published to [GitHub Packages](https://github.com/jyunhanlin/react-lazy-hydration/packages).

1. Create or edit `.npmrc` in your project root:

```
@jyunhanlin:registry=https://npm.pkg.github.com
```

2. Install the package:

```bash
npm install @jyunhanlin/react-lazy-hydration
```

## Usage

`LazyHydration` preserves your server-rendered HTML until a trigger fires — so you usually don't need a `fallback`.

Basic usage:

```tsx
import { LazyHydration } from '@jyunhanlin/react-lazy-hydration';

function App() {
  return (
    <LazyHydration intersectionObserver={{ rootMargin: '200px' }}>
      <HeavyComponent />
    </LazyHydration>
  );
}
```

The server-rendered HTML of `HeavyComponent` stays on screen immediately. Hydration is deferred until the wrapper scrolls within `200px` of the viewport.

Combining triggers:

```tsx
<LazyHydration
  intersectionObserver={{ rootMargin: '200px' }}
  idleCallback={{ timeout: 3000 }}
  events={['mousemove']}
>
  <HeavyComponent />
</LazyHydration>
```

Any trigger that fires first wins. Above: hydrate when the component nears the viewport, after the browser goes idle (up to 3 seconds), or on the first `mousemove` — whichever happens first.

Client-only rendering (`legacy` mode):

```tsx
<LazyHydration
  legacy
  fallback={<Skeleton />}
  idleCallback={{ timeout: 1000 }}
>
  <ClientOnlyWidget />
</LazyHydration>
```

In `legacy` mode the wrapper renders empty on the client instead of preserving SSR HTML — use this for pure client-side apps or components that don't render on the server. `fallback` is shown in the empty slot until a trigger fires.

## Props

| Prop                   | Type                     | Required | Default | Description                                      |
| ---------------------- | ------------------------ | -------- | ------- | ------------------------------------------------ |
| `children`             | `ReactNode`              | Yes      | -       | The component to be lazily hydrated              |
| `fallback`             | `ReactNode`              | No       | -       | Fallback content shown before hydration — only rendered when there's no SSR HTML to preserve (i.e. in legacy mode or pure CSR) |
| `intersectionObserver` | `IntersectionObserverInit` | No     | -       | Hydrate when the wrapper intersects the viewport (passed to IntersectionObserver) |
| `idleCallback`         | `{ timeout?: number }`   | No       | -       | Configuration for requestIdleCallback trigger    |
| `events`               | `string[]`               | No       | `[]`    | Array of events that trigger hydration           |
| `legacy`               | `boolean`                | No       | `false` | Skip SSR HTML preservation, use empty innerHTML  |
| `ref`                  | `Ref<HTMLDivElement>`    | No       | -       | Forwarded ref to the wrapper div                 |

## How It Works

1. During server-side rendering, the component renders normally
2. On the client, the server-rendered HTML stays visible as-is until hydration triggers — no flash, no layout shift. Internally the captured HTML is re-injected into the wrapper div so React can skip re-rendering it on mount
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
