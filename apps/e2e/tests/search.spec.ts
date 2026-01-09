import { expect, test } from '@playwright/test';

test.describe('Hero Search Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('filters destinations correctly', async ({ page }) => {
    await page.getByRole('combobox').click();
    await page.getByPlaceholder('Search destination...').fill('Tok');
    await expect(page.getByRole('option', { name: 'Tokyo, Japan' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Paris, France' })).toBeHidden();
  });

  test('shows empty state for unknown location', async ({ page }) => {
    await page.getByRole('combobox').click();
    await page.getByPlaceholder('Search destination...').fill('Mars Colony 9');
    await expect(page.getByText('No destination found.')).toBeVisible();
  });

  test('enables "Plan my Trip" button only after selection', async ({ page }) => {
    const planButton = page.getByRole('button', { name: /plan my trip/i });
    await expect(planButton).toBeDisabled();
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'London, UK' }).click();
    await expect(planButton).toBeEnabled();
  });
});
