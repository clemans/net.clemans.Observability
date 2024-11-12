import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  transformIgnorePatterns: ['^.+\\.js$'],
  verbose: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/dist/'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$'
};
export default config;