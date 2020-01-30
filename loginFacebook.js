const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('./config.js');
const cookies = require('./cookies.json');

(async () => {
  // Start puppeteer and open new page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Check if we have a previously saved session
  if (Object.keys(cookies).length) {

    // Set the saved cookiees in the browser page
    await page.setCookie(...cookies);

    // Go to facebook
    await page.goto('https://www.facebook.com', { waitUntil: 'networkidle0' });
  } else {

    // Go to login page
    await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle0' });

    // Write in the username and password
    await page.type('#email', config.username, { delay: 30 });
    await page.type('#pass', config.password, { delay: 30 });

    // Click the login buttorn
    await page.click('#loginbutton');

    // Wait for navigation to finish
    await page.waitForNavigation({ waitUntil: 'networkidle2'});

    // Check if logged in
    try {
      await page.waitFor('[data-click="profile_icon"]');
      await page.screenshot({path: './facebook.png'});
    } catch (error) {
      console.log("Failed to login");
      process.exit(0);
    }

    // Get the current browser page session
    let currentCookies = await page.cookies();

    // Create a cookie file if not already created to hold the session
    fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies));
  }

})();