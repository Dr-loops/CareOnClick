
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Dr Kal/);
});

test('login link exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Login/i })).toBeVisible();
});
