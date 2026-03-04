import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Use the test .env file (sqlite, no rate limiting)
        setupFiles: ['./src/tests/setup.ts'],
        environment: 'node',
        // Run test files sequentially to maintain shared state (tokens, IDs)
        pool: 'forks',
        poolOptions: {
            forks: { singleFork: true }
        },
        // Generous timeout for API calls
        testTimeout: 30000,
        hookTimeout: 60000,
        // Pretty reporter with verbose test names
        reporters: ['verbose'],
        // Only run api tests, not unit tests mixed in
        include: ['src/tests/**/*.test.ts'],
    },
});
