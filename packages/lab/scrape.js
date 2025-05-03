const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function extractLegalText() {
  const url = 'https://njt.hu/jogszabaly/2012-1-00-00';
  const outputFile = '2012年劳动法.txt';

  try {
    // 启动 Puppeteer，自动下载 Chromium
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // 指定缓存路径（可选）
      userDataDir: './puppeteer_cache'
    });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await page.waitForSelector('div.jogszabaly', { timeout: 10000 }).catch(() => {
      console.warn('未找到 div.jogszabaly，尝试 body');
    });

    const text = await page.evaluate(() => {
      const element = document.querySelector('div.jogszabaly') || document.querySelector('body');
      return element ? element.innerText.trim() : '';
    });

    if (!text) throw new Error('无法提取正文内容');

    const cleanedText = text
      .replace(/\n\s*\n+/g, '\n')
      .replace(/\s{2,}/g, ' ')
      .replace(/(\d+\.\s*§)/g, '\n$1');

    await fs.writeFile(outputFile, cleanedText, { encoding: 'utf8' });
    console.log(`法律文本已保存到 ${outputFile}`);

    await browser.close();
  } catch (error) {
    console.error('提取失败:', error.message);
    process.exit(1);
  }
}

extractLegalText();