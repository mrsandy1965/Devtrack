import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import asyncHandler from '../utils/asyncHandler';
import Validator from '../utils/Validator';

class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    Validator.assert(req.body, {
      name:     ['required', { maxLength: 80 }],
      email:    ['required', 'email'],
      password: ['required', { minLength: 6 }],
    });

    const { name, email, password } = req.body;
    const result = await AuthService.register(name, email, password);
    res.status(201).json({ success: true, ...result });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    Validator.assert(req.body, {
      email:    ['required', 'email'],
      password: ['required'],
    });

    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json({ success: true, ...result });
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.getMe((req.user as any)._id || req.user.id);
    res.status(200).json({ success: true, user });
  });
}

export default new AuthController();
