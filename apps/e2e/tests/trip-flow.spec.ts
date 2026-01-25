import { expect, test } from '@playwright/test';
import { encode } from 'next-auth/jwt';

import { env } from '@itinapp/env';
import { E2E_CONSTANTS } from '@itinapp/schemas';

const TEST_SECRET = env.NEXTAUTH_SECRET;

test.describe('Trip Generation Happy Path', () => {
  test.beforeEach(async ({ page, context }) => {
    // 1. Create a Signed JWT
    const token = await encode({
      token: {
        name: 'E2E Robot',
        email: E2E_CONSTANTS.EMAIL,
        sub: E2E_CONSTANTS.USER_ID,
        picture: 'https://example.com/avatar.jpg',
      },
      secret: TEST_SECRET,
    });

    // 2. Inject the Cookie
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        secure: false,
      },
    ]);

    // 3. Set Mock Header (for API bypass)
    await page.setExtraHTTPHeaders({
      'x-e2e-mock': 'true',
    });
  });

  test('User can generate a trip and view the results', async ({ page }) => {
    await page.goto('/plan?destination=Paris');

    await page.getByRole('button', { name: /pick a date/i }).click();
    await page.getByRole('gridcell').getByText('10', { exact: true }).first().click();
    await page.getByRole('gridcell').getByText('12', { exact: true }).first().click();
    await page.getByRole('button', { name: /standard/i }).click();
    await page.getByRole('button', { name: /generate my itinerary/i }).click();

    await expect(page).toHaveURL(new RegExp(`/trip/${E2E_CONSTANTS.TRIP_ID}`), {
      timeout: 10000,
    });

    await expect(page.getByText('Balanced Paris Adventure')).toBeVisible();
    await expect(page.getByText('£1200')).toBeVisible();
    await expect(page.getByText('Eiffel Tower')).toBeVisible();
    await expect(page.getByText('Cafe Central')).toBeVisible();
  });
});
