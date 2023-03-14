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

  
    // htmls = '<li><h3 class="mt1 mb1 navy-600 type-14 normal ml4">Projects</h3></li><li class=""><button tabindex="0" role="link" class="w100p type-18 text-left pointer pt2 pb2 pl4 pr4 flex"><img class="mr2 self-start w20 shrink0 radius2px" src="https://ksr-ugc.imgix.net/assets/012/215/713/d4f56d166cba8ae2dba02a4b6f32f03d_original.png?ixlib=rb-4.0.2&crop=faces&w=272&h=153&fit=crop&v=1463742962&auto=format&frame=1&q=92&s=6d0708eee35d7e7a345639a9367082b4" role="presentation" data-airgap-id="172"><div class="flex flex-column"><div class="type-16 dark-grey-500 medium mb3px">The Songs of Adelaide & Abullah</div><div class="type-12 soft-black mb3px hide block-sm block-md block-lg">by Michael Golden</div><div class="type-12"><div class="soft-black inline-block mr1">Unsuccessful on October 9, 2015</div></div></div></button></li>';
    // var $ = cheerio.load(htmls);
    // const result = $(`div:contains("${titles[0]}")`);
    // $ = cheerio.load(result.parent().html());
    // const imgSrc = $('img').attr('src');
    // console.log(imgSrc);


    // indexed = decoded.indexOf(titles[0]);
    // if (indexed !== -1) {
    //   console.log(indexed);
    // }

    // htmls = '<div class="max-w113 m-auto"><div><div><div><div id="story" class="mb3"><h3 class="normal mb3 mb7-sm mobile-hide">Story</h3></div><div class="rte__content"><div>R</div></div></div></div></div><div><div><div class="pt8"><div id="risks-and-challenges" class="mb3 mb10-sm mb3 js-risks"><div class="mobile-show py3"></div><h3 class="normal mb4">Risks and challenges</h3><p class="js-risks-text text-preline">No risk. Money will be re-paid as per schedule in the event of no sale of books. Poems are already written</p><a target="_blank" class="ksr-green-700 bold type-16" href="/help/hc/sections/115001107133">Learn about accountability on Kickstarter</a></div></div></div></div><div class="border-bottom mb4 mb9-md"><div class="mb9 type-16"><span>Questions about this project? </span><a href="/projects/753774991/the-songs-of-adelaide-and-abullah/faqs" class="bold link-blue type-16"><span>Check out the FAQ</span></a></div></div><div id="report-this-project"><a class="bttn keyboard-focusable bttn-medium bttn-secondary theme--support fill-bttn-icon hover-fill-bttn-icon" href="/login?then=%2Fprojects%2F753774991%2Fthe-songs-of-adelaide-and-abullah#report-this-project" id="report-this-project-button">Report this project to Kickstarter</a></div></div>'
    // var $ = cheerio.load(htmls);

    // $('body *').each(function() {
    //   const element = $(this);
    //   if (element.text().trim().length > 0) {
    //     element.after(' ');
    //   }
    // });
    
    // // console.log($.html());
    // const allText = $.text();
    // console.log(allText);

    titles = ["baba", "deda", "stric"];
    for (let title in titles) {
      console.log(titles[title])
    }

  })();
