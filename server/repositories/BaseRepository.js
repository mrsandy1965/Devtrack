/**
 * BaseRepository – Abstract base class for all repositories.
 * Implements Repository Pattern.
 * All entity-specific repos extend this class.
 */
class BaseRepository {
  constructor(model) {
    if (new.target === BaseRepository) {
      throw new Error('BaseRepository is abstract and cannot be instantiated directly.');
    }
    this.model = model;
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findAll(filter = {}, options = {}) {
    const { sort = { createdAt: -1 }, limit, skip } = options;
    let query = this.model.find(filter).sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    return query;
  }

  async findByUser(userId, filter = {}) {
    return this.model.find({ userId, ...filter }).sort({ createdAt: -1 });
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }
}

module.exports = BaseRepository;
