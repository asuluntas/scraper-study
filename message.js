const puppeteer = require('puppeteer');
const config = require('./config.js');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://www.facebook.com/login');
  await page.type('#email', config.username, { delay: 30 });
  await page.type('#pass', config.password, { delay: 30 });
  await page.click('#loginbutton');
  await page.waitForNavigation({waitUntil: 'networkidle2'});

  try {
    await page.waitFor('[data-click="profile_icon"]');
    await page.screenshot({path: './message.png'});
  } catch (error) {
    console.log("Failed to login");
    process.exit(0);
  }

  await page.click('#u_0_e', {waitUntil: 'domcontentloaded'});
  await page.click('#u_0_f', {waitUntil: 'domcontentloaded'});
  await page.waitFor(1200);

  await page.type('input.hiddenInput', 'Aysun Sulun Tas', { delay: 500 });
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitFor(1000);
  await page.click('svg[preserveAspectRatio="xMinYMax meet"]', {waitUntil: 'domcontentloaded'});

  await page.waitFor(1000);

  await page.keyboard.press('Enter');

  await page.$('span[data-offset-key="df0hj-0-0"]');

  await page.waitFor(1000);

  await page.screenshot({path: './message.png'});

  await browser.close();
})();