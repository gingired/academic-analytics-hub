import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest does not expose global afterEach by default. Clean up each mounted App.
afterEach(() => cleanup());
