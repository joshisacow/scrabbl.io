import { test, expect } from '@playwright/test';

test('test', async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // user 1
    await page1.goto('http://localhost:31000/api/login?key=abc&user=test1');
    await page1.getByRole('button', { name: 'Create Game' }).click();
    const gameIdElement = await page1.getByText('Game ID:');
    const gameIdText = await gameIdElement.textContent();
    if (!gameIdText) {
        throw new Error('Game ID not found');
    }
    const gameId = gameIdText.split(':')[1].trim();

    // user 2
    await page2.goto('http://localhost:31000/api/login?key=abc&user=test2');
    await page2.getByPlaceholder('Enter Game ID').fill(gameId);
    await page2.getByRole('button', { name: 'Join Game' }).click();
    await page1.reload();
    await page2.reload();
    
    await page2.waitForTimeout(2000);

    const currentTurn = await page2.getByRole('heading')
    if (!currentTurn) {
        throw new Error('Current turn not found');
    }
    const currentTurnText = await currentTurn.textContent();
    console.log('currentTurnText', currentTurnText)
    const currentTurnPlayer = currentTurnText!.split(':')[1].trim();

    // try to skip turn -> check if state reflected on both pages
    if (currentTurnPlayer === 'test2') {
        await expect(page1.getByRole('heading')).toContainText('Current Turn: test2');
        await page2.getByRole('button', { name: 'Skip' }).click();
        await page1.reload();
        await page2.reload();
        await expect(page1.getByRole('heading')).toContainText('Current Turn: test1');
        await expect(page2.getByRole('heading')).toContainText('Current Turn: test1');
    } else {
        await expect(page1.getByRole('heading')).toContainText('Current Turn: test1');
        await page1.getByRole('button', { name: 'Skip' }).click();
        await page1.reload();
        await page2.reload();
        await expect(page1.getByRole('heading')).toContainText('Current Turn: test2');
        await expect(page2.getByRole('heading')).toContainText('Current Turn: test2');
    }

    await page2.waitForTimeout(3000);

    // await page.goto('http://localhost:8130/operator/jim');
    // await expect(page.locator('tr:last-child:not(:has-text("Customer"))')).toContainText('[ "soy milk" ]');
});