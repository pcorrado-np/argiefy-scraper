const openGraphScraper = require("open-graph-scraper-lite");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const express = require("express");

const app = express();

// Define your routes and middleware here

app.use(express.static("public"));

// Query example http://localhost:3000/promotion?url=<url>
app.get("/promotion", async (req, res) => {
  const url = req.query.url;

  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  const htmlData = await page.content();

  await browser.close();

  const ogs = await openGraphScraper({
    html: htmlData,
    customMetaTags: [
      {
        fieldName: "productPriceAmount",
        property: "product:price:amount",
        multiple: false,
      },
    ],
  });

  res.send(ogs.result);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
