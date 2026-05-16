const NewsAggregator = require('../services/news_aggregator');
const BriefGenerator = require('../services/brief_generator');

async function testAggregator() {
  console.log('Testing Aggregator...');
  const sources = {
    feeds: [
      { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml' }
    ],
    maxItems: 3
  };
  const aggregator = new NewsAggregator(sources);
  const items = await aggregator.fetchAll();
  console.log(`Fetched ${items.length} items.`);
  if (items.length > 0) {
    console.log('Sample item:', items[0].title);
    return true;
  }
  return false;
}

async function testGenerator() {
  console.log('Testing Generator...');
  const generator = new BriefGenerator();
  const mockItems = [
    { title: 'Test News 1', source: 'Source A', content: 'Something happened', link: 'http://example.com/1' },
    { title: 'Test News 2', source: 'Source B', content: 'Something else', link: 'http://example.com/2' }
  ];
  const brief = await generator.generateBrief(mockItems);
  console.log('Generated brief length:', brief.length);
  if (brief.includes('Test News 1') && brief.includes('Europe/Athens')) {
    return true;
  }
  return false;
}

(async () => {
  try {
    const aggOk = await testAggregator();
    const genOk = await testGenerator();
    if (aggOk && genOk) {
      console.log('All smoke tests passed!');
      process.exit(0);
    } else {
      console.error('Some tests failed.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
})();
