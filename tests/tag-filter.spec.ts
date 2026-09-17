import { test, expect } from "@playwright/test";

test.describe("블로그 태그 필터링 기능 (Issue #1)", () => {
  test("태그 버튼을 클릭하면 해당 태그가 포함된 포스트만 필터링되어 노출된다", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. 태그 필터 바가 존재하는지 확인
    const tagFilterBar = page.locator('[data-testid="tag-filter-bar"]');
    await expect(tagFilterBar).toBeVisible();

    // 2. 'AI' 태그 버튼 클릭
    const aiTagButton = page.locator('[data-testid="tag-btn-AI"]');
    await aiTagButton.click();

    // 3. AI 관련 포스트만 노출되는지 확인
    const postCards = page.locator(".post-card");
    const count = await postCards.count();
    expect(count).toBeGreaterThan(0);

    // 모든 노출된 포스트가 'AI' 태그를 포함해야 함
    for (let i = 0; i < count; i++) {
      const card = postCards.nth(i);
      await expect(card.locator(".tags")).toContainText("AI");
    }

    // 4. '전체' 버튼 클릭 시 모든 포스트 복원
    const allButton = page.locator('[data-testid="tag-btn-ALL"]');
    await allButton.click();

    const restoredCount = await page.locator(".post-card").count();
    expect(restoredCount).toBeGreaterThan(count);
  });
});
