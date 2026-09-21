import { test, expect } from "@playwright/test";

test("AC1: 제목·요약·태그를 대소문자와 주변 공백에 관계없이 검색한다", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "게시글 검색" });
  const titles = page.locator(".post-card h2");
  await search.fill("  hELLo wORLd  ");
  await expect(titles).toHaveText(["Hello World: AI Dev Workflow 블로그 시작하기"]);
  await search.fill("컨텍스트 관리 기법");
  await expect(titles).toHaveText(["AI 기반 개발의 핵심 원칙"]);
  await search.fill("bestpractices");
  await expect(titles).toHaveText(["AI 기반 개발의 핵심 원칙"]);
  await expect(page.getByRole("status")).toHaveText("검색 결과 1개");
});

test("AC2·AC3: 검색과 태그를 조합하고 검색만 초기화한다", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "게시글 검색" });
  const titles = page.locator(".post-card h2");
  const initialTitles = await titles.allTextContents();
  await page.getByTestId("tag-btn-AI").click();
  const aiTitles = await titles.allTextContents();
  await search.fill("hello world");
  await expect(titles).toHaveText(["Hello World: AI Dev Workflow 블로그 시작하기"]);
  await search.fill("Getting Started");
  await expect(titles).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("검색 결과 0개");
  await expect(page.getByText("검색 조건에 맞는 게시글이 없습니다.")).toBeVisible();
  await page.getByTestId("tag-btn-ALL").click();
  await expect(search).toHaveValue("Getting Started");
  await expect(titles).toHaveText(["Getting Started: 개발 환경 설정 및 블로그 구조"]);
  await page.getByTestId("tag-btn-AI").click();
  await expect(titles).toHaveCount(0);
  await page.getByRole("button", { name: "검색 초기화" }).click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("");
  await expect(page.getByTestId("tag-btn-AI")).toHaveAttribute("aria-pressed", "true");
  await expect(titles).toHaveText(aiTitles);
  await search.fill("   ");
  await expect(titles).toHaveText(aiTitles);
  await page.getByTestId("tag-btn-ALL").click();
  await expect(titles).toHaveText(initialTitles);
});

test("AC1·AC6: 기호는 정규식이 아닌 문자로 처리하고 검색 결과에서 상세로 이동한다", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "게시글 검색" });
  await search.fill(".*[");
  await expect(page.locator(".post-card")).toHaveCount(0);
  await search.fill("Hello World");
  await page.locator(".post-card h2 a").click();
  await expect(page.locator(".post-header h1")).toContainText("Hello World");
});

for (const width of [390, 1280]) {
  test(`AC4: ${width}px에서 키보드 검색과 초기화가 동작한다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const search = page.getByRole("searchbox", { name: "게시글 검색" });
    await search.focus();
    await page.keyboard.type("Hello World");
    await expect(page.locator(".post-card")).toHaveCount(1);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "검색 초기화" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(search).toHaveValue("");
    await expect(search).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `docs/evidence/w4/search-${width}.png`, fullPage: true });
  });
}
