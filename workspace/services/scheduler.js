const cron = require('node-cron');
const NewsAggregator = require('./news_aggregator');
const BriefGenerator = require('./brief_generator');
const SOURCES = require('../sources.json');
const fs = require('fs');
const path = require('path');

// To send messages, we'll use the 'openclaw message' command or a webhook if available.
// The instructions specify the chat_id: telegram:8469761149.
const TARGET_CHAT = 'telegram:8469761149';

class NewsScheduler {
  constructor() {
    this.aggregator = new NewsAggregator(SOURCES);
    this.generator = new BriefGenerator();
  }

  async runOnce() {
    console.log(`[${new Date().toISOString()}] Running news aggregation and brief generation...`);
    const items = await this.aggregator.fetchAll();
    const brief = await this.generator.generateBrief(items);
    
    // Save to news.json for the dashboard
    const out = {
      generatedAt: new Date().toISOString(),
      timezone: 'Europe/Athens',
      brief: brief,
      rawCount: items.length
    };
    fs.writeFileSync(path.join(__dirname, '../news.json'), JSON.stringify(out, null, 2));
    
    return brief;
  }

  async deliverBrief(brief) {
    console.log(`[${new Date().toISOString()}] Delivering brief to ${TARGET_CHAT}...`);
    // Use OpenClaw CLI to send the message if available, or log it.
    // The requirement says "deliver the daily 09:00 briefing to the Telegram chat".
    // I will use exec to call 'openclaw message' if it exists.
    try {
       const { execSync } = require('child_process');
       // Example: openclaw message send --to telegram:8469761149 --text "..."
       // We'll escape the brief text.
       const escapedBrief = brief.replace(/"/g, '\\"');
       execSync(`openclaw message send --to "${TARGET_CHAT}" --text "${escapedBrief}"`);
       console.log('Message delivered via OpenClaw CLI.');
    } catch (err) {
       console.error('Failed to deliver message via OpenClaw CLI:', err.message);
       // Fallback: log to a file that a external watcher might pick up or just for debugging
       fs.appendFileSync(path.join(__dirname, '../delivery.log'), `[${new Date().toISOString()}] FAILED DELIVERY: ${err.message}\n`);
    }
  }

  scheduleDaily() {
    // 09:00 Europe/Athens
    // node-cron uses server time. We should ensure the server is in the right TZ or offset.
    // Alternatively, many cron libs support TZ.
    cron.schedule('0 9 * * *', async () => {
      const brief = await this.runOnce();
      await this.deliverBrief(brief);
    }, {
      scheduled: true,
      timezone: "Europe/Athens"
    });
    console.log('Scheduled daily briefing at 09:00 Europe/Athens');
  }
}

if (require.main === module) {
  const scheduler = new NewsScheduler();
  if (process.argv.includes('--once')) {
    scheduler.runOnce().then(brief => {
        console.log('--- GENERATED BRIEF ---');
        console.log(brief);
        if (process.argv.includes('--deliver')) {
            scheduler.deliverBrief(brief);
        }
    });
  } else {
    scheduler.scheduleDaily();
  }
}

module.exports = NewsScheduler;
