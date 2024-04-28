import { test, expect } from '@playwright/test';

test('Scenarios can be planned and loaded into the simulator', async ({ page }) => {
  await page.goto('https://www.rt-trainer.com/');
  await page.getByRole('button', { name: 'Create a scenario' }).click();
  await page.getByRole('button', { name: 'GLOUCESTERSHIRE' }).click();
  await page.getByText('🏁 +− Leaflet | OpenAIP | ©').click();
  await page.getByRole('button', { name: 'PERSHORE' }).click();
  await page.getByRole('button', { name: 'play outline Start' }).click();
  await expect(page.locator('#page-content')).toContainText('You are currently parked at');
});