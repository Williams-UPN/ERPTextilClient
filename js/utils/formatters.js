// formatters.js - Funciones de formateo de datos

// Formatear fecha
export function formatDate(date, format = 'DD/MM/YYYY') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d)) return '';

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'DD/MM/YYYY HH:mm:ss':
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    case 'HH:mm':
      return `${hours}:${minutes}`;
    case 'HH:mm:ss':
      return `${hours}:${minutes}:${seconds}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

// Formatear moneda
export function formatCurrency(amount, currency = 'PEN', decimals = 2) {
  if (isNaN(amount)) return '';
  
  const symbols = {
    PEN: 'S/',
    USD: '$',
    EUR: '€'
  };

  const symbol = symbols[currency] || currency;
  const formatted = Number(amount).toFixed(decimals);
  
  return `${symbol} ${formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// Formatear número con separadores de miles
export function formatNumber(number, decimals = 0) {
  if (isNaN(number)) return '';
  
  return Number(number)
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Formatear porcentaje
export function formatPercentage(value, decimals = 2) {
  if (isNaN(value)) return '';
  
  return `${Number(value).toFixed(decimals)}%`;
}

// Formatear teléfono
export function formatPhone(phone) {
  if (!phone) return '';
  
  // Remover caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatear según longitud
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  }
  
  return phone;
}

// Formatear código de producto
export function formatProductCode(code) {
  if (!code) return '';
  
  // Asegurar formato XXX-000
  const parts = code.split('-');
  if (parts.length === 2) {
    return `${parts[0].toUpperCase()}-${parts[1].padStart(3, '0')}`;
  }
  
  return code.toUpperCase();
}

// Formatear peso/medida
export function formatWeight(weight, unit = 'kg', decimals = 2) {
  if (isNaN(weight)) return '';
  
  return `${Number(weight).toFixed(decimals)} ${unit}`;
}

// Formatear tiempo transcurrido
export function formatTimeAgo(date) {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Hace un momento';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
  }
}

// Formatear duración en segundos
export function formatDuration(seconds) {
  if (isNaN(seconds)) return '';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

// Formatear tamaño de archivo
export function formatFileSize(bytes) {
  if (isNaN(bytes)) return '';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Formatear nombre completo
export function formatFullName(firstName, lastName) {
  const parts = [];
  if (firstName) parts.push(firstName.trim());
  if (lastName) parts.push(lastName.trim());
  
  return parts.join(' ');
}

// Capitalizar primera letra
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Capitalizar cada palabra
export function capitalizeWords(str) {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
}

// Truncar texto
export function truncate(str, maxLength = 50, suffix = '...') {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

export default {
  formatDate,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatPhone,
  formatProductCode,
  formatWeight,
  formatTimeAgo,
  formatDuration,
  formatFileSize,
  formatFullName,
  capitalize,
  capitalizeWords,
  truncate
};