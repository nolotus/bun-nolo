import { chromium, Page } from "playwright";
import * as fs from "fs/promises";
import * as path from "path";
import { JSDOM } from "jsdom";

async function scrapeChannelInfo(channelHandle: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const browser = await chromium.launch({
      headless: false,
      proxy: { server: "http://127.0.0.1:6152" },
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const channelUrl = `https://www.youtube.com/${channelHandle}/about`;
      console.log(`Attempt ${attempt}: Navigating to: ${channelUrl}`);

      await page.goto(channelUrl, { waitUntil: "networkidle", timeout: 60000 });

      console.log("Page loaded, waiting for content...");
      await page.waitForSelector("#content", {
        state: "attached",
        timeout: 30000,
      });

      console.log("Content loaded, extracting data...");
      const data = await extractChannelInfo(page, channelHandle);

      console.log("Data successfully scraped");
      await browser.close();
      return data;
    } catch (error) {
      console.error(`An error occurred during attempt ${attempt}:`);
      console.error(error);

      await page.screenshot({ path: `error-screenshot-${attempt}.png` });

      await browser.close();

      if (attempt === maxRetries) {
        console.error("Max retries reached. Unable to scrape data.");
        return null;
      }

      const delay = Math.floor(Math.random() * 2000) + 1000;
      console.log(`Waiting ${delay}ms before next attempt...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function extractChannelInfo(page: Page, channelHandle: string) {
  // 获取完整的 HTML
  let html = await page.content();

  // 使用 JSDOM 解析 HTML
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // 移除所有的 SVG 元素
  document.querySelectorAll("svg").forEach((svg) => svg.remove());

  // 移除所有的 style 标签
  document.querySelectorAll("style").forEach((style) => style.remove());

  // 获取处理后的 HTML
  html = dom.serialize();

  // 保存到文件
  const filename = `${channelHandle.replace("@", "")}_page.html`;
  await fs.writeFile(path.join(__dirname, filename), html);
  console.log(`Processed HTML has been written to ${filename}`);

  return await page.evaluate(() => {
    const description =
      document.querySelector("#description-container")?.textContent?.trim() ||
      "N/A";

    const socialLinks = {
      instagram: "N/A",
      tiktok: "N/A",
      twitter: "N/A",
    };

    const linkElements = document.querySelectorAll(
      "#link-list-container .yt-channel-external-link-view-model-wiz",
    );
    linkElements.forEach((element) => {
      const title = element
        .querySelector(".yt-channel-external-link-view-model-wiz__title")
        ?.textContent?.trim()
        .toLowerCase();
      const link = element
        .querySelector(".yt-channel-external-link-view-model-wiz__link a")
        ?.textContent?.trim();

      if (title && link) {
        if (title === "ig" || title.includes("instagram")) {
          socialLinks.instagram = link;
        } else if (title.includes("tiktok")) {
          socialLinks.tiktok = link;
        } else if (title.includes("twitter")) {
          socialLinks.twitter = link;
        }
      }
    });

    const emailMatch = description.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : "N/A";

    const channelName =
      document.querySelector("#channel-name")?.textContent?.trim() || "N/A";
    const channelHandle =
      document.querySelector("#channel-handle")?.textContent?.trim() || "N/A";
    const subscribersText =
      document.querySelector("#subscriber-count")?.textContent?.trim() || "N/A";
    const subscribers = subscribersText.split(" ")[0];
    const videoCountText =
      document.querySelector("#videos-count")?.textContent?.trim() || "N/A";
    const videoCount = videoCountText.split(" ")[0];

    const detailsText = document.body.innerText;
    const joinedDate = detailsText.match(/加入日期：(.+?)(\n|$)/)?.[1] || "N/A";
    const totalViews = detailsText.match(/觀看次數：(.+?)次/)?.[1] || "N/A";
    const country = detailsText.match(/國家\/地區：(.+?)(\n|$)/)?.[1] || "N/A";

    const latestVideos = Array.from(document.querySelectorAll("#video-title"))
      .slice(0, 5)
      .map((video) => ({
        title: video.textContent?.trim() || "N/A",
        url: (video as HTMLAnchorElement).href || "N/A",
      }));

    return {
      channelName,
      channelHandle,
      channelUrl: window.location.href.replace("/about", ""),
      subscribers,
      videoCount,
      description,
      email,
      socialLinks,
      joinedDate,
      totalViews,
      country,
      latestVideos,
    };
  });
}

// 使用示例
(async () => {
  const channelHandle = "@tammyyin";
  const result = await scrapeChannelInfo(channelHandle);
  if (result) {
    console.log("Scraped data:", JSON.stringify(result, null, 2));
  } else {
    console.log("Failed to scrape channel information.");
  }
})();
