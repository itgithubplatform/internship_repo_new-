import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '@platform/tenant-core';

const prisma = new PrismaClient();

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    logger.error('Failed to list users', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.status(201).json(user);
  } catch (error) {
    logger.error('Failed to create user', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    logger.error('Failed to fetch user', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(user);
  } catch (error) {
    logger.error('Failed to update user', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
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
