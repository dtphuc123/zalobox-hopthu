import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';

// Path aliases (e.g. the ones added by `nest g library`) live in tsconfig.json,
// so they are read from there instead of being duplicated here.
const { config: tsconfig } = ts.readConfigFile(
  './tsconfig.json',
  ts.sys.readFile,
);
const paths = tsconfig?.compilerOptions?.paths ?? {};

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // Từ NestJS 12, các gói lõi (@nestjs/common, @nestjs/testing...) phát hành
  // dưới dạng ES Module thuần — không transform chúng (giữ mặc định của
  // Jest, chỉ transform code trong src/test), mà dựa vào require(esm) gốc
  // của Node (>=24.9) để load trực tiếp. Node cần chạy kèm cờ
  // --experimental-vm-modules thì Jest mới dùng được khả năng này (xem
  // script "test" trong package.json).
  moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    'libs/**/*.(t|j)s',
    'apps/**/*.(t|j)s',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
