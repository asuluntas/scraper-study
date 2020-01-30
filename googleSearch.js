const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://google.com');
  await page.type('input.gLFyf.gsfi', '"aysun sulun tas"', {delay: 100});
  await page.keyboard.press('Enter');
  await page.waitForNavigation();

  const extractResults = async () => {

    let resultsOnPage = await page.$$eval('h3.LC20lb', (results) => {
      return results.map((result) => result.innerText)
    });

    let next = await page.$('#pnnext');
    if (resultsOnPage.length === 0 || next === null) {
      return resultsOnPage;
    } else {
      await page.click('#pnnext', {waitUntil: 'domcontentloaded'});
      await page.waitForNavigation();
      return resultsOnPage.concat(await extractResults());
    }
  }

  const results = await extractResults();

  console.log(results.length);

  await page.screenshot({path: 'googleSearch.png'});

  await browser.close();
})();