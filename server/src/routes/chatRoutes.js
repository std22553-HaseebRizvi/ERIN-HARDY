import { Router } from 'express';
import Joi from 'joi';
import { validateBody } from '../middleware/validate.js';
import { Tenant } from '../models/Tenant.js';
import { ChatSession } from '../models/ChatSession.js';
import { Lead } from '../models/Lead.js';
import { KnowledgeDocument } from '../models/KnowledgeDocument.js';
import { createEmbedding, streamCompletion } from '../services/openaiService.js';
import { cosineSimilarity, getPlanLimit } from '../utils/rag.js';

const router = Router();

router.get('/tenant/:tenantId/config', async (req, res) => {
  const tenant = await Tenant.findById(req.params.tenantId).select('chatbotName welcomeMessage themeColor online');
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json(tenant);
});

router.post(
  '/lead',
  validateBody(
    Joi.object({
      tenantId: Joi.string().required(),
      sessionId: Joi.string().optional(),
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      notes: Joi.string().allow('')
    })
  ),
  async (req, res) => {
    const lead = await Lead.create(req.body);
    if (req.body.sessionId) await ChatSession.findByIdAndUpdate(req.body.sessionId, { leadId: lead._id });
    res.status(201).json(lead);
  }
);

router.post(
  '/stream',
  validateBody(
    Joi.object({
      tenantId: Joi.string().required(),
      visitorId: Joi.string().required(),
      sessionId: Joi.string().allow('', null),
      message: Joi.string().required(),
      history: Joi.array().items(
        Joi.object({ role: Joi.string().valid('user', 'assistant').required(), content: Joi.string().required() })
      )
    })
  ),
  async (req, res) => {
    const { tenantId, visitorId, message, history = [], sessionId } = req.body;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    const limit = getPlanLimit(tenant.plan);
    if (tenant.monthlyUsageCount >= limit) {
      return res.status(402).json({ error: 'Message limit reached for your current plan' });
    }

    const docs = await KnowledgeDocument.find({ tenantId }).lean();
    const queryEmbedding = await createEmbedding(message);
    const scored = docs.flatMap((doc) =>
      (doc.chunks || []).map((chunk) => ({ text: chunk.text, score: cosineSimilarity(queryEmbedding, chunk.embedding || []) }))
    );

    const context = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .filter((item) => item.score > 0.25)
      .map((item) => `- ${item.text}`)
      .join('\n');

    const prompt = `You are a 24/7 customer support assistant for a business website.
- Use a professional and friendly tone.
- Do not invent business facts. If unsure, say you don't have enough information and offer to connect with the team.
- Ask clarifying questions for ambiguous requests.
- If user shows buying intent, suggest sharing name, email, and phone for follow-up.`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let assistantText = '';
    const mergedHistory = [...history, { role: 'user', content: message }];

    try {
      assistantText = await streamCompletion({
        systemPrompt: prompt,
        context,
        messages: mergedHistory,
        onToken: (token) => res.write(`data: ${JSON.stringify({ token })}\n\n`)
      });

      if (!assistantText.trim()) {
        assistantText = "I'm not fully sure about that yet. Could you share a little more detail so I can help accurately?";
        res.write(`data: ${JSON.stringify({ token: assistantText })}\n\n`);
      }

      const chat =
        (sessionId && (await ChatSession.findById(sessionId))) ||
        (await ChatSession.create({ tenantId, visitorId, messages: [] }));

      chat.messages.push({ role: 'user', content: message });
      chat.messages.push({ role: 'assistant', content: assistantText });
      await chat.save();

      tenant.monthlyUsageCount += 1;
      await tenant.save();

      res.write(`data: ${JSON.stringify({ done: true, sessionId: chat._id })}\n\n`);
      res.end();
    } catch (error) {
      console.error(error);
      res.write(`data: ${JSON.stringify({ error: 'Chat response failed' })}\n\n`);
      res.end();
    }
  }
);

export default router;
