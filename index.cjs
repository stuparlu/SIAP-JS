const he = require("he");
const { JSDOM } = require('jsdom');
const cheerio = require('cheerio');
const puppeteer = require("puppeteer-extra");

const campaignSelector = "#react-campaign > section > div > div"
const videoDivSelector = "#react-project-header > div > div > div.grid-row.grid-row.mb5-lg.mb0-md.order1-md.order2-lg > div.grid-col-12.grid-col-8-lg > div.mx-4.mx-12-md.mx0-lg.relative.clip"
const videoSelector = "#react-project-header > div > div.grid-container.flex.flex-column > div.grid-row.grid-row.mb5-lg.mb0-md.order1-md.order2-lg > div.grid-col-12.grid-col-8-lg > div.mx-4.mx-12-md.mx0-lg.relative.clip > div > video"
const searchButtonSelector =  "#global-header > section > section.section_global-nav-right.justify-end.order3.flex.grow1-md.pr3.pr4-sm.items-center.py2.basis50p-md > button";
const searchFieldSelector = "#global-header > section > div.animation-fade-in.animation-300.animation-easeOutQuart.w100p.t0.l0.absolute.z-guided-search-3.block > div > div > div.p0.flex.z-dropdown-3.relative.shadow-2.items-center > input"
const searchResultsSelector = "#global-header > section > div.animation-fade-in.animation-300.animation-easeOutQuart.w100p.t0.l0.absolute.z-guided-search-3.block > div > div > div.z-dropdown-3.scroll-y.relative.webkit-scrolling.bg-white > ul"

const shortSleepInterval = 5000;
const mediumSleepInterval = 7000;
const longSleepInterval = 15000;

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function loadDataset() {
  const fs = require("fs");
  let rawdata = fs.readFileSync("titles.json");
  let data = JSON.parse(rawdata).data;
  return data;
}

function extractCampaignText(campaignHTML) {
  var $ = cheerio.load(campaignHTML);

  $('body *').each(function() {
    const element = $(this);
    if (element.text().trim().length > 0) {
      element.after(' ');
    }
  });
  
  const allText = $.text();
  return allText;
}

(async () => {
  const StealthPlugin = require("puppeteer-extra-plugin-stealth");
  puppeteer.use(StealthPlugin());
  const { executablePath } = require("puppeteer");

  async function searchForProject(searchTerm) {
    await Promise.all([
      await page.click(
         searchButtonSelector
       ),
     ]);

     await page.focus(searchFieldSelector);
     await page.keyboard.type(searchTerm);
  }

  async function parseSearchResult() {
    const searchResults = await page.$(searchResultsSelector);
    const resultsHTML = await page.evaluate(
      (element) => element.innerHTML,
      searchResults
    );
    decoded = he.decode(resultsHTML);
    return decoded;
  }

  async function gotToSearchResult(result) {
    $ = cheerio.load(result.parent().html());
    const imgSrc = $('img').attr('src');

    const linkElementHandle = await page.$(`img[src="${imgSrc}"]`);
    await linkElementHandle.click();
    await page.waitForNavigation();
    await sleep(longSleepInterval);
  }

  async function analyzeProjectPage() {
    const campaignElement = await page.$(
      campaignSelector
    );
    const campaignHTML = await page.evaluate(
      (element) => element.innerHTML,
      campaignElement
    );

    console.log(campaignHTML);
    text = extractCampaignText(campaignHTML);
    console.log(text);
  }

  async function deleteTextFromSearchField() {
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
  }

  async function search(title) {
    await searchForProject(title);
    await sleep(mediumSleepInterval);
    searchResult = await parseSearchResult();
    var $ = cheerio.load(searchResult);
    const result = $(`div:contains("${title}")`);
    return result;
  }
  titles = loadDataset();

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath(),
    // executablePath: executablePath('C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
    userDataDir:
      "C:\\Users\\Luka\\AppData\\Local\\BraveSoftware\\Brave-Browser\\puppetData",
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto("https://kickstarter.com/", { waitUntil: "load" });

  for (let title in titles) {
    const result = await search (titles[title]);
      if (!result.html()) {
        await deleteTextFromSearchField();
        continue;
      } else {
        await gotToSearchResult(result);
        await analyzeProjectPage();
      }
  }
})();