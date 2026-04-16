const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return User.findOne({ email }).select('+password');
  }

  async findByEmailPublic(email) {
    return User.findOne({ email });
  }

  async findByGithubUsername(githubUsername) {
    return User.findOne({ githubUsername });
  }

  // Explicitly selects githubToken (which is select:false by default)
  async findByIdWithToken(userId) {
    return User.findById(userId).select('+githubToken');
  }

  async updateCareerScore(userId, score) {
    return User.findByIdAndUpdate(userId, { careerScore: score }, { new: true });
  }

  async saveGithubToken(userId, token, username) {
    return User.findByIdAndUpdate(
      userId,
      { githubToken: token, githubUsername: username },
      { new: true }
    );
  }
}

module.exports = new UserRepository();
