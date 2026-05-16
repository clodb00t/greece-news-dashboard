const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const CredibilityAdapter = require('./credibility_adapter');

class BriefGenerator {
  constructor() {
    this.timezone = 'Europe/Athens';
    this.cred = new CredibilityAdapter();
  }

  async generateBrief(items) {
    if (!items || items.length === 0) {
      return this.formatFallback('No news items found.');
    }

    // Score items for credibility (non-blocking but awaited)
    const scored = await Promise.all(items.map(async (it) => {
      try {
        const c = await this.cred.scoreItem(it);
        return Object.assign({}, it, { credibility: c });
      } catch (e) {
        return Object.assign({}, it, { credibility: { score: 0.5, flagged: false, reason: 'cred-error' } });
      }
    }));

    // Sort by a combination of pubDate and credibility score
    scored.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      const credA = (a.credibility && a.credibility.score) || 0.5;
      const credB = (b.credibility && b.credibility.score) || 0.5;
      // prefer newer and higher credibility
      return (dateB - dateA) * 0.7 + (credB - credA) * 100000;
    });

    // Try LLM path first
    const prompt = this.constructPrompt(scored);
    try {
      const response = await this.callLLM(prompt);
      if (response) {
        return response;
      }
    } catch (error) {
      console.error('LLM Brief generation failed:', error.message);
    }

    return this.generateBasicBrief(scored);
  }

  constructPrompt(items) {
    const newsText = items.map((it, i) => {
      const cred = it.credibility ? ` (credibility score: ${Math.round(it.credibility.score*100)}%${it.credibility.flagged ? ', FLAGGED' : ''})` : '';
      return `[${i+1}] ${it.title} (Source: ${it.source})${cred}\nContent: ${it.content.slice(0, 200)}`;
    }).join('\n\n');
    return `You are a news summarizer. Create a concise briefing in English.\nTimezone: ${this.timezone}\nFormat:\n- One sentence highlight of the most important news.\n- 5 to 7 bullet points summarizing key events.\n- Include 2-3 source links where relevant at the end.\n- If any item is flagged as likely misinformation, include a short note explaining why (one line).\n\nNews items:\n${newsText}\n\nResponse must be valid text, no preamble.`;
  }

  async callLLM(prompt) {
    // Placeholder for LLM integration; return null to fall back to basic generator if not available.
    try {
       return null;
    } catch {
       return null;
    }
  }

  generateBasicBrief(items) {
    const timestamp = new Date().toLocaleString('en-GB', { timeZone: this.timezone });
    const highlight = items[0].title;
    const bullets = items.slice(0, 6).map(it => {
      const flag = (it.credibility && it.credibility.flagged) ? ' ⚠️ (flagged)' : '';
      const score = it.credibility ? ` [trust:${Math.round(it.credibility.score*100)}%]` : '';
      return `- ${it.title} (${it.source})${flag}${score}`;
    });
    const links = items.slice(0, 3).map(it => `${it.link} (${it.source})`).join('\n');

    return `*News Briefing (${timestamp} Europe/Athens)*\n\n` +
           `**Highlight:** ${highlight}\n\n` +
           `${bullets.join('\n')}\n\n` +
           `**Source Links:**\n${links}`;
  }

  formatFallback(message) {
    const timestamp = new Date().toLocaleString('en-GB', { timeZone: this.timezone });
    return `*News Briefing (${timestamp} Europe/Athens)*\n\n${message}`;
  }
}

module.exports = BriefGenerator;
