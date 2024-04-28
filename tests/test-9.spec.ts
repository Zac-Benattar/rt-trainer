import { test, expect } from '@playwright/test';

test('The quick route link create a scenario with a tutorial', async ({ page }) => {
  await page.goto('https://www.rt-trainer.com/');
  await page.getByRole('button', { name: 'Quick route' }).click();
  await page.getByTestId('modal-component').getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByTestId('step')).toContainText('Welcome to RT Trainer. This tutorial will explain how to use the simulator. Click next to continue.');
});