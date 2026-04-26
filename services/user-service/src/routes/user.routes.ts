import { Router } from 'express';
import {
  listUsers,
  createUser,
  getUserProfile,
  updateUser,
  deactivateUser,
  resendInvite
} from '../controllers/user.controller';

export const userRouter = Router();

// Implementation of 7.2 User Management Routes
userRouter.get('/', listUsers);                     // List users in tenant
userRouter.post('/', createUser);                   // Create user
userRouter.get('/:id', getUserProfile);             // Get user profile
userRouter.patch('/:id', updateUser);               // Update user details
userRouter.delete('/:id', deactivateUser);          // Deactivate user
userRouter.post('/:id/resendinvite', resendInvite); // Resend invitation email
