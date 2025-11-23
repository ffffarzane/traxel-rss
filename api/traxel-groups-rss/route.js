import * as cheerio from "cheerio";

export default async function GET(request) {
  try {
    const pageUrl = "https://www.mytraxel.com/forum";

    const html = await fetch(pageUrl).then((r) => r.text());
    const $ = cheerio.load(html);

    const items = [];

    $("a").each((i, el) => {
      const title = $(el).text().trim();
      const link = $(el).attr("href");

      if (title && link && link.includes("/post")) {
        items.push({
          title,
          link: link.startsWith("http")
            ? link
            : `https://www.mytraxel.com${link}`,
          date: new Date().toUTCString(),
          description: title,
        });
      }
    });

    let rss =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss version="2.0">\n<channel>\n` +
      `<title>TraXel – Groups RSS</title>\n` +
      `<link>${pageUrl}</link>\n` +
      `<description>TraXel Community Groups Feed</description>\n`;

    items.forEach((item) => {
      rss += `
      <item>
        <title><![CDATA[${item.title}]]></title>
        <link>${item.link}</link>
        <guid>${item.link}</guid>
        <pubDate>${item.date}</pubDate>
        <description><![CDATA[${item.description}]]></description>
      </item>\n`;
    });

    rss += `</channel>\n</rss>`;

    return new Response(rss, {
      headers: { "Content-Type": "application/xml" },
    });

  } catch (err) {
    return new Response("Error generating RSS: " + err.message);
  }
}
