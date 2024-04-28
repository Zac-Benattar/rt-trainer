import { test, expect } from '@playwright/test';

test('Waypoints can be added and deleted by clicking on the map', async ({ page }) => {
  await page.goto('https://www.rt-trainer.com/scenario-planner');
  await page.getByRole('button', { name: 'PERSHORE' }).click();
  await page.getByRole('button', { name: 'MILSON' }).click();
  await page.getByRole('button', { name: '🏁' }).click();
  await page.getByRole('button', { name: 'trash bin outline Delete' }).click();
});