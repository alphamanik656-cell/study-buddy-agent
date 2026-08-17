import 'dotenv/config';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TEXT_MODEL = process.env.GROQ_TEXT_MODEL || 'openai/gpt-oss-120b';
const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.6-27b';

async function chatCompletion({ model, messages, maxTokens, temperature, json, reasoningEffort }) {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      // Both models on Groq spend hidden "reasoning" tokens before the final answer.
      // reasoning_effort keeps that budget small; reasoning_format "hidden" guarantees the
      // reasoning never leaks into visible content as <think> tags (observed on the qwen model).
      ...(reasoningEffort ? { reasoning_effort: reasoningEffort, reasoning_format: 'hidden' } : {}),
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export function generateText(prompt, opts = {}) {
  return chatCompletion({
    model: TEXT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    maxTokens: opts.maxTokens || 1024,
    temperature: opts.temperature,
    json: opts.json,
    reasoningEffort: 'low',
  });
}

export function generateFromImage(prompt, base64Image, mimeType = 'image/png') {
  return chatCompletion({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
        ],
      },
    ],
    maxTokens: 1200,
    reasoningEffort: 'none',
  });
}
