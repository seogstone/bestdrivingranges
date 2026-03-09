import { expect, test } from "@playwright/test";

test("homepage renders core heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /find the best driving ranges/i })).toBeVisible();
});
