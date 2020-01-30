const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://booking.com');
  await page.waitForSelector('button.sb-searchbox__button.js-sb-submit-button');
  await page.type('input#ss', 'Bursa');
  await Promise.all([
    page.waitForNavigation(),
    page.click('button.sb-searchbox__button.js-sb-submit-button'),
  ]);

  const extractHotels = async (numHotelsNeeded) => {
    if (numHotelsNeeded === 0) {
      return [];
    }
    // Get hotels on the current page and map to desired shape
    let hotelsOnPage = await page.$$eval('div.sr_item', (items) =>
      items.map((item) => {
        let hotel = {};
        hotel.name = item.querySelector('span.sr-hotel__name').innerText;
        if (item.querySelector('div.bui-review-score__badge')) {
          hotel.rating = item.querySelector('div.bui-review-score__badge').innerText;
        } else {
          hotel.rating = 'no rating';
        }
        return hotel;
      })
    );
    // Check if there is any hotels at the page or the next button exists
    const next = await page.$('a.bui-pagination__link.paging-next');
    if (hotelsOnPage.length === 0 || next === null) {
      return hotelsOnPage;
    } else if (hotelsOnPage.length >= numHotelsNeeded) {
      return hotelsOnPage.slice(0, numHotelsNeeded);
    } else {
      await page.waitFor(1000);
      // Click on the next button and wait for navigation
      await Promise.all([
        page.waitForNavigation(),
        page.click('a.bui-pagination__link.paging-next')
      ]);
      await page.waitFor(1000);
      // Concat results with previous results
      let results = hotelsOnPage.concat(await extractHotels(numHotelsNeeded - hotelsOnPage.length));
      return results;
    }
  }

  let hotels = await extractHotels(100);
  console.log(hotels.length, 'hotels');

  fs.writeFileSync('hotelsData.json', JSON.stringify(hotels));

  await page.screenshot({path: 'bookingSearchFirst100.png'});
  await browser.close();
})();