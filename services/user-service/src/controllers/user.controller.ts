import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger, encrypt, decrypt } from '@platform/tenant-core';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const decryptUser = (user: any) => {
  if (!user) return user;
  return {
    ...user,
    firstName: decrypt(user.firstName),
    lastName: decrypt(user.lastName),
    phone: user.phone ? decrypt(user.phone) : user.phone,
  };
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const users = await prisma.user.findMany({
      where: { tenantId }
    });
    res.json(users.map(decryptUser));
  } catch (error) {
    logger.error('Failed to list users', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { password, firstName, lastName, phone, ...userData } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    // Passwords hashed with bcrypt (cost factor >= 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({ 
      data: { 
        ...userData, 
        firstName: encrypt(firstName),
        lastName: encrypt(lastName),
        phone: phone ? encrypt(phone) : phone,
        passwordHash,
        tenantId // Enforce tenant isolation on creation
      } 
    });
    
    // Don't return the hash, decrypt for response
    const { passwordHash: _, ...userWithoutPassword } = decryptUser(user);
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    logger.error('Failed to create user', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const user = await prisma.user.findFirst({ 
      where: { id: req.params.id, tenantId } 
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(decryptUser(user));
  } catch (error) {
    logger.error('Failed to fetch user', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const user = await prisma.user.updateMany({
      where: { id: req.params.id, tenantId },
      data: req.body
    });
    if (user.count === 0) return res.status(404).json({ error: 'User not found or access denied' });
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    logger.error('Failed to update user', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const result = await prisma.user.updateMany({
      where: { id: req.params.id, tenantId },
      data: { isActive: false }
    });
    if (result.count === 0) return res.status(404).json({ error: 'User not found or access denied' });
    res.status(204).send();
  } catch (error) {
    logger.error('Failed to deactivate user', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};

export const resendInvite = async (req: Request, res: Response) => {
  try {
    // Implementation for queuing email to notification service
    logger.info(`Resending invite for user ${req.params.id}`);
    res.json({ message: 'Invite resent successfully' });
  } catch (error) {
    logger.error('Failed to resend invite', error);
    res.status(500).json({ error: 'Failed to resend invite' });
  }
};
