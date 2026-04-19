import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

/**
 * BaseRepository – Abstract base class for all repositories.
 * Implements Repository Pattern.
 * All entity-specific repos extend this class.
 */
export default abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findAll(filter: FilterQuery<T> = {}, options: any = {}): Promise<T[]> {
    const { sort = { createdAt: -1 }, limit, skip } = options;
    let query = this.model.find(filter).sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    return query.exec();
  }

  async findByUser(userId: string, filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find({ userId, ...filter }).sort({ createdAt: -1 }).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
