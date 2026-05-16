const axios = require('axios');

class CredibilityAdapter {
  constructor(opts = {}) {
    this.endpoint = process.env.NEWSGUARD_AI_ENDPOINT || opts.endpoint || 'https://newsguard-backend.onrender.com/predict';
    this.timeoutMs = opts.timeoutMs || 5000;
  }

  async scoreText(text) {
    if (!text || text.trim().length === 0) {
      return { score: 0.5, flagged: false, reason: 'no-content', source: 'none' };
    }

    try {
      const resp = await axios.post(this.endpoint, { text }, { timeout: this.timeoutMs });
      const data = resp.data || {};
      // Expecting { prediction: 'Fake'|'Real', confidence: { Fake: x, Real: y } }
      const pred = (data.prediction || '').toLowerCase();
      const conf = data.confidence || {};
      const fakeConf = conf.Fake || conf.fake || 0;
      const realConf = conf.Real || conf.real || 0;

      // Normalize to a 0..1 score where higher is more reliable
      let score = 0.5;
      if (pred === 'real' || pred === 'Real') {
        score = Math.min(0.95, 0.5 + (realConf / 200));
      } else if (pred === 'fake' || pred === 'Fake') {
        score = Math.max(0.05, 0.5 - (fakeConf / 200));
      } else if (realConf || fakeConf) {
        score = 0.5 + ((realConf - fakeConf) / 200);
      }

      const flagged = (pred === 'fake' && fakeConf > 60);
      return { score, flagged, reason: 'newsguard-ai', source: this.endpoint, raw: data };
    } catch (err) {
      console.warn('CredibilityAdapter: external API failed:', err.message);
      // Fallback neutral score
      return { score: 0.5, flagged: false, reason: 'api-error', source: this.endpoint };
    }
  }

  async scoreItem(item) {
    const text = (item.content || '') + '\n' + (item.title || '');
    return this.scoreText(text);
  }
}

module.exports = CredibilityAdapter;
