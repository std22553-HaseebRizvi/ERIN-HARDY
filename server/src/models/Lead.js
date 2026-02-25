import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
    name: String,
    email: String,
    phone: String,
    notes: String,
    source: { type: String, default: 'chat-widget' }
  },
  { timestamps: true }
);

export const Lead = mongoose.model('Lead', leadSchema);
