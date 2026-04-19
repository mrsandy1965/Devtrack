import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository';
import AppError from '../utils/AppError';
import { IUserDocument } from '../models/User';

class AuthService {
  private _generateToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  }

  async register(name: string, email: string, password: string): Promise<any> {
    const existing = await UserRepository.findByEmailPublic(email);
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const user = await UserRepository.create({ name, email, password } as Partial<IUserDocument>);
    const token = this._generateToken(user._id as string);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        careerScore: user.careerScore,
      },
    };
  }

  async login(email: string, password: string): Promise<any> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this._generateToken(user._id as string);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername,
        careerScore: user.careerScore,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async getMe(userId: string): Promise<IUserDocument | null> {
    return UserRepository.findById(userId);
  }
}

export default new AuthService();
