# Greece News Dashboard - Daily Briefing Cron

To enable daily delivery at 09:00 Europe/Athens, add the following cron job to your OpenClaw Gateway configuration.

## Cron Manifest (cron.add)

```json
{
  "schedule": "0 9 * * *",
  "timezone": "Europe/Athens",
  "command": "node /home/ubuntu/.openclaw/workspace/workspace/services/scheduler.js --once --deliver",
  "label": "Daily News Briefing",
  "id": "greece-news-briefing"
}
```

## Manual Deployment

1. Install dependencies: `cd workspace && npm install`
2. Run once to verify: `npm run deliver`
3. Run persistent scheduler (alternative to Gateway cron): `pm2 start workspace/services/scheduler.js --name news-scheduler`

## Recent Changes

- Added `services/news_aggregator.js` for robust RSS fetching and deduplication.
- Added `services/brief_generator.js` for smart briefing generation (with fallback).
- Added `services/scheduler.js` for automated runs and delivery.
- Integrated `node-cron` for scheduling.
- Added smoke tests in `tests/smoke.js`.
