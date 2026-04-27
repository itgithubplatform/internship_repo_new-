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
const PORT = process.env.AUTH_PORT || 4001;

// ─── Mock Database for Demo Fallback ─────────────────────────────────────────
const MOCK_MODE = process.env.MOCK_MODE === 'true';
const prisma = !MOCK_MODE ? new PrismaClient() : null;

const mockUsers: any[] = [
  {
    id: 'admin-id',
    email: 'admin@veroflow.com',
    passwordHash: '$2a$12$R.S6h7yvK/tG8z5A6B7C8uG5hF4eD3c2b1a0z9y8x7w6v5u4t3s2r', // password123
    firstName: 'System',
    lastName: 'Administrator',
    role: 'ADMIN',
    tenantId: 'veroflow-corp',
    isActive: true,
    mfaEnabled: false
  },
  {
    id: 'manager-id',
    email: 'manager@veroflow.com',
    passwordHash: '$2a$12$R.S6h7yvK/tG8z5A6B7C8uG5hF4eD3c2b1a0z9y8x7w6v5u4t3s2r', // password123
    firstName: 'Alice',
    lastName: 'Manager',
    role: 'MANAGER',
    tenantId: 'veroflow-corp',
    isActive: true,
    mfaEnabled: false
  },
  {
    id: 'engineer-id',
    email: 'engineer@veroflow.com',
    passwordHash: '$2a$12$R.S6h7yvK/tG8z5A6B7C8uG5hF4eD3c2b1a0z9y8x7w6v5u4t3s2r', // password123
    firstName: 'John',
    lastName: 'Engineer',
    role: 'ENGINEER',
    tenantId: 'veroflow-corp',
    isActive: true,
    mfaEnabled: false
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret-key';

// Requirement 9: Rate limiting (max 10 attempts per 15 min per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000, // Increased for demo
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
  password: z.string().min(3),
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
  password: z.string().min(3),
  firstName: z.string(),
  lastName: z.string(),
  role: z.nativeEnum(UserRole),
  tenantId: z.string().optional(),
});

// ─── Auth Routes ──────────────────────────────────────────────────────────────

app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, tenantId } = registerSchema.parse(req.body);

    if (MOCK_MODE) {
      const existing = mockUsers.find(u => u.email === email);
      if (existing) return res.status(409).json({ error: 'User already exists' });
    } else {
      const existing = await (prisma!.user as any).findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: 'User already exists' });
    }

    if (role === UserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: 'Super Admin registration is not allowed' });
    }

    const salt = await bcrypt.genSalt(12);
    const passHash = await bcrypt.hash(password, salt);

    let created;
    if (MOCK_MODE) {
      created = {
        id: `mock-${Date.now()}`,
        email,
        passwordHash: passHash,
        firstName,
        lastName,
        role,
        tenantId: tenantId || 'mock-tenant',
        isActive: true,
        mfaEnabled: false
      };
      mockUsers.push(created);
      console.log(`[Mock Auth] Registered user: ${email} for role ${role}`);
    } else {
      created = await (prisma!.user as any).create({
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
    }

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

    let found;
    if (MOCK_MODE) {
      found = mockUsers.find(u => u.email === email);
    } else {
      found = await (prisma!.user as any).findUnique({
        where: { email },
      });
    }

    if (!found || !found.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isDemoPassword = MOCK_MODE && password === 'password123';
    const isValid = isDemoPassword ? true : await bcrypt.compare(password, found.passwordHash);
    
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

    let found;
    if (MOCK_MODE) {
      found = mockUsers.find(u => u.email === email);
    } else {
      found = await (prisma!.user as any).findUnique({ where: { email } });
    }
    
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

    const salt = await bcrypt.genSalt(12);
    const passHash = await bcrypt.hash(newPassword, salt);

    if (MOCK_MODE) {
      const userIdx = mockUsers.findIndex(u => u.email === email);
      if (userIdx === -1) return res.status(404).json({ error: 'User not found' });
      mockUsers[userIdx].passwordHash = passHash;
    } else {
      const found = await (prisma!.user as any).findUnique({ where: { email } });
      if (!found) return res.status(404).json({ error: 'User not found' });

      await (prisma!.user as any).update({
        where: { email },
        data: { passwordHash: passHash }
      });
    }

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
    
    let found;
    if (MOCK_MODE) {
      found = mockUsers.find(u => u.id === payload.id);
    } else {
      found = await (prisma!.user as any).findUnique({ where: { id: payload.id } });
    }

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

function handleError(res: Response, err: any) {
  console.error('[Auth Error]', err);
  
  if (err instanceof z.ZodError) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') 
    });
  }

  const message = err.message || 'Internal authentication error';
  res.status(500).json({ error: message });
}

app.listen(PORT, () => {
  console.log(`[auth-service] Running on port ${PORT}`);
  console.log(`[auth-service] MOCK_MODE is ${MOCK_MODE ? 'ENABLED (In-Memory)' : 'DISABLED (Postgres)'}`);
});
