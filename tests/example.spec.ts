// @ts-check
import { test } from "@playwright/test";

test("Testing Login", async ({ page }) => {
  await page.goto("https://dev-os.blocksdevelopers.com/login");
  await page.getByRole("button", { name: "Log in to your account" }).click();
  await page.getByRole("textbox", { name: "Email" }).click();
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("john.doe@yopmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("1qazZAQ!");
  await page.getByRole("button", { name: "Log in" }).click();
});

test("Testing Navbagfhgr", async ({ page }) => {
  await page.goto("https://dev-os.blocksdevelopers.com/console");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.locator("svg.lucide-bell").click();
  await page.getByRole("button", { name: "SELISE Blocks apps" }).click();
  await page.getByRole("button", { name: "Profile" }).click();
});

test("Testing Navbarrr", async ({ page }) => {
  await page.goto("https://dev-os.blocksdevelopers.com/console");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.locator("svg.lucide-bell").click();
  await page.getByRole("button", { name: "SELISE Blocks apps" }).click();
  await page.getByRole("button", { name: "Profile" }).click();
});
