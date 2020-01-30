const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {

  let start = 1;

  // Extract movies on the page, recursively check the next page in the URL pattern
  const extractMovies = async url => {
    // Scrape the data we want
    const page = await browser.newPage();
    await page.goto(url);

    const moviesOnPage = await page.evaluate(() =>
    Array.from(document.querySelectorAll('div.lister-item'))
      .map((item) => ({
        title: item.querySelector('div.lister-item-content h3.lister-item-header a').innerText,
        logo: item.querySelector('div.lister-item-image img').src
      }))
    );

    // const moviesOnPage = await page.$$eval('div.lister-item', (items) =>
    //   items.map((item) => ({
    //     title: item.querySelector('div.lister-item-content h3.lister-item-header a').innerText,
    //     logo: item.querySelector('div.lister-item-image img').src
    //   }))
    // );

    await page.close();
    // Recursively scrape the next page
    if (moviesOnPage.length === 0) {
      // Terminate if no partners exist
      return moviesOnPage;
    } else {
      // Go fetch the next page
      start += 50;
      let nextUrl = `https://www.imdb.com/search/title/?genres=drama&groups=top_250&sort=user_rating,desc&start=${start}&ref_=adv_nxt`;
      return moviesOnPage.concat(await extractMovies(nextUrl));
    }
  }

  const browser = await puppeteer.launch();
  const url = `https://www.imdb.com/search/title/?genres=drama&groups=top_250&sort=user_rating,desc&start=1&ref_=adv_nxt`;
  const movies = await extractMovies(url);

  console.log(movies.length);

  // Write data to a json file
  fs.writeFileSync('movieData.json', JSON.stringify(movies));

  // Todo: Update database with partners

  await browser.close();
})();

