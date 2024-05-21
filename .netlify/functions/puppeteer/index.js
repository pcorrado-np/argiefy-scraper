const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

exports.handler = async (event, context) => {
  let browser = null;
  const url = event.queryStringParameters.url;

  try {
    // puppeteer.use(StealthPlugin());

    browser = await puppeteer.launch({
      args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
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

    return {
      statusCode: 200,
      body: JSON.stringify(ogs.result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
