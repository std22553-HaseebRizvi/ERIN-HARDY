export function chunkText(text, size = 500) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += size) chunks.push(words.slice(i, i + size).join(' '));
  return chunks;
}

export function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * (b[i] || 0), 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  if (!magA || !magB) return 0;
  return dot / (magA * magB);
}

export function getPlanLimit(plan) {
  if (plan === 'basic') return 500;
  if (plan === 'pro') return 2000;
  return Number.POSITIVE_INFINITY;
}
