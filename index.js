const express = require('express')
const path = require('path')
const axios = require('axios');
const PORT = process.env.PORT || 53134
const https = require("https");


const redirectUrl = "https://banana-crisp-70788.herokuapp.com/";


// discord var
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const browserObject = require('./browser');
require('dotenv').config();
//

//global variable
let floorPrice = 0;
//

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', async ({ query }, response) => {
    const { code } = query;
    // console.log(`The access code is: ${code}`);
    if (code) {
      try {
        const oauthResult = await axios('https://discord.com/api/oauth2/token', {
          method: 'POST',
          url: 'https://discord.com/api/oauth2/token',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          data: new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            // redirect_uri: `http://localhost:53134`,
            redirect_uri: redirectUrl,

            scope: 'bot guild',
          }).toString(),
        });
        const oauthData = oauthResult.data;
        console.log(oauthResult.data);
        const userResult = await axios('https://discord.com/api/users/@me', {
          headers: {
            authorization: `${oauthData.token_type} ${oauthData.access_token}`,
          },
        });

        console.log(userResult.data);

        handleRefreshToken(oauthData.refresh_token);

      } catch (e) {
        console.log(e);
        console.log("ADA DI ERROR");
      }
    }
    return response.render('pages/index');
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))




client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  runScrap();
})

// handle refresh token
function handleRefreshToken(refreshToken) {
  if (refreshToken) {
    try {
      setInterval(async () => {
        const oauthResult = await axios('https://discord.com/api/oauth2/token', {
          method: 'POST',
          url: 'https://discord.com/api/oauth2/token',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          data: new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'refresh_token',
          }).toString(),
        });
        console.log(oauthResult.data);

      }, 3 * 60 * 1000);
    }
    catch (e) {
      console.log("error refresh token:", e);
    }
  }
}

async function runScrap() {
  console.log("pinging :", redirectUrl);
  https.get(redirectUrl);
  try {
    //open browser
    let browserInstance = browserObject.startBrowser();
    scrapeAll(browserInstance);


    //handle discord nickname
    const guildsID = client.guilds.cache.map(guild => guild.id);
    const guild = await client.guilds.fetch(guildsID[0]);
    if (!isNaN(floorPrice)) {
      guild.me.setNickname(`FP: ${floorPrice} ONE`);
    }
    client.user.setActivity(`Puff Floor`, { type: "WATCHING" });

  }
  catch (e) {
    console.log("ERROR:", e)
  }
}




async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    await scraperObject.scraper(browser);
    await browser.close();
    console.log("Browser Closed");
    // await new Promise(r => setTimeout(r, 1 * 60 * 1000));
    // runScrap();

  }
  catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}

const scraperObject = {
  url: "https://nftkey.app/collections/puffs/",
  async scraper(browser) {
    let page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    await page.waitForSelector('.css-rb6vmx', { setTimeout: 100000 });
    await new Promise(r => setTimeout(r, 20000));

    let urls = await page.$$eval('.css-19fmtb6', texts => {
      texts = texts.map(text => text.textContent);
      return texts;
    });
    console.log("URLS:", urls);
    let fp = urls[5].split(" ")[0];
    floorPrice = parseInt(fp);
    console.log(floorPrice);
    // page.close();

  }
}

client.login(process.env.DISCORD_TOKEN);


