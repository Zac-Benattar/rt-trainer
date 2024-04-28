import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
	await page.goto('https://www.rt-trainer.com/scenario-planner');
	await page.getByRole('button', { name: 'LONG MARSTON' }).click();
	await page.getByRole('button', { name: 'dots horizontal outline' }).click();
	await page.getByRole('button', { name: 'Delete' }).click();
	await expect(await page.getByPlaceholder('LONG MARSTON')).not.toBeVisible();
});
