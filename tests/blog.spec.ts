import { test, expect } from "@playwright/test";

test("홈페이지에 블로그 제목과 포스트 목록이 렌더링된다", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero h1")).toContainText("AI Dev Workflow Blog");
  const postCards = page.locator(".post-card");
  expect(await postCards.count()).toBeGreaterThanOrEqual(1);
  await expect(page.locator("text=AI 에이전트와 함께하는 자동화 포스팅")).toBeVisible();
});

test("포스트 클릭 시 상세 페이지로 이동하고 마크다운 콘텐츠가 정상 표시된다", async ({
  page,
}) => {
  await page.goto("/");
  await page.click("text=Hello World: AI Dev Workflow 블로그 시작하기");
  await expect(page.locator(".post-header h1")).toContainText("Hello World");
  await expect(page.locator(".back-link")).toBeVisible();
});
