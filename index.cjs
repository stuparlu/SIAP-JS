const he = require("he");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer-extra");
const fs = require("fs");

const campaignSelector = "#react-campaign > section > div > div";
const videoDivSelector =
  "#react-project-header > div > div > div.grid-row.grid-row.mb5-lg.mb0-md.order1-md.order2-lg > div.grid-col-12.grid-col-8-lg > div.mx-4.mx-12-md.mx0-lg.relative.clip";
const videoSelector =
  "#react-project-header > div > div.grid-container.flex.flex-column > div.grid-row.grid-row.mb5-lg.mb0-md.order1-md.order2-lg > div.grid-col-12.grid-col-8-lg > div.mx-4.mx-12-md.mx0-lg.relative.clip > div > video";
const searchButtonSelector =
  "#global-header > section > section.section_global-nav-right.justify-end.order3.flex.grow1-md.pr3.pr4-sm.items-center.py2.basis50p-md > button";
const searchFieldSelector =
  "#global-header > section > div.animation-fade-in.animation-300.animation-easeOutQuart.w100p.t0.l0.absolute.z-guided-search-3.block > div > div > div.p0.flex.z-dropdown-3.relative.shadow-2.items-center > input";
const searchResultsSelector =
  "#global-header > section > div.animation-fade-in.animation-300.animation-easeOutQuart.w100p.t0.l0.absolute.z-guided-search-3.block > div > div > div.z-dropdown-3.scroll-y.relative.webkit-scrolling.bg-white > ul";
const videoButtonSelectorFailed =
  "#react-project-header > div > div > div.grid-row.grid-row.mb5-lg.mb0-md.order1-md.order2-lg > div.grid-col-12.grid-col-8-lg > div.mx-4.mx-12-md.mx0-lg.relative.clip > div > div.aspect-ratio--object.flex.z4 > button";
const videoButtonSelectorSuccess = 
  "#video_pitch > div.play_button_container.absolute-center.has_played_hide > button";
const videoTimeSelectorFailed =
  "#react-project-header > div > div.grid-container.flex.flex-column > div.grid-row.grid-row.mb5-lg.mb0-md.order1-md.order2-lg > div.grid-col-12.grid-col-8-lg > div.mx-4.mx-12-md.mx0-lg.relative.clip > div > div > div > div.flex.flex-auto.items-center.mx2 > time.white.type-14.ml2.basis5";
const videoTimeSelectorSuccess =
  "#video_pitch > div.player_controls.absolute-bottom.mb3.radius2px.white.bg-green-dark.forces-video-controls_hide.visible > div.right.full-height > time";
const videoSelectorSuccess = 
  "#video-section";
  const fundingUnsuccesfulSelector =
  "#react-project-header > div > div > div.grid-row.grid-row.mb5-lg.mb0-md.order1-md.order2-lg > div.grid-col-12.grid-col-4-md.hide.block-lg > div.border.p3.soft-black.border-grey-500.bg-grey-300 > div.normal.type-18"
const shortSleepInterval = 5000;
const mediumSleepInterval = 7000;
const longSleepInterval = 12000;

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function loadDataset() {
  let rawdata = fs.readFileSync("titles.json");
  let data = JSON.parse(rawdata);
  return data;
}

function saveDataset(projects) {
  let data = JSON.stringify(projects, null, 2);
  fs.writeFile("titles.json", data, (err) => {
    if (err) throw err;
    console.log("Data written to file");
  });
}

projects = loadDataset();

function extractCampaignText(campaignHTML) {
  var $ = cheerio.load(campaignHTML);

  $("body *").each(function () {
    const element = $(this);
    if (element.text().trim().length > 0) {
      element.after(" ");
    }
  });

  var allText = $.text();
  allText = allText.replace(/ {2,}/g, " ");
  return allText;
}

function extractCampaignMediaNumber(campaignHTML) {
  var $ = cheerio.load(campaignHTML);

  const numVideos = $("video").length;
  const numIframes = $("iframe").length;
  const numImages = $("img").length;
  const mediaNumber = numVideos + numIframes + numImages;

  return mediaNumber;
}

