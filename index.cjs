const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function loadDataset() {
  const fs = require("fs");
  let rawdata = fs.readFileSync("titles.json");
  let data = JSON.parse(rawdata).data;
  return data;
}

(async () => {
  const he = require("he");
  const { JSDOM } = require('jsdom');
  const cheerio = require('cheerio');
  const puppeteer = require("puppeteer-extra");
  const StealthPlugin = require("puppeteer-extra-plugin-stealth");
  puppeteer.use(StealthPlugin());
  const { executablePath } = require("puppeteer");

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
    await Promise.all([
     await page.click(
        "#global-header > section > section.section_global-nav-right.justify-end.order3.flex.grow1-md.pr3.pr4-sm.items-center.py2.basis50p-md > button"
      ),
    ]);
    await page.focus(
      "#global-header > section > div.animation-fade-in.animation-300.animation-easeOutQuart.w100p.t0.l0.absolute.z-guided-search-3.block > div > div > div.p0.flex.z-dropdown-3.relative.shadow-2.items-center > input"
    );
    await page.keyboard.type(titles[0]);

    await sleep(3000);

    const pageElement = await page.$(
      "#global-header > section > div.animation-fade-in.animation-300.animation-easeOutQuart.w100p.t0.l0.absolute.z-guided-search-3.block > div > div > div.z-dropdown-3.scroll-y.relative.webkit-scrolling.bg-white > ul"
    );
    const innerHTML = await page.evaluate(
      (element) => element.innerHTML,
      pageElement
    );
    decoded = he.decode(innerHTML);

     console.log(decoded);
     console.log("----------")

    var $ = cheerio.load(decoded);
    const result = $(`div:contains("${titles[0]}")`);
    $ = cheerio.load(result.parent().html());
    const imgSrc = $('img').attr('src');
    console.log(imgSrc);

    const linkElementHandle = await page.$(`img[src="${imgSrc}"]`);
    await linkElementHandle.click();
    await page.waitForNavigation();



    // indexed = decoded.indexOf(titles[0]);
    // if (indexed !== -1) {
    //   console.log(indexed);
    // }
})();
