/**
 * Form Validation Utilities - Enhanced Version
 *
 * Provides comprehensive validation with:
 * - Typed validation results
 * - Custom error messages (ES/EN)
 * - Field-specific validators
 * - Sanitization functions
 * - Composable validators
 */

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export type ValidatorFunction = (value: string) => ValidationResult;

export interface FieldValidationRules {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  custom?: ValidatorFunction;
}

export type ValidationLocale = "es" | "en";

// ============================================================================
// Constants
// ============================================================================

const ERROR_MESSAGES = {
  es: {
    required: "Este campo es obligatorio",
    email: "Introduce un email válido",
    phone: "Introduce un teléfono español válido (9 dígitos)",
    phoneInvalidFormat: "El teléfono debe empezar por 6, 7, 8 o 9",
    minLength: (min: number) => `Mínimo ${min} caracteres`,
    maxLength: (max: number) => `Máximo ${max} caracteres`,
    fullName: "Introduce nombre y apellido completos",
    noNumbers: "No puede contener números",
    noSpecialChars: "No puede contener caracteres especiales",
    url: "Introduce una URL válida",
    emailTypo: (suggestion: string) => `¿Quisiste decir ${suggestion}?`,
  },
  en: {
    required: "This field is required",
    email: "Enter a valid email",
    phone: "Enter a valid Spanish phone (9 digits)",
    phoneInvalidFormat: "Phone must start with 6, 7, 8 or 9",
    minLength: (min: number) => `Minimum ${min} characters`,
    maxLength: (max: number) => `Maximum ${max} characters`,
    fullName: "Enter full name and surname",
    noNumbers: "Cannot contain numbers",
    noSpecialChars: "Cannot contain special characters",
    url: "Enter a valid URL",
    emailTypo: (suggestion: string) => `Did you mean ${suggestion}?`,
  },
};

/**
 * Common email typos to detect and suggest corrections
 */
const EMAIL_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmil.com": "gmail.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
};

// ============================================================================
// Core Validators
// ============================================================================

/**
 * Validate email with typo detection
 */
export function validateEmail(
  email: string,
  locale: ValidationLocale = "es"
): ValidationResult {
  if (!email || typeof email !== "string") {
    return { valid: false, error: ERROR_MESSAGES[locale].required };
  }

  const trimmed = email.trim();

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: ERROR_MESSAGES[locale].email };
  }

  // Check for common typos
  const domain = trimmed.split("@")[1];
  if (domain && EMAIL_TYPOS[domain.toLowerCase()]) {
    const suggestion = trimmed.split("@")[0] + "@" + EMAIL_TYPOS[domain.toLowerCase()];
    return {
      valid: false,
      error: ERROR_MESSAGES[locale].emailTypo(suggestion),
    };
  }

  return { valid: true };
}

/**
 * Validate Spanish phone number
 * Formats accepted:
 * - +34 XXX XXX XXX
 * - 0034 XXX XXX XXX
 * - XXX XXX XXX (9 digits starting with 6, 7, 8, or 9)
 */
export function validatePhone(
  phone: string,
  locale: ValidationLocale = "es"
): ValidationResult {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: ERROR_MESSAGES[locale].required };
  }

  // Remove all spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Spanish phone format
  const phoneRegex = /^(\+34|0034)?[6-9]\d{8}$/;

  if (!phoneRegex.test(cleaned)) {
    // Check if it's 9 digits but doesn't start with 6-9
    const nineDigits = /^\d{9}$/;
    if (nineDigits.test(cleaned)) {
      return { valid: false, error: ERROR_MESSAGES[locale].phoneInvalidFormat };
    }

    return { valid: false, error: ERROR_MESSAGES[locale].phone };
  }

  return { valid: true };
}

/**
 * Validate full name (at least 2 words, no numbers)
 */
export function validateFullName(
  name: string,
  locale: ValidationLocale = "es"
): ValidationResult {
  if (!name || typeof name !== "string") {
    return { valid: false, error: ERROR_MESSAGES[locale].required };
  }

  const trimmed = name.trim();

  // At least 2 characters
  if (trimmed.length < 2) {
    return { valid: false, error: ERROR_MESSAGES[locale].minLength(2) };
  }

  // At least 2 words (name + surname)
  const words = trimmed.split(/\s+/);
  if (words.length < 2) {
    return { valid: false, error: ERROR_MESSAGES[locale].fullName };
  }

  // No numbers allowed
  if (/\d/.test(trimmed)) {
    return { valid: false, error: ERROR_MESSAGES[locale].noNumbers };
  }

  return { valid: true };
}

/**
 * Validate URL format
 */
export function validateURL(url: string, locale: ValidationLocale = "es"): ValidationResult {
  if (!url || typeof url !== "string") {
    return { valid: false, error: ERROR_MESSAGES[locale].required };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: ERROR_MESSAGES[locale].url };
  }
}

