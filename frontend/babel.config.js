/**
 * Babel 설정.
 *  - babel-preset-expo + NativeWind(jsxImportSource) 로 Tailwind 유틸리티 컴파일.
 *  - babel-plugin-inline-import 로 Drizzle 마이그레이션 .sql 을 문자열로 인라인
 *    (drizzle-orm/expo-sqlite 마이그레이터가 요구).
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
