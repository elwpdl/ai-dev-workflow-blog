import { createHash, timingSafeEqual } from "node:crypto";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = process.env.SENTRY_TEST_TOKEN;
  if (process.env.SENTRY_TEST_ENABLED !== "1" || !token) {
    return new Response(null, { status: 404 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const hash = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(hash(authorization), hash(`Bearer ${token}`))) {
    return new Response(null, { status: 401 });
  }
  const client = Sentry.getClient();
  if (!client?.getDsn() || client.getOptions().enabled === false) {
    return Response.json({ error: "Monitoring is not configured" }, { status: 503 });
  }

  // 의도적으로 발생시킨 오류만 수집하고 원본 요청 내용은 포함하지 않습니다.
  let eventId: string;
  try {
    throw new Error("W3 controlled monitoring verification");
  } catch (error) {
    eventId = Sentry.captureException(error, { tags: { verification: "w3" } });
  }
  const flushed = await Sentry.flush(5000);
  return Response.json({ eventId, flushed }, {
    status: flushed ? 200 : 502,
    headers: { "Cache-Control": "no-store" },
  });
}
