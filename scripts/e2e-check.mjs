import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(String(err)));
page.on("response", (res) => {
  if (res.status() >= 400) console.log("BAD_RESPONSE:", res.status(), res.url());
});

await page.goto("http://localhost:3000/products");
await page.waitForSelector("text=Ceramic Coffee Mug");
await page.click("text=Ceramic Coffee Mug");

await page.waitForSelector("text=Add to cart");
await page.selectOption("select", { label: "Black — $8.99" });
await page.fill('input[type="number"]', "2");
await page.click("text=Add to cart");
await page.waitForTimeout(300);

await page.goto("http://localhost:3000/cart");
await page.waitForSelector("text=Ceramic Coffee Mug");
const cartText = await page.textContent("body");
console.log("CART_HAS_ITEM:", cartText.includes("Ceramic Coffee Mug"));
console.log("CART_HAS_TOTAL:", cartText.includes("Total:"));

await page.click("text=Checkout");
await page.waitForSelector('input[name="customerName"]');
await page.fill('input[name="customerName"]', "Test Customer");
await page.fill('input[name="customerPhone"]', "0771234567");
await page.fill('input[name="deliveryAddress"]', "123 Test Street");
await page.fill('input[name="city"]', "Colombo");
await page.click('button[type="submit"]');

await page.waitForURL(/order-confirmation/, { timeout: 10000 });
const confirmText = await page.textContent("body");
console.log("CONFIRMATION_URL:", page.url());
console.log("HAS_THANK_YOU:", confirmText.includes("Thank you"));
console.log("HAS_CASH_ON_DELIVERY:", confirmText.toLowerCase().includes("cash"));

console.log("CONSOLE_ERRORS:", JSON.stringify(errors));

await browser.close();
