/**
 * Optional OpenAI Natural-Language Roast Service
 * Automatically falls back to rule-based engine if key is absent or API fails.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generates an optional AI-augmented roast paragraph if OPENAI_API_KEY is configured.
 * @param {object} params - Profile summary params
 * @returns {Promise<string|null>} AI-generated roast paragraph or null if fallback
 */
async function generateAIRoastSnippet({ username, score, profileLevel, topFlaws = [] }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.trim() || apiKey.includes('yourOpenAIKeyHere')) {
    return null; // Graceful rule-based fallback
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt = `You are an expert, witty developer roast comic at a tech meetup.
Philosophy: "Roast the profile, not the person."
The humor must be sharp, developer-specific, punchy, and affectionate, but never hostile or attacking the human.
Keep your response to exactly 2 concise, hilarious sentences targeting their detected GitHub weaknesses.`;

  const userPrompt = `GitHub user: @${username}
Overall GitHub Health Score: ${score}/100
Profile Level: ${profileLevel}
Detected Flaws:
${topFlaws.map(f => `- ${f}`).join('\n')}

Roast this profile in 2 witty sentences.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.8
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`OpenAI API returned status ${res.status}. Falling back to rule-based engine.`);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err) {
    console.warn('OpenAI request failed or timed out. Falling back to rule-based engine:', err.message);
    return null;
  }
}

module.exports = {
  generateAIRoastSnippet
};

