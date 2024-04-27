import { expect, test } from '@playwright/test';

test('index page has expected h1 with RT Trainer title', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'RT Trainer' })).toBeVisible();
});

test('index page has webpage name visible in browser tab', async ({ page }) => {
	await page.goto('/');
	expect(await page.title()).toContain('RT Trainer');
});

test('index page has button which redirects to simulator page', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Quick route' }).click();
	await expect(page.waitForURL(/simulator/));

	true;
});

test('index page has button which redirects to scenario planner page', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Create a scenario' }).click();

	await expect(page.waitForURL(/scenario-planner/));

	true;
});
