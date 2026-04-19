import AppError from './AppError';

type Rule = 'required' | 'email' | { minLength?: number; maxLength?: number; enum?: any[]; min?: number; max?: number };

interface Schema {
  [key: string]: Rule[];
}

class Validator {
  static check(data: Record<string, any> = {}, schema: Schema = {}): { error: string | null } {
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      for (const rule of rules) {
        if (rule === 'required') {
          if (value === undefined || value === null || String(value).trim() === '') {
            return { error: `${field} is required` };
          }
        }

        if (rule === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            return { error: `${field} must be a valid email address` };
          }
        }

        if (typeof rule === 'object') {
          if (rule.minLength !== undefined && value && String(value).length < rule.minLength) {
            return { error: `${field} must be at least ${rule.minLength} characters` };
          }
          if (rule.maxLength !== undefined && value && String(value).length > rule.maxLength) {
            return { error: `${field} must not exceed ${rule.maxLength} characters` };
          }
          if (rule.enum !== undefined && value && !rule.enum.includes(value)) {
            return { error: `${field} must be one of: ${rule.enum.join(', ')}` };
          }
          if (rule.min !== undefined && value !== undefined && Number(value) < rule.min) {
            return { error: `${field} must be at least ${rule.min}` };
          }
          if (rule.max !== undefined && value !== undefined && Number(value) > rule.max) {
            return { error: `${field} must be at most ${rule.max}` };
          }
        }
      }
    }

    return { error: null };
  }

  static assert(data: Record<string, any>, schema: Schema): void {
    const { error } = Validator.check(data, schema);
    if (error) throw new AppError(error, 400);
  }
}

export default Validator;
