const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');

class AuthService {
  _generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  }

  async register(name, email, password) {
    const existing = await UserRepository.findByEmailPublic(email);
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const user = await UserRepository.create({ name, email, password });
    const token = this._generateToken(user._id);

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

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this._generateToken(user._id);

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

  async getMe(userId) {
    return UserRepository.findById(userId);
  }
}

module.exports = new AuthService();
