import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// 실제 Sentry 대시보드가 아닌 로컬 envelope 수신기와 SDK 전송을 검증합니다.
const envelopes = [];
const collector = createServer(async (request, response) => {
  let body = "";
  for await (const chunk of request) body += chunk;
  envelopes.push(body);
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end("{}");
});
collector.listen(0, "127.0.0.1");
await once(collector, "listening");
const collectorPort = collector.address().port;
const serverPort = Number(process.env.MONITORING_TEST_PORT ?? 3211);
const baseUrl = `http://127.0.0.1:${serverPort}`;
const token = "local-monitoring-test-fixture";

async function scenario(environment, verify) {
  const child = spawn(process.execPath, [resolve(".next/standalone/server.js")], {
    env: {
      ...process.env,
      HOSTNAME: "127.0.0.1",
      PORT: String(serverPort),
      NODE_ENV: "production",
      SENTRY_DSN: `http://localpublickey@127.0.0.1:${collectorPort}/1`,
      SENTRY_ENVIRONMENT: "local-transport-test",
      SENTRY_TEST_ENABLED: "0",
      SENTRY_TEST_TOKEN: "",
      ...environment,
    },
    stdio: "ignore",
  });
  const exited = once(child, "exit");
  try {
    let ready = false;
    for (let attempt = 0; attempt < 150; attempt++) {
      if (child.exitCode !== null) throw new Error("Production server exited before becoming ready");
      try {
        const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1000) });
        if (response.ok) { ready = true; break; }
      } catch { /* 서버 시작을 기다립니다. */ }
      await delay(200);
    }
    assert.ok(ready, "Production server must become ready");
    await verify();
  } finally {
    child.kill("SIGTERM");
    await Promise.race([exited, delay(5000).then(() => child.kill("SIGKILL"))]);
  }
}
const post = (headers = {}) => fetch(`${baseUrl}/api/monitoring-test`, { method: "POST", headers });
try {
  await scenario({}, async () => {
    assert.equal((await post()).status, 404);
    console.log("PASS disabled probe returns 404");
  });
  await scenario({ SENTRY_TEST_ENABLED: "1" }, async () => {
    assert.equal((await post()).status, 404);
    console.log("PASS missing token keeps probe disabled");
  });
  await scenario({ SENTRY_TEST_ENABLED: "1", SENTRY_TEST_TOKEN: token, SENTRY_DSN: "" }, async () => {
    assert.equal((await post({ authorization: `Bearer ${token}` })).status, 503);
    console.log("PASS missing DSN returns 503 instead of reporting delivery");
  });
  await scenario({ SENTRY_TEST_ENABLED: "1", SENTRY_TEST_TOKEN: token }, async () => {
    const before = envelopes.length;
    assert.equal((await post()).status, 401);
    assert.equal((await post({ authorization: "Bearer incorrect" })).status, 401);
    assert.equal(envelopes.length, before);
    const response = await post({ authorization: `Bearer ${token}` });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.flushed, true);
    assert.match(result.eventId, /^[a-f0-9]{32}$/);
    const events = envelopes.flatMap((body) => body.split("\n").flatMap((line) => {
      try { return [JSON.parse(line)]; } catch { return []; }
    }));
    const event = events.find((item) => item.event_id === result.eventId && item.exception);
    assert.ok(event, "The matching exception envelope must reach the collector");
    assert.equal(event.exception.values[0].value, "W3 controlled monitoring verification");
    assert.equal(event.tags.verification, "w3");
    assert.ok(!JSON.stringify(event).includes(token), "The probe token must not reach the collector");
    assert.equal(event.request?.headers, undefined);
    console.log("PASS unauthorized requests send no events; authenticated probe delivers matching redacted exception");
  });
  console.log("Local SDK transport verification complete; Sentry dashboard ingestion remains a separate check.");
} finally {
  collector.close();
}
