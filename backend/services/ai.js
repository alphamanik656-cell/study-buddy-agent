import 'dotenv/config';
import * as ollama from './ollama.js';
import * as anthropic from './anthropic.js';
import * as groq from './groq.js';

// AI_PROVIDER=ollama (default, local/free) | groq (free hosted API, used for the live deploy
// since the deployed backend can't reach a local Ollama instance) | anthropic (paid, optional).
const PROVIDER = (process.env.AI_PROVIDER || 'ollama').toLowerCase();
const PROVIDERS = { ollama, anthropic, groq };
const impl = PROVIDERS[PROVIDER] || ollama;

export function generateText(prompt, opts = {}) {
  return impl.generateText(prompt, opts);
}

export function generateFromImage(prompt, base64Image, mimeType) {
  return impl.generateFromImage(prompt, base64Image, mimeType);
}
