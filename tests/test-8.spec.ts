import { test, expect } from '@playwright/test';

test('Scenarios can be planned with a generated route and loaded into the simulator', async ({ page }) => {
  await page.goto('https://www.rt-trainer.com/');
  await page.getByRole('button', { name: 'Create a scenario' }).click();
  await page.getByRole('button', { name: 'wand magic sparkles outline' }).click();
  await page.getByTestId('accordion-item').getByRole('button', { name: 'refresh outline' }).click();
  await page.getByRole('button', { name: 'play outline Start' }).click();
  await expect(page.locator('#page-content')).toContainText('You are currently parked at');
});