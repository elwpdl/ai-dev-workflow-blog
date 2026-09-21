import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeEvent } from "../lib/monitoring/sanitize-event.ts";

test("remove request credentials, query values, user information and locals across all exceptions", () => {
  const event = {
    event_id: "fixture-event", tags: { verification: "w3" },
    request: { url: "https://example.test/page?token=fixture#fragment", query_string: "token=fixture", headers: { authorization: "fixture" }, cookies: "fixture", data: "fixture", method: "POST" },
    user: { email: "fixture@example.test" },
    exception: { values: [
      { type: "Error", value: "message", stacktrace: { frames: [{ filename: "app.ts", lineno: 10, vars: { token: "fixture" } }] } },
      { type: "Error", stacktrace: { frames: [{ vars: { password: "fixture" } }] } },
    ] },
  };
  const result = sanitizeEvent(event);
  assert.deepEqual(result.request, { url: "https://example.test/page", method: "POST" });
  assert.equal(result.user, undefined);
  assert.deepEqual(result.exception.values[0].stacktrace.frames[0], { filename: "app.ts", lineno: 10 });
  assert.deepEqual(result.exception.values[1].stacktrace.frames[0], {});
  assert.equal(result.exception.values[0].value, "message");
  assert.equal(result.event_id, "fixture-event");
  assert.deepEqual(result.tags, { verification: "w3" });
});

test("handle events without optional request or stacktrace fields", () => {
  assert.deepEqual(sanitizeEvent({ message: "plain error" }), { message: "plain error" });
  assert.deepEqual(sanitizeEvent({ exception: { values: [{ type: "Error" }] } }), { exception: { values: [{ type: "Error" }] } });
});
