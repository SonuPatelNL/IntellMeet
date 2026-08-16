import { test, expect } from '@playwright/test';

test.describe('Meeting Creation and Execution E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Standard mock session authentication helper
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'securePassword123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should trigger instant meeting creation and redirect to call', async ({ page }) => {
    // 1. Click Instant Call
    await page.click('text=Instant Call');

    // 2. Fill dialog details
    await page.fill('input[placeholder="E.g., Engineering Sync"]', 'Weekly Alignment');
    
    // 3. Confirm
    await page.click('button:has-text("Start Call")');

    // 4. Verify redirected into the room
    await expect(page).toHaveURL(/\/meeting\/\w+/);
    await expect(page.locator('text=Duration')).toBeVisible();
  });
});
