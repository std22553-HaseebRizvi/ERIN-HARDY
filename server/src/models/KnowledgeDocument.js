import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema(
  {
    text: String,
    embedding: { type: [Number], default: [] }
  },
  { _id: false }
);

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
    title: String,
    sourceType: { type: String, enum: ['faq', 'text', 'pdf'], default: 'text' },
    rawText: String,
    chunks: [chunkSchema]
  },
  { timestamps: true }
);

export const KnowledgeDocument = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
