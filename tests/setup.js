// Runs once before the test suite -- adds jest-dom's matchers
// (toBeInTheDocument, toHaveTextContent, etc.) to Vitest's expect. The
// /vitest subpath (not the plain package) is what actually wires into
// Vitest's own expect instance -- the plain import assumes a global
// `expect` (Jest's default), which this project deliberately doesn't
// enable (see vite.config.js -- avoids needing ESLint test-globals config).
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// React Testing Library auto-registers this itself when it detects Jest's
// global `afterEach` -- since this project doesn't enable Vitest's
// `globals: true` (same reasoning as above), that detection never fires,
// so without this explicit call every test's rendered DOM would silently
// pile up in document.body across the whole file instead of being reset
// between tests.
afterEach(() => {
  cleanup()
})
