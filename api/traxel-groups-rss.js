import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const pageUrl = "https://www.mytraxel.com/forum";

    const html = await fetch(pageUrl).then(r => r.text());
    const $ = cheerio.load(html);

    const items = [];

    $("a").each((i, el) => {
      const title = $(el).text().trim();
      const link = $(el).attr("href");

      if (title && link && link.includes("/post/")) {
        items.push({
          title,
          link: link.startsWith("http")
            ? link
            : `https://www.mytraxel.com${link}`,
          date: new Date().toUTCString(),
          description: title
        });
      }
    });

    let rss =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss version="2.0"><channel>\n` +
      `<title>TraXel – Groups RSS</title>\n` +
      `<link>${pageUrl}</link>\n` +
      `<description>Auto-generated RSS feed for TraXel groups</description>\n`;

    items.forEach(item => {
      rss += `
        <item>
          <title><![CDATA[${item.title}]]></title>
          <link>${item.link}</link>
          <pubDate>${item.date}</pubDate>
          <description><![CDATA[${item.description}]]></description>
        </item>
      `;
    });

    rss += `</channel></rss>`;

    res.setHeader("Content-Type", "application/rss+xml");
    res.status(200).send(rss);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
