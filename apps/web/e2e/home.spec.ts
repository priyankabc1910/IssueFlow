import { test, expect } from '@playwright/test';

test('displays the redesigned IssueFlow storytelling experience', async ({ page }) => {
  await page.goto('/');

  // Editorial headline
  await expect(page.getByRole('heading', { name: /Your engineering health/i })).toBeVisible();

  // Top navigation items
  await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Issues/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'My Tasks' })).toBeVisible();

  // No left sidebar
  await expect(page.locator('aside.sidebar')).toHaveCount(0);

  // Story sections
  await expect(page.getByText('Engineering is a moving system.')).toBeVisible();
  await expect(page.getByText('Not every issue deserves equal attention.')).toBeVisible();
  await expect(page.getByText('Move the important work forward.')).toBeVisible();
});
