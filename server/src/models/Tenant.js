import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    chatbotName: { type: String, default: 'Assistant' },
    welcomeMessage: { type: String, default: 'Hi! How can I help you today?' },
    themeColor: { type: String, default: '#2563eb' },
    plan: { type: String, enum: ['basic', 'pro', 'premium'], default: 'basic' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    monthlyUsageCount: { type: Number, default: 0 },
    usageResetAt: { type: Date, default: () => new Date() },
    online: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Tenant = mongoose.model('Tenant', tenantSchema);
