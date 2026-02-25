import { Router } from 'express';
import Joi from 'joi';
import { stringify } from 'csv-stringify/sync';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { Tenant } from '../models/Tenant.js';
import { Lead } from '../models/Lead.js';
import { ChatSession } from '../models/ChatSession.js';

const router = Router();
router.use(requireAuth);

router.get('/me', async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenantId).select('-passwordHash');
  res.json(tenant);
});

router.patch(
  '/settings',
  validateBody(
    Joi.object({
      chatbotName: Joi.string(),
      welcomeMessage: Joi.string(),
      themeColor: Joi.string(),
      online: Joi.boolean()
    })
  ),
  async (req, res) => {
    const tenant = await Tenant.findByIdAndUpdate(req.user.tenantId, req.body, { new: true }).select('-passwordHash');
    res.json(tenant);
  }
);

router.get('/analytics', async (req, res) => {
  const tenantId = req.user.tenantId;
  const [messageCount, leadCount, sessions] = await Promise.all([
    ChatSession.aggregate([
      { $match: { tenantId: tenantId } },
      { $project: { total: { $size: '$messages' } } },
      { $group: { _id: null, count: { $sum: '$total' } } }
    ]),
    Lead.countDocuments({ tenantId }),
    ChatSession.countDocuments({ tenantId })
  ]);
  res.json({ messages: messageCount[0]?.count || 0, leads: leadCount, sessions });
});

router.get('/leads', async (req, res) => {
  const leads = await Lead.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
  res.json(leads);
});

router.get('/chats', async (req, res) => {
  const chats = await ChatSession.find({ tenantId: req.user.tenantId }).sort({ updatedAt: -1 }).limit(100);
  res.json(chats);
});

router.get('/chats/export.csv', async (req, res) => {
  const chats = await ChatSession.find({ tenantId: req.user.tenantId }).lean();
  const records = chats.flatMap((chat) =>
    chat.messages.map((message) => ({
      chatId: chat._id.toString(),
      visitorId: chat.visitorId,
      role: message.role,
      content: message.content,
      createdAt: chat.createdAt
    }))
  );

  const csv = stringify(records, { header: true });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="chat-logs.csv"');
  res.send(csv);
});

export default router;
