/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  collectCoverage: false, // Qualquer teste gera um coverage
  testTimeout: 20000,
  coverageDirectory: 'coverage', // Gerar pasta separada de coverages
  coverageProvider: 'babel',
  testMatch: ['**/**.spec.ts', '**/**.test.ts'],
  modulePaths: [
    '<rootDir>',
    '/home/some/other/path'
  ],
  roots: [
    '<rootDir>/testes'
  ], // Onde fica o diretorio de testes
  transform: {
    '\\.ts$': 'ts-jest'
  },
  coverageReporters: ['json', 'html'],
  moduleDirectories: ['node_modules', 'dirname']
}