import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Flow', () => {
  test('should successfully log in a user and redirect to dashboard', async ({ page }) => {
    // 1. Visit Login page
    await page.goto('/login');

    // 2. Fill login details
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'securePassword123');

    // 3. Click Login
    await page.click('button[type="submit"]');

    // 4. Verify redirection to Dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should show validation errors for incorrect fields', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email is invalid')).toBeVisible();
  });
});
