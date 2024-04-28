import { test, expect } from '@playwright/test';

test('index page has button which redirects to scenario planner page', async ({ page }) => {
  await page.goto('https://www.rt-trainer.com/');
  await page.getByRole('button', { name: 'Create a scenario' }).click();
  await expect(page.getByText('Scenario Planner')).toBeVisible();
});