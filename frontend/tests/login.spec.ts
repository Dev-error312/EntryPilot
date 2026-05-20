import { test, expect } from '@playwright/test';

test('login and navigate to dashboard', async ({ page }) => {
  await page.goto('http://localhost:3002/login');
  await page.fill('input[type="email"]', 'super@entrypilot.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await expect(page).toHaveURL(/\/dashboard/);
  // Ensure dashboard content loads
  await expect(page.locator('text=Overview of your visa processing')).toBeVisible({ timeout: 10000 });
});
