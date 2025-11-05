module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'tests/**/*.ts',
    '!tests/**/*.d.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000, // 30초 (서비스 시작 대기 시간 고려)
  verbose: true,
};

