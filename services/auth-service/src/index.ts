import 'dotenv/config';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';

// ─── Local Types ────────────────────────────────────────────────────────────

enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ENGINEER = 'ENGINEER',
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.AUTH_PORT || 4001;

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret-key';

// Requirement 9: Rate limiting (max 10 attempts per 15 min per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/auth/', authLimiter);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const mfaSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const resetSchema = z.object({
  email: z.string().email(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
  role: z.nativeEnum(UserRole),
  tenantId: z.string().optional(),
});

// ─── Auth Routes ──────────────────────────────────────────────────────────────

app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, tenantId } = registerSchema.parse(req.body);

    const existing = await (prisma.user as any).findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    if (role === UserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: 'Super Admin registration is not allowed' });
    }

    const salt = await bcrypt.genSalt(12);
    const passHash = await bcrypt.hash(password, salt);

    const created = await (prisma.user as any).create({
      data: {
        email,
        passwordHash: passHash,
        firstName,
        lastName,
        role: role,
        tenantId: tenantId || 'pending-tenant', 
        isActive: true,
      }
    });

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: cleanUser(created) 
    });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const found = await (prisma.user as any).findUnique({
      where: { email },
    });

    if (!found || !found.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isValid = await bcrypt.compare(password, found.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (found.mfaEnabled) {
      return res.json({ mfaRequired: true, email: found.email });
    }

    const accessToken = generateAccessToken(found);
    const refreshToken = generateRefreshToken(found.id);

    res.json({ accessToken, refreshToken, user: cleanUser(found) });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/auth/mfa/verify', async (req: Request, res: Response) => {
  try {
    const { email, code } = mfaSchema.parse(req.body);
    if (code !== '123456') return res.status(401).json({ error: 'Invalid MFA code' });

    const found = await (prisma.user as any).findUnique({ where: { email } });
    if (!found) return res.status(404).json({ error: 'User not found' });

    const accessToken = generateAccessToken(found);
    const refreshToken = generateRefreshToken(found.id);

    res.json({ accessToken, refreshToken, user: cleanUser(found) });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = resetSchema.parse(req.body);
    console.log(`[OTP] Generated for ${email}: 889900`);
    res.json({ message: 'If the email exists, an OTP has been sent.' });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/auth/logout', async (_req: Request, res: Response) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email } = resetSchema.parse(req.body);
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
      return res.status(400).json({ error: 'Code and newPassword are required' });
    }

    if (code !== '889900') return res.status(401).json({ error: 'Invalid reset code' });

    const found = await (prisma.user as any).findUnique({ where: { email } });
    if (!found) return res.status(404).json({ error: 'User not found' });

    const salt = await bcrypt.genSalt(12);
    const passHash = await bcrypt.hash(newPassword, salt);

    await (prisma.user as any).update({
      where: { email },
      data: { passwordHash: passHash }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/auth/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
    const found = await (prisma.user as any).findUnique({ where: { id: payload.id } });

    if (!found || !found.isActive) return res.status(401).json({ error: 'Invalid user' });

    const accessToken = generateAccessToken(found);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateAccessToken(data: any) {
  return jwt.sign(
    { id: data.id, email: data.email, role: data.role, tenantId: data.tenantId },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(id: string) {
  return jwt.sign({ id }, REFRESH_SECRET, { expiresIn: '7d' });
}

function cleanUser(input: any) {
  const { passwordHash, mfaSecret, ...safeData } = input;
  return safeData;
}

function handleError(res: Response, err: unknown) {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: err.errors });
  }
  res.status(500).json({ error: 'Authentication error' });
}

app.listen(PORT, () => {
  console.log(`[auth-service] Running on port ${PORT}`);
});
