const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser();

const SOURCES = require('./sources.json');
const OUTPATH = path.join(__dirname, 'news.json');

function short(text, n = 140){
  if(!text) return '';
  return text.length > n ? text.slice(0,n).trim() + '…' : text;
}

(async function run(){
  try{
    const allItems = [];
    await Promise.all(SOURCES.feeds.map(async feed =>{
      try{
        const feedData = await parser.parseURL(feed.url);
        (feedData.items || []).forEach(item =>{
          allItems.push({
            title: item.title || '',
            link: item.link || item.guid || '',
            pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : (new Date()).toISOString(),
            source: feed.name,
            snippet: short(item.contentSnippet || item.content || item.summary || '')
          });
        });
      }catch(e){
        console.error('Failed to fetch feed', feed.url, e.message);
      }
    }));

    // sort by pubDate desc
    allItems.sort((a,b)=> new Date(b.pubDate) - new Date(a.pubDate));

    // dedupe by link
    const seen = new Set();
    const uniq = [];
    for(const it of allItems){
      if(it.link && seen.has(it.link)) continue;
      seen.add(it.link);
      uniq.push(it);
      if(uniq.length >= (SOURCES.maxItems || 7)) break;
    }

    const highlight = uniq.length ? (uniq[0].title + ' — ' + uniq[0].source) : 'No major new developments.';
    const bullets = uniq.map(it => ({text: it.title + (it.snippet ? ' — ' + it.snippet : ''), link: it.link, source: it.source}));

    const out = {
      generatedAt: new Date().toISOString(),
      timezone: 'Europe/Athens',
      highlight,
      bullets,
      rawCount: allItems.length
    };

    fs.writeFileSync(OUTPATH, JSON.stringify(out, null, 2));
    console.log('Wrote', OUTPATH);
  }catch(err){
    console.error('Fetcher failed', err);
    process.exitCode = 1;
  }
})();
