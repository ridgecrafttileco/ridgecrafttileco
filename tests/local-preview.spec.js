const { test, expect } = require("@playwright/test");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";

const pages = [
  "/",
  "/tile-cleaning-orem/",
  "/grout-repair-orem/",
  "/shower-regrouting-orem/",
  "/tile-cleaning-utah-county/",
  "/robots.txt",
  "/sitemap.xml"
];

test("all important local preview URLs load", async ({ request }) => {
  for (const path of pages) {
    const response = await request.get(new URL(path, baseUrl).toString());
    expect(response.status(), path).toBe(200);
  }
});

test("home page lead actions are present and form validates", async ({ page }) => {
  await page.route("https://usebasin.com/f/8c0018ad43c9", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true })
    });
  });

  await page.goto(baseUrl + "/");
  await expect(page.getByRole("heading", { name: /your tile,\s*restored/i })).toBeVisible();
  await expect(page.locator("#contact")).toBeVisible();

  const phoneLinks = await page.locator('a[href="tel:+18016879723"]').count();
  expect(phoneLinks).toBeGreaterThanOrEqual(3);
  expect(await page.locator('a[href="/#quote"]').count()).toBe(0);

  await page.getByRole("button", { name: /request my free quote/i }).click();
  await expect(page.locator("#form-status")).toHaveText(/please fix/i);

  await page.locator("#name").fill("Test Lead");
  await page.locator("#phone").fill("8016879723");
  await page.locator("#email").fill("test@example.com");
  await page.locator("#city").fill("Orem");
  await page.locator("#service").selectOption("Tile and grout cleaning");
  await page.getByLabel("Text").check();
  await page.locator("#details").fill("Local test only. No real customer information.");
  await page.getByRole("button", { name: /request my free quote/i }).click();
  await expect(page.locator("#form-status")).toHaveText(/quote request was sent/i);
});