(async () => {
  const StealthPlugin = require("puppeteer-extra-plugin-stealth");
  puppeteer.use(StealthPlugin());
  const { executablePath } = require("puppeteer");

  async function searchForProject(searchTerm) {
    await Promise.all([await page.click(searchButtonSelector)]);

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

  async function getIntegerLengthOfVideo(stringLength) {
    const timeParts = stringLength.split(':');
    if (timeParts.length == 1) {
      return parseInt(timeParts[0]);
    } else if (timeParts.length == 2) {
      return 60 *  parseInt(timeParts[0]) + parseInt(timeParts[1]);
    } else {
      return 3600 * parseInt(timeParts[2]) + 60 * parseInt(timeParts[1]) + parseInt(timeParts[0]);
    }
  }

  async function gotToSearchResult(result) {
    $ = cheerio.load(result.parent().html());
    const imgSrc = $("img").attr("src");

    const linkElementHandle = await page.$(`img[src="${imgSrc}"]`);
    await linkElementHandle.click();
    await page.waitForNavigation();
    await sleep(longSleepInterval);
  }

  async function analyzeProjectPage(index) {
    const campaignElement = await page.$(campaignSelector);
    if (campaignElement == null) {
      projects.splice(index, 1);
      return;
    }
    const campaignHTML = await page.evaluate(
      (element) => element.innerHTML,
      campaignElement
    );

    var fundingFail = false;
    const fundingUnsuccesfulDiv = await page.$(fundingUnsuccesfulSelector);
    if (fundingUnsuccesfulDiv != null) {
      const fundingUnsuccesfulHTML = await page.evaluate(
        (element) => element.innerHTML,
        fundingUnsuccesfulDiv
      );

      decoded = he.decode(fundingUnsuccesfulHTML);
      var sel = cheerio.load(decoded);
      const result = sel(`div:contains("Funding Unsuccessful")`);
      fundingFail = result
    }

    var videoButtonSelector = ""
    var videoTimeSelector = ""
    if (fundingFail) {
      console.log("fail");

      videoButtonSelector = videoButtonSelectorFailed;
      videoTimeSelector = videoTimeSelectorFailed;
    } else {
      console.log("success");
      videoButtonSelector = videoButtonSelectorSuccess;
      videoTimeSelector = videoTimeSelectorSuccess;
    }


    let hasHeaderVideo = false;
    let videoLength = 0;

    const videoButton = await page.$(videoButtonSelector);
    if (videoButton) {
      await videoButton.click();

      await sleep(mediumSleepInterval);
      if (!fundingFail) {
        const element = await page.$(videoSelectorSuccess);
        const box = await element.boundingBox();
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        const mouse = page.mouse;
        await mouse.move(x, y);
      }
      const videoTimeElement = await page.$(videoTimeSelector);
      console.log(videoTimeElement);
      const videoLengthElementHTML = await page.evaluate(
        (element) => element.innerHTML,
          videoTimeElement
        );
      videoLength = await getIntegerLengthOfVideo(videoLengthElementHTML);
      hasHeaderVideo = true;
     }

    text = extractCampaignText(campaignHTML);
    mediaNumber = extractCampaignMediaNumber(campaignHTML);

    projects[index].processed = true;
    projects[index].hasHeaderVideo = videoButton ? true : false;
    projects[index].videoLength =  projects[index].hasHeaderVideo ? videoLength : 0;
    projects[index].descriptionMediaNumber = mediaNumber;
    projects[index].textLength = text.length;
    projects[index].textDescription = text;

    console.log(projects[index]);
  }

  async function deleteTextFromSearchField() {
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
  }

  async function search(project) {
    await searchForProject(project.title);
    await sleep(mediumSleepInterval);
    searchResult = await parseSearchResult();
    var $ = cheerio.load(searchResult);
    const result = $(`div:contains("${project.title}")`);
    return result;
  }

  const browser = await puppeteer.launch({
    headless: false,
    executablePath:'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    userDataDir:
      "C:\\Users\\Luka\\AppData\\Local\\BraveSoftware\\Brave-Browser\\puppetData",
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto("https://kickstarter.com/", { waitUntil: "load" });

  const fs = require("fs");

  for (let index in projects) {
    if (!projects[index].processed) {
      const result = await search(projects[index]);
      if (!result.html()) {
        await deleteTextFromSearchField();
        projects.splice(index, 1);
      } else {
        await gotToSearchResult(result);
        await analyzeProjectPage(index);
      }
      saveDataset(projects);
    }
  }
})();
