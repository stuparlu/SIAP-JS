const he = require("he");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer-extra");
const fs = require("fs");
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


(async () => {

projects = loadDataset();
// projects = projects.slice(0, 15000);
// console.log(projects.length);

// saveDataset(projects);
processed = 0
for (let index in projects) {
     if (projects[index].processed) {
         processed++;
     }
 }
 console.log(processed);
})();
