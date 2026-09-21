import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
  // 인증 토큰 없이도 로컬·컨테이너 빌드가 가능하게 유지합니다.
  sourcemaps: { disable: true },
});
