import { test, expect } from '@playwright/test';

test.describe('AI Insights E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'securePassword123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display AI summaries and extracted tasks', async ({ page }) => {
    // 1. Locate and review the AI Summaries sidebar card list
    await expect(page.locator('text=Latest AI Summaries')).toBeVisible();

    // 2. Select the Meetings tab sheet
    await page.click('button:has-text("Meetings")');

    // 3. Locate finished meetings and ensure the "AI Summary" CTA button exists
    await expect(page.locator('button:has-text("AI Summary")').first()).toBeVisible();
  });
});
