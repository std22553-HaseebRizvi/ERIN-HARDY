import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true }
  },
  { _id: false, timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
    visitorId: { type: String, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    messages: [messageSchema]
  },
  { timestamps: true }
);

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
