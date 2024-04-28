import { test, expect } from '@playwright/test';

test('Quick generation functions with valid settings not equal to the default', async ({
	page
}) => {
  await page.goto('https://www.rt-trainer.com/');
  await page.getByRole('button', { name: 'Quick route' }).click();
	await page.getByLabel('Route Seed (required)').click();
	await page.getByLabel('Route Seed (required)').fill('testseed1');
	await page.getByLabel('Scenario Seed (required)').click();
	await page.getByLabel('Scenario Seed (required)').fill('testseed2');
	await page.getByLabel('Emergency Events Engine').uncheck();
	await page.getByTestId('modal-component').getByRole('button', { name: 'Submit' }).click();
	await expect(await page.locator('#page-content')).toContainText('You are currently parked at');
});
