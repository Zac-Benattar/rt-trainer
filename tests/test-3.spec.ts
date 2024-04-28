import { test, expect } from '@playwright/test';

test('Quick Generation works with default settings', async ({ page }) => {
  await page.goto('https://www.rt-trainer.com/');
  await page.getByRole('button', { name: 'Quick route' }).click();
  await page.getByTestId('modal-component').getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('You are currently parked at')).toBeVisible();
});