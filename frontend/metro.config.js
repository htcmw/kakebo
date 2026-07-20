/**
 * Metro 설정.
 *  - withNativeWind: global.css 를 입력으로 Tailwind 유틸리티 번들.
 *  - sourceExts 에 'sql' 추가: Drizzle 마이그레이션 .sql 을 모듈로 임포트.
 */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('sql');

module.exports = withNativeWind(config, { input: './global.css' });
