const AppError = require('./AppError');

/**
 * Validator – Utility class for input validation.
 *
 * OOP: Uses the Builder Pattern — chain .required().email().minLength()
 * and call .validate(data) to get a clean result.
 *
 * Usage:
 *   const { error } = Validator.check(req.body, {
 *     email:    ['required', 'email'],
 *     password: ['required', { minLength: 6 }],
 *     name:     ['required', { maxLength: 80 }],
 *   });
 *   if (error) throw new AppError(error, 400);
 */
class Validator {
  /**
   * @param {Object} data    – req.body (or any plain object)
   * @param {Object} schema  – field → array of rule strings/objects
   * @returns {{ error: string|null }}
   */
  static check(data = {}, schema = {}) {
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      for (const rule of rules) {
        // ── required ──────────────────────
        if (rule === 'required') {
          if (value === undefined || value === null || String(value).trim() === '') {
            return { error: `${field} is required` };
          }
        }

        // ── email ──────────────────────────
        if (rule === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            return { error: `${field} must be a valid email address` };
          }
        }

        // ── object rules ───────────────────
        if (typeof rule === 'object') {
          // minLength
          if (rule.minLength !== undefined && value && String(value).length < rule.minLength) {
            return { error: `${field} must be at least ${rule.minLength} characters` };
          }
          // maxLength
          if (rule.maxLength !== undefined && value && String(value).length > rule.maxLength) {
            return { error: `${field} must not exceed ${rule.maxLength} characters` };
          }
          // enum
          if (rule.enum !== undefined && value && !rule.enum.includes(value)) {
            return { error: `${field} must be one of: ${rule.enum.join(', ')}` };
          }
          // min (number)
          if (rule.min !== undefined && value !== undefined && Number(value) < rule.min) {
            return { error: `${field} must be at least ${rule.min}` };
          }
          // max (number)
          if (rule.max !== undefined && value !== undefined && Number(value) > rule.max) {
            return { error: `${field} must be at most ${rule.max}` };
          }
        }
      }
    }

    return { error: null };
  }

  /**
   * Convenience: throw AppError directly if validation fails.
   * @param {Object} data
   * @param {Object} schema
   */
  static assert(data, schema) {
    const { error } = Validator.check(data, schema);
    if (error) throw new AppError(error, 400);
  }
}

module.exports = Validator;
