"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    collectCoverage: false,
    testTimeout: 20000,
    coverageDirectory: 'coverage',
    coverageProvider: 'babel',
    testMatch: ['**/**.spec.ts', '**/**.test.ts'],
    modulePaths: [
        '<rootDir>',
        '/home/some/other/path'
    ],
    roots: [
        '<rootDir>/testes'
    ],
    transform: {
        '\\.ts$': 'ts-jest'
    },
    coverageReporters: ['json', 'html'],
    moduleDirectories: ['node_modules', 'dirname']
};
//# sourceMappingURL=jest.config.js.map