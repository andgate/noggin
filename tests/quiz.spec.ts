import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
});

test.describe("Quiz", () => {
    test("has title", async ({ page }) => {
        // Expect a title "to contain" a substring.
        await expect(page).toHaveTitle(/Noggin/);
    });

    test("create quiz button", async ({ page }) => {
        // Click the get started link.
        await page.getByRole("button", { name: "Create Quiz" }).click();

        // Expects page to have a heading with the name of Installation.
        await expect(
            page.getByRole("heading", { name: "Create New Quiz" }),
        ).toBeVisible();
    });
});
