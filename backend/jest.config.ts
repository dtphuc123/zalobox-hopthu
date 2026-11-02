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
    // Một số gói trong node_modules (vd @nestjs/*) phát hành dưới dạng ES
    // Module thuần (import/export), trong khi project này biên dịch/chạy ở
    // chế độ CommonJS (không có "type": "module"). Ép ts-jest luôn biên
    // dịch ra CommonJS (bất kể "module": "nodenext" ở tsconfig.json dùng
    // cho build) để test không bị lỗi "Must use import to load ES Module".
    '^.+\\.(t|j)s$': [
      'ts-jest',
      { isolatedModules: true, tsconfig: { module: 'commonjs', allowJs: true } },
    ],
  },
  // Mặc định Jest bỏ qua toàn bộ node_modules khi transform; ở đây cho phép
  // transform riêng @nestjs/* để xử lý được tình huống ESM nói trên.
  transformIgnorePatterns: ['/node_modules/(?!(@nestjs)/)'],
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
