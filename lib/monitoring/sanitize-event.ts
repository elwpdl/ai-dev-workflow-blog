import type { Event } from "@sentry/nextjs";

/** 요청과 스택의 구조화된 민감 필드를 전송 전에 제거합니다. */
export function sanitizeEvent<T extends Event>(event: T): T {
  const stripUrl = (url: string) => url.split(/[?#]/)[0];
  if (event.request) {
    delete event.request.headers;
    delete event.request.cookies;
    delete event.request.data;
    delete event.request.query_string;
    if (event.request.url) event.request.url = stripUrl(event.request.url);
  }
  for (const breadcrumb of event.breadcrumbs ?? []) {
    const data = breadcrumb.data;
    if (!data) continue;
    for (const key of ["from", "to", "url"]) {
      if (typeof data[key] === "string") data[key] = stripUrl(data[key]);
    }
  }
  for (const exception of event.exception?.values ?? []) {
    for (const frame of exception.stacktrace?.frames ?? []) {
      delete frame.vars;
    }
  }
  delete event.user;
  return event;
}
