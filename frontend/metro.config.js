/**
 * Metro 설정.
 *  - withNativeWind: global.css 를 입력으로 Tailwind 유틸리티 번들.
 *  - sourceExts 에 'sql' 추가: Drizzle 마이그레이션 .sql 을 모듈로 임포트.
 *  - assetExts 에 'wasm' 추가: 웹(expo-sqlite = wa-sqlite/OPFS)의 wa-sqlite.wasm resolve.
 *  - COOP/COEP 헤더: 웹 dev 서버가 cross-origin isolation 을 켜야
 *    expo-sqlite 웹의 동기 API(SharedArrayBuffer + Atomics.wait)와 OPFS 가 동작(#35).
 *    (정적 배포 시에는 호스팅에서 동일 헤더를 줘야 함 — 보고서 참조.)
 */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Drizzle 마이그레이션 .sql 인라인 임포트
config.resolver.sourceExts.push('sql');

// 웹 SQLite(wa-sqlite) wasm 에셋
config.resolver.assetExts.push('wasm');

// 웹 dev 서버에 cross-origin isolation 헤더 부여 (SharedArrayBuffer/OPFS)
config.server = config.server ?? {};
const previousEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const base = previousEnhanceMiddleware
    ? previousEnhanceMiddleware(middleware, server)
    : middleware;
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    return base(req, res, next);
  };
};

module.exports = withNativeWind(config, { input: './global.css' });
