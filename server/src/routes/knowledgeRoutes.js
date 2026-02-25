import { Router } from 'express';
import multer from 'multer';
import Joi from 'joi';
import pdfParse from 'pdf-parse';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { KnowledgeDocument } from '../models/KnowledgeDocument.js';
import { chunkText } from '../utils/rag.js';
import { createEmbedding } from '../services/openaiService.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

router.post(
  '/text',
  validateBody(
    Joi.object({
      title: Joi.string().required(),
      sourceType: Joi.string().valid('faq', 'text').required(),
      rawText: Joi.string().min(20).required()
    })
  ),
  async (req, res) => {
    const textChunks = chunkText(req.body.rawText, 120);
    const embeddedChunks = await Promise.all(
      textChunks.map(async (text) => ({ text, embedding: await createEmbedding(text) }))
    );

    const doc = await KnowledgeDocument.create({
      tenantId: req.user.tenantId,
      ...req.body,
      chunks: embeddedChunks
    });

    res.status(201).json(doc);
  }
);

router.post('/pdf', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

  const parsed = await pdfParse(req.file.buffer);
  const textChunks = chunkText(parsed.text || '', 120);
  const embeddedChunks = await Promise.all(
    textChunks.map(async (text) => ({ text, embedding: await createEmbedding(text) }))
  );

  const doc = await KnowledgeDocument.create({
    tenantId: req.user.tenantId,
    title: req.file.originalname,
    sourceType: 'pdf',
    rawText: parsed.text,
    chunks: embeddedChunks
  });

  res.status(201).json(doc);
});

router.get('/', async (req, res) => {
  const docs = await KnowledgeDocument.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
  res.json(docs);
});

export default router;
