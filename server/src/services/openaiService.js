import OpenAI from 'openai';
import { env } from '../config/env.js';

export const openai = new OpenAI({ apiKey: env.openAiApiKey });

export async function createEmbedding(text) {
  const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text });
  return res.data[0].embedding;
}

export async function streamCompletion({ systemPrompt, messages, context, onToken }) {
  const stream = await openai.chat.completions.create({
    model: env.openAiModel,
    stream: true,
    temperature: 0.4,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: `Business context:\n${context || 'No context provided.'}` },
      ...messages
    ]
  });

  let fullText = '';
  for await (const chunk of stream) {
    const token = chunk.choices?.[0]?.delta?.content || '';
    fullText += token;
    if (token) onToken(token);
  }
  return fullText;
}
