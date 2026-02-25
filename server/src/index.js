import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',') }));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/widget', express.static(path.resolve(__dirname, '../../widget')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/billing', billingRoutes);

app.use(errorHandler);

connectDb()
  .then(() => app.listen(env.port, () => console.log(`🚀 API listening on ${env.port}`)))
  .catch((error) => {
    console.error('DB connection failed', error);
    process.exit(1);
  });
