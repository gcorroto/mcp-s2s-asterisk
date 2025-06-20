export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
    // Environment variables setup can be done directly in tests if needed
    // setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
    
    // Test configuration
    testMatch: [
        '**/tests/**/*.test.ts',
        '**/__tests__/**/*.test.ts'
    ],
    collectCoverageFrom: [
        '**/*.{ts,js}',
        '!**/*.d.ts',
        '!dist/**/*',
        '!node_modules/**/*',
        '!coverage/**/*'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    
    // Force exit to prevent hanging on async operations
    forceExit: true,
    
    // Detect open handles for debugging
    detectOpenHandles: false,
    
    // Set test timeout
    testTimeout: 30000,
}; 