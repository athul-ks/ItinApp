import { expect, test } from '@playwright/test';

test.describe('Routing and Protection', () => {
  test('redirects unauthenticated user from /plan to auth modal', async ({ page }) => {
    await page.goto('/plan');
    await expect(page).toHaveURL(/auth=login/);
  });

  test('preserves destination query param when redirecting', async ({ page }) => {
    // User tries to plan for Dubai without logging in
    await page.goto('/plan?destination=Dubai');

    // The signin URL should usually contain a "callbackUrl" or similar parameter
    // that holds the original destination, so they don't lose their choice after login.
    await expect(page).toHaveURL(/callbackUrl/);
    await expect(page).toHaveURL(/Dubai/);
  });

  test('unknown routes redirect guests to auth modal', async ({ page }) => {
    await page.goto('/some-random-page-that-does-not-exist');
    await expect(page).toHaveURL(/auth=login/);
  });
});
