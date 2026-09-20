import { test, expect } from "@playwright/test";

test.describe("블로그 태그 필터링 기능 (Issue #1)", () => {
  test("전체 태그를 표시하고 AI 필터와 전체 목록 복원을 검증한다", async ({ page }) => {
    await page.goto("/");
    const filterBar = page.getByTestId("tag-filter-bar");
    await expect(filterBar).toBeVisible();

    const cards = page.locator(".post-card");
    const initialTitles = await cards.locator("h2").allTextContents();
    const initialPosts = await cards.evaluateAll((elements) =>
      elements.map((element) => ({
        title: element.querySelector("h2")?.textContent ?? "",
        tags: Array.from(element.querySelectorAll(".tag"), (tag) => tag.textContent ?? ""),
      })),
    );
    expect(initialTitles.length).toBeGreaterThan(0);
    const tags = [...new Set(initialPosts.flatMap((post) => post.tags))];
    for (const tag of tags) {
      await expect(page.getByTestId(`tag-btn-${tag.slice(1)}`)).toBeVisible();
    }

    // 표시된 글 전체를 비교해 잘못 남거나 누락되는 글도 검출합니다.
    const expectedTitles = initialPosts.filter((post) => post.tags.includes("#AI")).map((post) => post.title);
    expect(expectedTitles.length).toBeGreaterThan(0);
    expect(expectedTitles.length).toBeLessThan(initialTitles.length);
    await page.getByTestId("tag-btn-AI").click();
    await expect(cards.locator("h2")).toHaveText(expectedTitles);

    await page.getByTestId("tag-btn-ALL").click();
    await expect(cards.locator("h2")).toHaveText(initialTitles);
  });

  test("선택한 태그를 다시 클릭하면 전체 목록과 순서가 복원된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("tag-filter-bar")).toBeVisible();
    const titles = page.locator(".post-card h2");
    const initialTitles = await titles.allTextContents();
    const aiButton = page.getByTestId("tag-btn-AI");
    await aiButton.click();
    await expect(aiButton).toHaveClass(/active/);
    await aiButton.click();
    await expect(page.getByTestId("tag-btn-ALL")).toHaveClass(/active/);
    await expect(aiButton).not.toHaveClass(/active/);
    await expect(titles).toHaveText(initialTitles);
  });
});
