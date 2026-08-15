import 'dotenv/config';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const TEXT_MODEL = process.env.OLLAMA_TEXT_MODEL || 'llama3.2';
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL || 'llama3.2-vision';

async function generate({ model, prompt, images, format, temperature = 0.4, maxTokens = 600 }) {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      images,
      format,
      stream: false,
      options: { temperature, num_predict: maxTokens },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.response;
}

export function generateText(prompt, opts = {}) {
  return generate({
    model: TEXT_MODEL,
    prompt,
    format: opts.json ? 'json' : undefined,
    temperature: opts.temperature,
    maxTokens: opts.maxTokens,
  });
}

export function generateFromImage(prompt, base64Image) {
  return generate({ model: VISION_MODEL, prompt, images: [base64Image], maxTokens: 1000 });
}
