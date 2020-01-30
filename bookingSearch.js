const puppeteer = require('puppeteer');

(async () => {

  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://www.booking.com');
  await page.waitForSelector('button.sb-searchbox__button.js-sb-submit-button');
  await page.type('input#ss', 'Bursa');
  await Promise.all([
    page.waitForNavigation(),
    page.click('button.sb-searchbox__button.js-sb-submit-button'),
  ]);

  const extractResults = async () => {

    const hotelsOnPage = await page.$$eval('div.sr_item', (items) =>
      items.map((item) => {
        let hotel = {};
        hotel.name = item.querySelector('span.sr-hotel__name').innerText;
        if (item.querySelector('div.bui-review-score__badge')) {
          hotel.rating = item.querySelector('div.bui-review-score__badge').innerText;
        }
        return hotel;
      })
    );

    const next = await page.$('a.bui-pagination__link.paging-next');

    if (hotelsOnPage.length === 0 || next === null) {
      return hotelsOnPage;
    } else {
      await page.waitFor(1000);
      await Promise.all([
        page.waitForNavigation(),
        await page.click('a.bui-pagination__link.paging-next')
      ]);
      await page.waitFor(1000);
      return hotelsOnPage.concat(await extractResults());
    }
  }

  const hotels = await extractResults();

  console.log('hotels', hotels.length);

  await page.screenshot({path: 'bookingSearch.png'});
  await browser.close();
})();