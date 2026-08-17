import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';

let client = null;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

export async function generateText(prompt, opts = {}) {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens || 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = response.content.find((b) => b.type === 'text');
  return block ? block.text : '';
}

export async function generateFromImage(prompt, base64Image, mimeType = 'image/png') {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64Image },
          },
          { type: 'text', text: prompt },
        ],
      },
    ],
  });
  const block = response.content.find((b) => b.type === 'text');
  return block ? block.text : '';
}
