const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

//pinging server
const https = require("https");
setInterval(function () {
  console.log("ping");

  https.get("https://banana-crisp-70788.herokuapp.com/");
}, 30000); // every 5 minutes (300000)
//


// discord var
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const browserObject = require('./browser');
require('dotenv').config();
//

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))


// discord bot code
let floorPrice = 0;
let browserInstance = browserObject.startBrowser();
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
})
//
setInterval(async () => {
  const guildsID = client.guilds.cache.map(guild => guild.id);
  console.log(guildsID);
  const guild = await client.guilds.fetch(guildsID[0]);
  if (!isNaN(floorPrice)) {
    guild.me.setNickname(`FP: ${floorPrice} ONE`);
  }

  client.user.setActivity(`Puff Floor`, { type: "WATCHING" });
  scrapeAll(browserInstance);

}, 60000)

async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    await scraperObject.scraper(browser);

  }
  catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}
//
const scraperObject = {
  url: "https://nftkey.app/collections/puffs/",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    await page.waitForSelector('.css-rb6vmx', { setTimeout: 100000 });
    await new Promise(r => setTimeout(r, 10000));

    let urls = await page.$$eval('.css-19fmtb6', texts => {
      texts = texts.map(text => text.textContent);
      return texts;
    });
    let fp = urls[5].split(" ")[0];
    floorPrice = parseInt(fp);
    console.log(floorPrice);

  }
}



client.login(process.env.DISCORD_TOKEN);


