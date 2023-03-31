const he = require("he");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer-extra");
const fs = require("fs");
function loadDataset1() {
  let rawdata = fs.readFileSync("titles1.json");
  let data = JSON.parse(rawdata);
  return data;
}
function loadDataset2() {
    let rawdata = fs.readFileSync("titles2.json");
    let data = JSON.parse(rawdata);
    return data;
  }

function saveDataset(projects) {
  let data = JSON.stringify(projects, null, 2);
  fs.writeFile("titles-saved.json", data, (err) => {
    if (err) throw err;
    console.log("Data written to file");
  });
}


(async () => {

projects1 = loadDataset1();
projects2 = loadDataset2();
projects = projects1.concat(projects2);
saveDataset(projects);

//  projects = projects.slice(15000, 30000);
//  console.log(projects.length);

//  saveDataset(projects);
// processed = 0;
// for (let index in projects) {
//     if (projects[index].processed) {
//         processed++;
//     }
// }
// console.log(processed);
})();
