const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios').default;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  ipcMain.handle('linkedInLogin', async (event, email, password) => {});
  ipcMain.on('login', async (event, email, password) => {
    const user_email = email;
    const user_password = password;

    let li_at = '';
    let JSESSIONID = '';
    let name = '';
    let tagline = '';
    let hashtags = '';
    let about = '';

    win.webContents.send('loggedIn', 'Auto logging in...');

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    console.log('launched');

    await page.goto('https://www.linkedin.com/login');

    // Set screen size
    await page.setViewport({ width: 900, height: 900 });

    await page.type('#username', user_email);
    await page.type('#password', user_password);

    await page.click('.btn__primary--large');

    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });

    if (page.url() === 'https://www.linkedin.com/feed/') {
      console.log('Logged in successfully!');
      win.webContents.send('loggedIn');

      const cookie = await page.cookies();

      for (let c of cookie) {
        if (c['name'] === 'li_at') {
          li_at = c['value'];
        }

        if (c['name'] === 'JSESSIONID') {
          JSESSIONID = c['value'];
        }
      }

      await page.waitForSelector('.ember-view');

      const atag = await page.$$eval('.ember-view', (el) => el.map((a) => a.href));

      let profileLink = '';

      for (const a of atag) {
        if (a && a.includes('https://www.linkedin.com/in/')) {
          profileLink = a;
          break;
        }
      }

      console.log(profileLink);

      await page.goto(profileLink);

      const username = 'h1.text-heading-xlarge.inline.t-24.v-align-middle.break-words';
      const taglineSelector = 'div.text-body-medium.break-words';
      const hashtagSelector = 'div.text-body-small.t-black--light.break-words.mt2';
      const aboutSelector =
        'div.inline-show-more-text.inline-show-more-text--is-collapsed.inline-show-more-text--is-collapsed-with-line-clamp.full-width';

      const aboutBlockSelector = `section.artdeco-card.ember-view.relative.break-words.pb3.mt2`;
      const blockSelector = `section.artdeco-card.ember-view.relative.break-words.pb3.mt2`;
      await page.waitForSelector(username);

      name = await page.$eval(username, (el) => el.innerText);
      tagline = await page.$eval(taglineSelector, (el) => el.innerText);

      console.log(name, tagline);

      await page.waitForSelector(hashtagSelector);
      const hashtagElems = await page.$$(hashtagSelector);
      hashtags = await Promise.all(
        hashtagElems.map(async (elem) => {
          return await elem.$eval('span', (el) => el.innerText);
        })
      );

      hashtags = hashtags.map((item) => item.replace(/#/g, ''));

      await page.waitForSelector(blockSelector);
      const aboutElems = await page.$$(blockSelector);
      const aboutSector = await Promise.all(
        await aboutElems.map(async (elem) => {
          const aboutBlock = await elem.$eval('span', (el) => el.innerText);

          if (aboutBlock === 'About') {
            const aboutEl = await elem.$$(aboutSelector);
            return await Promise.all(aboutEl.map(async (el) => await el.$eval('span', (el) => el.innerText)));
          } else {
            return null;
          }
        })
      );

      about = aboutSector.filter((item) => item !== null);
      about = about[0];
    } else {
      await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      });

      const currentUrl = page.url();
      if (currentUrl.includes('https://www.linkedin.com/checkpoint/challenge/')) {
        console.log('Please solve the Captcha and press Enter to continue...');

        let captchaSolved = false;

        while (!captchaSolved) {
          await new Promise((resolve) => {
            setTimeout(resolve, 3000);
          });
          console.log('waiting for solving the Captcha...');

          if (page.url() === 'https://www.linkedin.com/feed/') {
            captchaSolved = true;
          }
        }

        if (page.url() === 'https://www.linkedin.com/feed/') {
          console.log('Logged in successfully!');
          win.webContents.send('loggedIn');

          const cookie = await page.cookies();

          for (let c of cookie) {
            if (c['name'] === 'li_at') {
              li_at = c['value'];
            }

            if (c['name'] === 'JSESSIONID') {
              JSESSIONID = c['value'];
            }
          }

          await page.waitForSelector('.ember-view');

          const atag = await page.$$eval('.ember-view', (el) => el.map((a) => a.href));

          let profileLink = '';

          for (const a of atag) {
            if (a && a.includes('https://www.linkedin.com/in/')) {
              profileLink = a;
              break;
            }
          }

          console.log(profileLink);

          await page.goto(profileLink);

          const username = 'h1.text-heading-xlarge.inline.t-24.v-align-middle.break-words';
          const taglineSelector = 'div.text-body-medium.break-words';
          const hashtagSelector = 'div.text-body-small.t-black--light.break-words.mt2';
          const aboutSelector =
            'div.inline-show-more-text.inline-show-more-text--is-collapsed.inline-show-more-text--is-collapsed-with-line-clamp.full-width';

          const aboutBlockSelector = `section.artdeco-card.ember-view.relative.break-words.pb3.mt2`;

          await page.waitForSelector(username);

          name = await page.$eval(username, (el) => el.innerText);
          tagline = await page.$eval(taglineSelector, (el) => el.innerText);

          await page.waitForSelector(hashtagSelector);
          const hashtagElems = await page.$$(hashtagSelector);
          hashtags = await Promise.all(
            hashtagElems.map(async (elem) => {
              return await elem.$eval('span', (el) => el.innerText);
            })
          );

          hashtags = hashtags.map((item) => item.replace(/#/g, ''));

          await page.waitForSelector(aboutBlockSelector);
          const aboutElems = await page.$$(aboutBlockSelector);
          const aboutSector = await Promise.all(
            await aboutElems.map(async (elem) => {
              const aboutBlock = await elem.$eval('span', (el) => el.innerText);

              if (aboutBlock === 'About') {
                const aboutEl = await elem.$$(aboutSelector);
                return await Promise.all(aboutEl.map(async (el) => await el.$eval('span', (el) => el.innerText)));
              } else {
                return null;
              }
            })
          );

          about = aboutSector.filter((item) => item !== null);
          about = about[0];
        } else {
          console.log('Login failed.');
        }
      } else {
        console.log('Login failed.');
      }
    }

    console.log(li_at, JSESSIONID);
    console.log(hashtags);

    const toneMannerPromptSource = {
      name,
      tagline,
      about: about[0],
      hashtags: hashtags[0],
    };

    const prompt = `1. Based on the information provided below, create a persona of ${name} and define the tone and manner that fits the persona for the Linkedin content, comments, and direct messages:

    Name: ${name}

    Passion: ${tagline}

    About ${name}: ${about[0]}

    The list of ${name}'s main interest: ${hashtags[0]}

    2. Follow the structure written below when you create an output:

    a. Persona:
    b. Tone and Manner:
    c. LinkedIn Content:
    d. Comments:
    e. Direct Messages:
    `;

    const toneMannerUrl = 'https://jaetw7z5ghvnfwuqdmzfzathju0mmmof.lambda-url.ap-northeast-2.on.aws/';

    console.log('get tone and manner');
    win.webContents.send('loginResponse', 'Getting Tone and Manner...');
    const { data } = await axios.post(toneMannerUrl, { prompt });

    win.webContents.send('loginResponse', `Tone and Manner:\n${data.response}`);
    console.log('done');

    const serverUrl = `http://15.164.215.55/auth/${user_email}`;

    console.log('send cookie and prompt');
    axios.post(serverUrl, {
      UserData: {
        li_at: li_at,
        JSESSIONID: JSESSIONID,
        persona: prompt,
      },
    });
    console.log('done');

    await browser.close();

    let currentUser = '';
    let previousMessage = 0;
    let latestMessage = {
      reply: '',
      timestamp: 0,
    };

    while (true) {
      await new Promise((resolve) => {
        setTimeout(resolve, 4000);
      });

      const dynamoUrl = 'https://lalhqi4pid5l56urpduvdbz4ae0qdaur.lambda-url.ap-northeast-2.on.aws/';

      const { data: dynamoData } = await axios.get(dynamoUrl);

      if (currentUser === '') {
        for (let item of dynamoData) {
          if (item.pk.S === 'user') {
            if (item.sk.S === user_email) {
              currentUser = item.attributes.N;
              break;
            }
          }
        }
      }

      const items = dynamoData.filter((item) => {
        if (item.pk.S === 'message') {
          const [id, timestamp] = item.sk.S.split(':');

          return id === currentUser;
        }

        return false;
      });

      for (let item of items) {
        const [id, timestamp] = item.sk.S.split(':');

        if (timestamp > latestMessage.timestamp) {
          if (item.reply) {
            latestMessage.reply = item.reply.S;
            latestMessage.timestamp = timestamp;
          } else {
            win.webContents.send('message');
          }
        }
      }

      console.log(previousMessage, latestMessage.timestamp);
      if (previousMessage !== latestMessage.timestamp) {
        previousMessage = latestMessage.timestamp;

        await new Promise((resolve) => {
          setTimeout(resolve, 3000);
        });

        win.webContents.send('message', latestMessage.reply);
      }
    }
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
