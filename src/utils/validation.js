// src/utils/validation.js
import { AppError } from './errorHandler';

/**
 * Schema de validaci\u00f3n simple
 */
export class ValidationSchema {
  constructor(rules) {
    this.rules = rules;
  }

  validate(data) {
    const errors = {};

    for (const [field, validators] of Object.entries(this.rules)) {
      const value = data[field];

      for (const validator of validators) {
        const error = validator(value, field, data);
        if (error) {
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(error);
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new AppError(
        'Errores de validaci\u00f3n',
        400,
        true,
        { errors }
      );
    }

    return true;
  }
}

/**
 * Validadores predefinidos
 */
export const validators = {
  required: (message = 'Este campo es requerido') => {
    return (value) => {
      if (value === undefined || value === null || value === '') {
        return message;
      }
      return null;
    };
  },

  email: (message = 'Email inv\u00e1lido') => {
    return (value) => {
      if (!value) return null; // Dejar que 'required' maneje esto
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return message;
      }
      return null;
    };
  },

  minLength: (min, message) => {
    return (value) => {
      if (!value) return null;
      if (value.length < min) {
        return message || `Debe tener al menos ${min} caracteres`;
      }
      return null;
    };
  },

  maxLength: (max, message) => {
    return (value) => {
      if (!value) return null;
      if (value.length > max) {
        return message || `No puede exceder ${max} caracteres`;
      }
      return null;
    };
  },

  pattern: (regex, message = 'Formato inv\u00e1lido') => {
    return (value) => {
      if (!value) return null;
      if (!regex.test(value)) {
        return message;
      }
      return null;
    };
  },

  oneOf: (options, message) => {
    return (value) => {
      if (!value) return null;
      if (!options.includes(value)) {
        return message || `Debe ser uno de: ${options.join(', ')}`;
      }
      return null;
    };
  },

  custom: (validator, message) => {
    return (value, field, data) => {
      if (!validator(value, data)) {
        return message || 'Validaci\u00f3n fallida';
      }
      return null;
    };
  },

  mongoId: (message = 'ID inv\u00e1lido') => {
    return (value) => {
      if (!value) return null;
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!mongoIdRegex.test(value)) {
        return message;
      }
      return null;
    };
  },

  phone: (message = 'Tel\u00e9fono inv\u00e1lido') => {
    return (value) => {
      if (!value) return null;
      // Formato flexible: acepta diferentes formatos
      const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
      if (!phoneRegex.test(value)) {
        return message;
      }
      return null;
    };
  },

  date: (message = 'Fecha inv\u00e1lida') => {
    return (value) => {
      if (!value) return null;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return message;
      }
      return null;
    };
  },

  time: (message = 'Hora inv\u00e1lida (formato HH:MM)') => {
    return (value) => {
      if (!value) return null;
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(value)) {
        return message;
      }
      return null;
    };
  },
};

/**
 * Sanitizaci\u00f3n de datos
 */
export const sanitizers = {
  trim: (value) => {
    return typeof value === 'string' ? value.trim() : value;
  },

  lowercase: (value) => {
    return typeof value === 'string' ? value.toLowerCase() : value;
  },

  uppercase: (value) => {
    return typeof value === 'string' ? value.toUpperCase() : value;
  },

  escape: (value) => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  strip: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/<[^>]*>/g, '');
  },
};

/**
 * Aplicar sanitizadores a un objeto
 */
export function sanitizeData(data, schema) {
  const sanitized = { ...data };

  for (const [field, sanitizerNames] of Object.entries(schema)) {
    if (sanitized[field] !== undefined) {
      for (const sanitizerName of sanitizerNames) {
        const sanitizer = sanitizers[sanitizerName];
        if (sanitizer) {
          sanitized[field] = sanitizer(sanitized[field]);
        }
      }
    }
  }

  return sanitized;
}

/**
 * Ejemplo de uso:
 * 
 * const appointmentSchema = new ValidationSchema({
 *   doctorId: [validators.required(), validators.mongoId()],
 *   date: [validators.required(), validators.date()],
 *   startTime: [validators.required(), validators.time()],
 *   specialty: [validators.required(), validators.minLength(3)],
 *   reason: [validators.required(), validators.minLength(10), validators.maxLength(500)],
 * });
 * 
 * appointmentSchema.validate(data);
 */
