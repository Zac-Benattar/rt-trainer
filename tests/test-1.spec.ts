import { test, expect } from '@playwright/test';

test('index page has button which redirects to simulator page', async ({ page }) => {
  await page.goto('https://www.rt-trainer.com/');
  await page.getByRole('button', { name: 'Quick route' }).click();
  await expect(page.getByTestId('modal-component')).toBeVisible();
});