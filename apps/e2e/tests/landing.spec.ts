import { expect, test } from '@playwright/test';

test('landing page loads, selects destination, and redirects to auth modal', async ({ page }) => {
  // Go to Home
  await page.goto('/');

  // 1. Check for the main Headline (Accessibility check)
  await expect(page.getByRole('heading', { name: /your perfect itinerary/i })).toBeVisible();

  // Select a Destination (Required to enable the button!)
  // Click the dropdown trigger (role="combobox")
  await page.getByRole('combobox').click();

  // Select "Paris, France" from the list (role="option" inside the Command list)
  // Note: We use getByText or getByRole('option') depending on the library
  await page.getByRole('option', { name: /paris, france/i }).click();

  // Click the "Plan my Trip" button
  // We use exact name matching found in the HeroSearch component
  const ctaButton = page.getByRole('button', { name: /plan my trip/i });

  // 2. Verify it is enabled before clicking
  await expect(ctaButton).toBeEnabled();
  await ctaButton.click();

  // 3. Verify Redirect
  // CORRECT WAY: expect(page).toHaveURL(...)
  // This automatically waits/retries until the URL matches
  await expect(page).toHaveURL(/auth=login/);
});
