import type { Event } from "@sentry/nextjs";

/** 요청과 스택의 구조화된 민감 필드를 전송 전에 제거합니다. */
export function sanitizeEvent<T extends Event>(event: T): T {
  if (event.request) {
    delete event.request.headers;
    delete event.request.cookies;
    delete event.request.data;
    delete event.request.query_string;
    if (event.request.url) event.request.url = event.request.url.split(/[?#]/)[0];
  }
  for (const exception of event.exception?.values ?? []) {
    for (const frame of exception.stacktrace?.frames ?? []) {
      delete frame.vars;
    }
  }
  delete event.user;
  return event;
}
