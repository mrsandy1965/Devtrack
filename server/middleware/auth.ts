import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
// We will convert UserRepository later. For now, require works or we can pretend it's ts.
import UserRepository from '../repositories/UserRepository';
import { IUser } from '../../shared/types';

// Augment Express Request interface
declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user as any; // Cast as any temporarily until UserRepository is fully TS
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};
