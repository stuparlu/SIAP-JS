



(async () => {
    const puppeteer = require('puppeteer-extra') 
    const StealthPlugin = require('puppeteer-extra-plugin-stealth') 
    puppeteer.use(StealthPlugin()) 
    const {executablePath} = require('puppeteer') 



    const browser = await puppeteer.launch({
        headless:false,
        executablePath: executablePath(),
        // executablePath: executablePath('C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
        userDataDir: 'C:\\Users\\Luka\\AppData\\Local\\BraveSoftware\\Brave-Browser\\puppetData'
    });
    const page = await browser.newPage();


    await page.goto('https://kickstarter.com/', {waitUntil: 'load'});


    await page.setViewport({width: 1920, height: 1080});
})();