import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Tenant } from '../models/Tenant.js';
import { validateBody } from '../middleware/validate.js';
import { env } from '../config/env.js';

const router = Router();

router.post(
  '/signup',
  validateBody(
    Joi.object({
      companyName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required()
    })
  ),
  async (req, res) => {
    const { companyName, email, password } = req.body;
    if (await Tenant.findOne({ email })) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const tenant = await Tenant.create({ companyName, email, passwordHash });
    const token = jwt.sign({ tenantId: tenant._id, email: tenant.email }, env.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({ token, tenant });
  }
);

router.post(
  '/login',
  validateBody(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  ),
  async (req, res) => {
    const tenant = await Tenant.findOne({ email: req.body.email });
    if (!tenant) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(req.body.password, tenant.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ tenantId: tenant._id, email: tenant.email }, env.jwtSecret, { expiresIn: '7d' });
    res.json({ token, tenant });
  }
);

export default router;
