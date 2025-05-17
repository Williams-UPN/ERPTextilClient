// validators.js - Funciones de validación
export const validators = {
  // Validar email
  isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar contraseña fuerte
  isStrongPassword(password) {
    // Al menos 8 caracteres, una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Validar número de teléfono
  isPhoneNumber(phone) {
    const phoneRegex = /^[0-9\-\+\s\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 9;
  },

  // Validar campo requerido
  isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },

  // Validar longitud mínima
  minLength(value, min) {
    return value.toString().length >= min;
  },

  // Validar longitud máxima
  maxLength(value, max) {
    return value.toString().length <= max;
  },

  // Validar número dentro de rango
  inRange(value, min, max) {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  // Validar número positivo
  isPositive(value) {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },

  // Validar número entero
  isInteger(value) {
    const num = Number(value);
    return !isNaN(num) && Number.isInteger(num);
  },

  // Validar formato de fecha
  isDate(date) {
    return date instanceof Date && !isNaN(date);
  },

  // Validar código de producto (ejemplo: XXX-000)
  isProductCode(code) {
    const codeRegex = /^[A-Z]{3}-\d{3}$/;
    return codeRegex.test(code);
  },

  // Validar username
  isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }
};

// Clase para validación de formularios
export class FormValidator {
  constructor(form, rules) {
    this.form = form;
    this.rules = rules;
    this.errors = {};
  }

  validate() {
    this.errors = {};
    
    for (const [field, fieldRules] of Object.entries(this.rules)) {
      const input = this.form.elements[field];
      if (!input) continue;

      const value = input.value;
      
      for (const rule of fieldRules) {
        const error = this.validateRule(value, rule);
        if (error) {
          if (!this.errors[field]) this.errors[field] = [];
          this.errors[field].push(error);
        }
      }
    }

    return Object.keys(this.errors).length === 0;
  }

  validateRule(value, rule) {
    const { type, message, ...params } = rule;

    switch (type) {
      case 'required':
        if (!validators.isRequired(value)) return message || 'Este campo es requerido';
        break;
      
      case 'email':
        if (!validators.isEmail(value)) return message || 'Email inválido';
        break;
      
      case 'minLength':
        if (!validators.minLength(value, params.min)) 
          return message || `Mínimo ${params.min} caracteres`;
        break;
      
      case 'maxLength':
        if (!validators.maxLength(value, params.max)) 
          return message || `Máximo ${params.max} caracteres`;
        break;
      
      case 'strongPassword':
        if (!validators.isStrongPassword(value)) 
          return message || 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
        break;
      
      case 'phoneNumber':
        if (!validators.isPhoneNumber(value)) 
          return message || 'Número de teléfono inválido';
        break;
      
      case 'positive':
        if (!validators.isPositive(value)) 
          return message || 'Debe ser un número positivo';
        break;
      
      case 'integer':
        if (!validators.isInteger(value)) 
          return message || 'Debe ser un número entero';
        break;
      
      case 'custom':
        if (params.validator && !params.validator(value)) 
          return message || 'Valor inválido';
        break;
    }

    return null;
  }

  getErrors() {
    return this.errors;
  }

  showErrors() {
    // Limpiar errores anteriores
    this.clearErrors();

    // Mostrar nuevos errores
    for (const [field, errors] of Object.entries(this.errors)) {
      const input = this.form.elements[field];
      if (!input) continue;

      input.classList.add('error');
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.textContent = errors[0]; // Mostrar solo el primer error
      
      input.parentNode.appendChild(errorDiv);
    }
  }

  clearErrors() {
    this.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    this.form.querySelectorAll('.field-error').forEach(el => el.remove());
  }
}

export default validators;