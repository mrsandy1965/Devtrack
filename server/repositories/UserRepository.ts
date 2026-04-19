import BaseRepository from './BaseRepository';
import User, { IUserDocument } from '../models/User';

class UserRepository extends BaseRepository<IUserDocument> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).select('+password').exec();
  }

  async findByEmailPublic(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }

  async findByGithubUsername(githubUsername: string): Promise<IUserDocument | null> {
    return this.model.findOne({ githubUsername }).exec();
  }

  async findByIdWithToken(userId: string): Promise<IUserDocument | null> {
    return this.model.findById(userId).select('+githubToken').exec();
  }

  async updateCareerScore(userId: string, score: number): Promise<IUserDocument | null> {
    return this.model.findByIdAndUpdate(userId, { careerScore: score }, { new: true }).exec();
  }

  async saveGithubToken(userId: string, token: string, username: string): Promise<IUserDocument | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { githubToken: token, githubUsername: username },
      { new: true }
    ).exec();
  }
}

export default new UserRepository();
