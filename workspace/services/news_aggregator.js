const Parser = require('rss-parser');
const parser = new Parser();

class NewsAggregator {
  constructor(sources) {
    this.sources = sources.feeds || [];
    this.maxItems = sources.maxItems || 20;
  }

  async fetchAll() {
    const allItems = [];
    await Promise.all(this.sources.map(async (feed) => {
      try {
        const feedData = await parser.parseURL(feed.url);
        (feedData.items || []).forEach((item) => {
          allItems.push({
            title: item.title || '',
            link: item.link || item.guid || '',
            pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : (new Date()).toISOString(),
            source: feed.name,
            content: item.contentSnippet || item.content || item.summary || ''
          });
        });
      } catch (e) {
        console.error(`Failed to fetch feed ${feed.name} (${feed.url}):`, e.message);
      }
    }));

    return this.normalize(allItems);
  }

  normalize(items) {
    // Sort by pubDate desc
    items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Deduplicate by link or title
    const seenLinks = new Set();
    const seenTitles = new Set();
    const unique = [];

    for (const item of items) {
      const titleLower = item.title.toLowerCase().trim();
      if (item.link && seenLinks.has(item.link)) continue;
      if (titleLower && seenTitles.has(titleLower)) continue;

      if (item.link) seenLinks.add(item.link);
      if (titleLower) seenTitles.add(titleLower);

      unique.push(item);
      if (unique.length >= this.maxItems) break;
    }

    return unique;
  }
}

module.exports = NewsAggregator;