/**
 * Validate required field
 */
export function validateRequired(
  value: string,
  locale: ValidationLocale = "es"
): ValidationResult {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    return { valid: false, error: ERROR_MESSAGES[locale].required };
  }

  return { valid: true };
}

/**
 * Validate minimum length
 */
export function validateMinLength(
  value: string,
  min: number,
  locale: ValidationLocale = "es"
): ValidationResult {
  if (!value || typeof value !== "string") {
    return { valid: false, error: ERROR_MESSAGES[locale].required };
  }

  if (value.trim().length < min) {
    return { valid: false, error: ERROR_MESSAGES[locale].minLength(min) };
  }

  return { valid: true };
}

/**
 * Validate maximum length
 */
export function validateMaxLength(
  value: string,
  max: number,
  locale: ValidationLocale = "es"
): ValidationResult {
  if (!value || typeof value !== "string") {
    return { valid: true }; // Empty is ok for maxLength
  }

  if (value.trim().length > max) {
    return { valid: false, error: ERROR_MESSAGES[locale].maxLength(max) };
  }

  return { valid: true };
}

/**
 * Validate against regex pattern
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  errorMessage: string
): ValidationResult {
  if (!value || typeof value !== "string") {
    return { valid: true }; // Empty is ok for pattern (use required separately)
  }

  if (!pattern.test(value)) {
    return { valid: false, error: errorMessage };
  }

  return { valid: true };
}

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Sanitize string input (trim, remove extra spaces)
 */
export function sanitizeString(value: string): string {
  if (!value || typeof value !== "string") return "";
  
  // Trim and collapse multiple spaces
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Sanitize email (lowercase, trim)
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";
  
  return email.trim().toLowerCase();
}

/**
 * Sanitize phone (remove formatting, keep only digits and +)
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== "string") return "";
  
  // Remove spaces, dashes, parentheses
  return phone.replace(/[\s\-()]/g, "");
}

/**
 * Sanitize name (trim, capitalize first letter of each word)
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== "string") return "";
  
  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Remove HTML tags and potentially dangerous characters
 */
export function sanitizeHTML(value: string): string {
  if (!value || typeof value !== "string") return "";
  
  return value
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>]/g, "") // Remove < and >
    .trim();
}

/**
 * Sanitize number input (remove non-numeric characters except decimal)
 */
export function sanitizeNumber(value: string): string {
  if (!value || typeof value !== "string") return "";
  
  return value.replace(/[^\d.]/g, "");
}

// ============================================================================
// Composite Validators
// ============================================================================

/**
 * Validate field with multiple rules
 */
export function validateField(
  value: string,
  rules: FieldValidationRules,
  locale: ValidationLocale = "es"
): ValidationResult {
  // Check required
  if (rules.required) {
    const result = validateRequired(value, locale);
    if (!result.valid) {
      const customMessage = typeof rules.required === "string" ? rules.required : undefined;
      return { valid: false, error: customMessage || result.error };
    }
  }

  // If empty and not required, it's valid
  if (!value || value.trim().length === 0) {
    return { valid: true };
  }

  // Check minLength
  if (rules.minLength) {
    const min = typeof rules.minLength === "number" ? rules.minLength : rules.minLength.value;
    const result = validateMinLength(value, min, locale);
    if (!result.valid) {
      const customMessage =
        typeof rules.minLength === "object" ? rules.minLength.message : undefined;
      return { valid: false, error: customMessage || result.error };
    }
  }

  // Check maxLength
  if (rules.maxLength) {
    const max = typeof rules.maxLength === "number" ? rules.maxLength : rules.maxLength.value;
    const result = validateMaxLength(value, max, locale);
    if (!result.valid) {
      const customMessage =
        typeof rules.maxLength === "object" ? rules.maxLength.message : undefined;
      return { valid: false, error: customMessage || result.error };
    }
  }

  // Check pattern
  if (rules.pattern) {
    const pattern = rules.pattern instanceof RegExp ? rules.pattern : rules.pattern.value;
    const message =
      rules.pattern instanceof RegExp ? "Invalid format" : rules.pattern.message;
    const result = validatePattern(value, pattern, message);
    if (!result.valid) {
      return result;
    }
  }

  // Check custom validator
  if (rules.custom) {
    return rules.custom(value);
  }

  return { valid: true };
}

// ============================================================================
// Legacy Compatibility (keep existing exports)
// ============================================================================

export function isValidEmail(email: string): boolean {
  return validateEmail(email).valid;
}

export function isValidPhone(phone: string): boolean {
  return validatePhone(phone).valid;
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

export function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isValidPositiveNumber(value: unknown): value is number {
  return isValidNumber(value) && value > 0;
}

export function isValidPercentage(value: unknown): value is number {
  return isValidNumber(value) && value >= 0 && value <= 100;
}
