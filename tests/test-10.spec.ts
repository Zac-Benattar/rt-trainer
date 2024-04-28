import { test, expect } from '@playwright/test';

test('The simulator supports changing radio and transponer frequency', async ({ page }) => {
  await page.goto('https://www.rt-trainer.com/');
  await page.getByRole('button', { name: 'Quick route' }).click();
  await page.getByTestId('modal-component').getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('button', { name: 'Outer Dial Anti-Clockwise' }).click();
  await page.getByRole('button', { name: 'Outer Dial Clockwise' }).click();
  await page.getByRole('button', { name: 'Inner Dial Anti-Clockwise' }).click();
  await page.getByRole('button', { name: 'Inner Dial Clockwise' }).click();
  await page.getByText('SBY').click();
  await page.getByRole('button', { name: 'Outer Dial Anti-Clockwise' }).click();
  await page.getByRole('button', { name: 'Inner Dial Anti-Clockwise Inner Dial Clockwise', exact: true }).click();
  await page.locator('#frequency-dial-t4avqs').dblclick();
  await page.getByRole('button', { name: 'BACK' }).click();
  await page.locator('#frequency-dial-t4avqs').dblclick();
  await page.getByRole('button', { name: 'ENT', exact: true }).click();
  await page.getByRole('button', { name: 'ENT', exact: true }).click();
  await page.locator('#frequency-dial-t4avqs').dblclick();
  await page.getByRole('button', { name: 'ENT', exact: true }).click();
  await page.locator('#frequency-dial-t4avqs').dblclick();
  await page.locator('#frequency-dial-t4avqs').click();
  await page.locator('#frequency-dial-t4avqs').dblclick();
  await page.getByRole('button', { name: 'Inner Dial Anti-Clockwise Inner Dial Clockwise', exact: true }).dblclick();
});