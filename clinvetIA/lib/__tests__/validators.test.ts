/**
 * Validators Test Suite
 *
 * Comprehensive tests for all validation and sanitization functions.
 * Covers edge cases, locale support, and complex validation rules.
 */

import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePhone,
  validateFullName,
  validateURL,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeName,
  sanitizeHTML,
  validateField,
  type FieldValidationRules,
} from "@/lib/validators";

// ============================================================================
// Email Validation
// ============================================================================

describe("validateEmail", () => {
  describe("Valid emails", () => {
    it("should accept standard email format", () => {
      const result = validateEmail("user@example.com");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept email with subdomain", () => {
      const result = validateEmail("user@mail.example.com");
      expect(result.valid).toBe(true);
    });

    it("should accept email with plus sign", () => {
      const result = validateEmail("user+tag@example.com");
      expect(result.valid).toBe(true);
    });

    it("should accept email with dots in local part", () => {
      const result = validateEmail("first.last@example.com");
      expect(result.valid).toBe(true);
    });

    it("should accept email with numbers", () => {
      const result = validateEmail("user123@example.com");
      expect(result.valid).toBe(true);
    });
  });

  describe("Invalid emails", () => {
    it("should reject empty string", () => {
      const result = validateEmail("");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject email without @", () => {
      const result = validateEmail("userexample.com");
      expect(result.valid).toBe(false);
    });

    it("should reject email without domain", () => {
      const result = validateEmail("user@");
      expect(result.valid).toBe(false);
    });

    it("should reject email without local part", () => {
      const result = validateEmail("@example.com");
      expect(result.valid).toBe(false);
    });

    it("should reject email with spaces", () => {
      const result = validateEmail("user @example.com");
      expect(result.valid).toBe(false);
    });

    it("should reject email with multiple @", () => {
      const result = validateEmail("user@@example.com");
      expect(result.valid).toBe(false);
    });
  });

  describe("Common typos", () => {
    it("should suggest gmail.com for gnail.com", () => {
      const result = validateEmail("user@gnail.com");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("gmail.com");
    });

    it("should suggest gmail.com for gmai.com", () => {
      const result = validateEmail("user@gmai.com");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("gmail.com");
    });

    it("should suggest hotmail.com for hotmial.com", () => {
      const result = validateEmail("user@hotmial.com");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("hotmail.com");
    });

    it("should suggest outlook.com for outloo.com", () => {
      const result = validateEmail("user@outloo.com");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("outlook.com");
    });
  });

  describe("Locale support", () => {
    it("should return Spanish error message by default", () => {
      const result = validateEmail("invalid");
      expect(result.error).toContain("válid");
    });

    it("should return English error message when locale is 'en'", () => {
      const result = validateEmail("invalid", "en");
      expect(result.error).toContain("valid");
      expect(result.error).not.toContain("válid");
    });
  });
});

// ============================================================================
// Phone Validation
// ============================================================================

describe("validatePhone", () => {
  describe("Valid Spanish phone numbers", () => {
    it("should accept 9-digit mobile number", () => {
      const result = validatePhone("612345678");
      expect(result.valid).toBe(true);
    });

    it("should accept mobile number with spaces", () => {
      const result = validatePhone("612 34 56 78");
      expect(result.valid).toBe(true);
    });

    it("should accept mobile number with prefix", () => {
      const result = validatePhone("+34 612345678");
      expect(result.valid).toBe(true);
    });

    it("should accept mobile number with country code", () => {
      const result = validatePhone("0034612345678");
      expect(result.valid).toBe(true);
    });

    it("should accept landline starting with 9", () => {
      const result = validatePhone("912345678");
      expect(result.valid).toBe(true);
    });

    it("should accept landline starting with 8", () => {
      const result = validatePhone("812345678");
      expect(result.valid).toBe(true);
    });
  });

  describe("Invalid phone numbers", () => {
    it("should reject empty string", () => {
      const result = validatePhone("");
      expect(result.valid).toBe(false);
    });

    it("should reject too short number", () => {
      const result = validatePhone("12345");
      expect(result.valid).toBe(false);
    });

    it("should reject too long number", () => {
      const result = validatePhone("12345678901234");
      expect(result.valid).toBe(false);
    });

    it("should reject number with invalid starting digit", () => {
      const result = validatePhone("512345678");
      expect(result.valid).toBe(false);
    });

    it("should reject number with letters", () => {
      const result = validatePhone("61234abc8");
      expect(result.valid).toBe(false);
    });
  });

  describe("Locale support", () => {
    it("should return Spanish error message by default", () => {
      const result = validatePhone("123");
      expect(result.error).toContain("español");
    });

    it("should return English error message when locale is 'en'", () => {
      const result = validatePhone("123", "en");
      expect(result.error).toContain("Spanish");
    });
  });
});

// ============================================================================
// Full Name Validation
// ============================================================================

describe("validateFullName", () => {
  describe("Valid names", () => {
    it("should accept two-word name", () => {
      const result = validateFullName("Juan Pérez");
      expect(result.valid).toBe(true);
    });

    it("should accept three-word name", () => {
      const result = validateFullName("Juan Carlos Pérez");
      expect(result.valid).toBe(true);
    });

    it("should accept name with accents", () => {
      const result = validateFullName("José García");
      expect(result.valid).toBe(true);
    });

    it("should accept name with ñ", () => {
      const result = validateFullName("Señor Español");
      expect(result.valid).toBe(true);
    });

    it("should accept hyphenated name", () => {
      const result = validateFullName("María-José García");
      expect(result.valid).toBe(true);
    });

    it("should accept name with apostrophe", () => {
      const result = validateFullName("O'Brien Smith");
      expect(result.valid).toBe(true);
    });
  });

  describe("Invalid names", () => {
    it("should reject empty string", () => {
      const result = validateFullName("");
      expect(result.valid).toBe(false);
    });

    it("should reject single word", () => {
      const result = validateFullName("Juan");
      expect(result.valid).toBe(false);
    });

    it("should reject name with numbers", () => {
      const result = validateFullName("Juan 123");
      expect(result.valid).toBe(false);
    });

    it("should reject name with special characters", () => {
      const result = validateFullName("Juan @Pérez");
      expect(result.valid).toBe(false);
    });

    it("should reject name that is too short", () => {
      const result = validateFullName("A B");
      expect(result.valid).toBe(false);
    });
  });

  describe("Locale support", () => {
    it("should return Spanish error message by default", () => {
      const result = validateFullName("A");
      expect(result.error).toMatch(/nombre|apellido/i);
    });

    it("should return English error message when locale is 'en'", () => {
      const result = validateFullName("A", "en");
      expect(result.error).toMatch(/name/i);
    });
  });
});

// ============================================================================
// URL Validation
// ============================================================================

describe("validateURL", () => {
  describe("Valid URLs", () => {
    it("should accept standard HTTP URL", () => {
      const result = validateURL("http://example.com");
      expect(result.valid).toBe(true);
    });

    it("should accept HTTPS URL", () => {
      const result = validateURL("https://example.com");
      expect(result.valid).toBe(true);
    });

    it("should accept URL with path", () => {
      const result = validateURL("https://example.com/path");
      expect(result.valid).toBe(true);
    });

    it("should accept URL with query parameters", () => {
      const result = validateURL("https://example.com?foo=bar");
      expect(result.valid).toBe(true);
    });

    it("should accept URL with subdomain", () => {
      const result = validateURL("https://www.example.com");
      expect(result.valid).toBe(true);
    });

    it("should accept URL with port", () => {
      const result = validateURL("http://localhost:3000");
      expect(result.valid).toBe(true);
    });
  });

  describe("Invalid URLs", () => {
    it("should reject empty string", () => {
      const result = validateURL("");
      expect(result.valid).toBe(false);
    });

    it("should reject URL without protocol", () => {
      const result = validateURL("example.com");
      expect(result.valid).toBe(false);
    });

    it("should reject malformed URL", () => {
      const result = validateURL("not a url");
      expect(result.valid).toBe(false);
    });

    it("should reject URL with spaces", () => {
      const result = validateURL("http://example .com");
      expect(result.valid).toBe(false);
    });
  });

  describe("Locale support", () => {
    it("should return Spanish error message by default", () => {
      const result = validateURL("invalid");
      expect(result.error).toContain("válida");
    });

    it("should return English error message when locale is 'en'", () => {
      const result = validateURL("invalid", "en");
      expect(result.error).toContain("valid");
    });
  });
});

// ============================================================================
// Required Field Validation
// ============================================================================

describe("validateRequired", () => {
  it("should accept non-empty string", () => {
    const result = validateRequired("text");
    expect(result.valid).toBe(true);
  });

  it("should reject empty string", () => {
    const result = validateRequired("");
    expect(result.valid).toBe(false);
  });

  it("should reject whitespace-only string", () => {
    const result = validateRequired("   ");
    expect(result.valid).toBe(false);
  });

  it("should return Spanish error by default", () => {
    const result = validateRequired("");
    expect(result.error).toContain("obligatorio");
  });

  it("should return English error when locale is 'en'", () => {
    const result = validateRequired("", "en");
    expect(result.error).toContain("required");
  });
});

// ============================================================================
// Min Length Validation
// ============================================================================

describe("validateMinLength", () => {
  it("should accept string meeting min length", () => {
    const result = validateMinLength("hello", 5);
    expect(result.valid).toBe(true);
  });

  it("should accept string exceeding min length", () => {
    const result = validateMinLength("hello world", 5);
    expect(result.valid).toBe(true);
  });

  it("should reject string below min length", () => {
    const result = validateMinLength("hi", 5);
    expect(result.valid).toBe(false);
  });

  it("should include min length in error message", () => {
    const result = validateMinLength("hi", 5);
    expect(result.error).toContain("5");
  });

  it("should return Spanish error by default", () => {
    const result = validateMinLength("hi", 5);
    expect(result.error).toContain("caracteres");
  });

  it("should return English error when locale is 'en'", () => {
    const result = validateMinLength("hi", 5, "en");
    expect(result.error).toContain("character");
  });
});

// ============================================================================
// Max Length Validation
// ============================================================================

describe("validateMaxLength", () => {
  it("should accept string within max length", () => {
    const result = validateMaxLength("hello", 10);
    expect(result.valid).toBe(true);
  });

  it("should accept string at max length", () => {
    const result = validateMaxLength("hello", 5);
    expect(result.valid).toBe(true);
  });

  it("should reject string exceeding max length", () => {
    const result = validateMaxLength("hello world", 5);
    expect(result.valid).toBe(false);
  });

  it("should include max length in error message", () => {
    const result = validateMaxLength("hello world", 5);
    expect(result.error).toContain("5");
  });

  it("should return Spanish error by default", () => {
    const result = validateMaxLength("hello world", 5);
    expect(result.error).toContain("caracteres");
  });

  it("should return English error when locale is 'en'", () => {
    const result = validateMaxLength("hello world", 5, "en");
    expect(result.error).toContain("character");
  });
});

// ============================================================================
// String Sanitization
// ============================================================================

describe("sanitizeString", () => {
  it("should trim whitespace", () => {
    expect(sanitizeString("  hello  ")).toBe("hello");
  });

  it("should normalize multiple spaces to single space", () => {
    expect(sanitizeString("hello    world")).toBe("hello world");
  });

  it("should handle empty string", () => {
    expect(sanitizeString("")).toBe("");
  });

  it("should handle whitespace-only string", () => {
    expect(sanitizeString("   ")).toBe("");
  });

  it("should preserve single spaces", () => {
    expect(sanitizeString("hello world")).toBe("hello world");
  });

  it("should handle tabs and newlines", () => {
    expect(sanitizeString("hello\t\nworld")).toBe("hello world");
  });
});

// ============================================================================
// Email Sanitization
// ============================================================================

describe("sanitizeEmail", () => {
  it("should convert to lowercase", () => {
    expect(sanitizeEmail("USER@EXAMPLE.COM")).toBe("user@example.com");
  });

  it("should trim whitespace", () => {
    expect(sanitizeEmail("  user@example.com  ")).toBe("user@example.com");
  });

  it("should handle mixed case", () => {
    expect(sanitizeEmail("UsEr@ExAmPlE.CoM")).toBe("user@example.com");
  });

  it("should preserve plus signs", () => {
    expect(sanitizeEmail("user+tag@example.com")).toBe("user+tag@example.com");
  });
});

// ============================================================================
// Phone Sanitization
// ============================================================================

describe("sanitizePhone", () => {
  it("should remove spaces", () => {
    expect(sanitizePhone("612 34 56 78")).toBe("612345678");
  });

  it("should remove hyphens", () => {
    expect(sanitizePhone("612-34-56-78")).toBe("612345678");
  });

  it("should remove parentheses", () => {
    expect(sanitizePhone("(612) 345678")).toBe("612345678");
  });

  it("should remove dots", () => {
    expect(sanitizePhone("612.34.56.78")).toBe("612345678");
  });

  it("should preserve plus sign at start", () => {
    expect(sanitizePhone("+34 612 345 678")).toBe("+34612345678");
  });

  it("should handle mixed formatting", () => {
    expect(sanitizePhone("+34 (612) 34-56.78")).toBe("+34612345678");
  });
});

// ============================================================================
// Name Sanitization
// ============================================================================

describe("sanitizeName", () => {
  it("should trim whitespace", () => {
    expect(sanitizeName("  Juan Pérez  ")).toBe("Juan Pérez");
  });

  it("should normalize multiple spaces", () => {
    expect(sanitizeName("Juan    Pérez")).toBe("Juan Pérez");
  });

  it("should capitalize first letter of each word", () => {
    expect(sanitizeName("juan pérez")).toBe("Juan Pérez");
  });

  it("should handle all uppercase", () => {
    expect(sanitizeName("JUAN PÉREZ")).toBe("Juan Pérez");
  });

  it("should handle all lowercase", () => {
    expect(sanitizeName("juan pérez garcía")).toBe("Juan Pérez García");
  });

  it("should preserve hyphens", () => {
    expect(sanitizeName("maría-josé")).toBe("María-José");
  });

  it("should capitalize after hyphen", () => {
    expect(sanitizeName("maría-josé garcía")).toBe("María-José García");
  });

  it("should preserve apostrophes", () => {
    expect(sanitizeName("o'brien")).toBe("O'Brien");
  });
});

// ============================================================================
// HTML Sanitization
// ============================================================================

describe("sanitizeHTML", () => {
  it("should remove script tags", () => {
    expect(sanitizeHTML("<script>alert('xss')</script>")).toBe("");
  });

  it("should remove HTML tags", () => {
    expect(sanitizeHTML("<div>Hello</div>")).toBe("Hello");
  });

  it("should preserve plain text", () => {
    expect(sanitizeHTML("Hello World")).toBe("Hello World");
  });

  it("should decode HTML entities", () => {
    expect(sanitizeHTML("&lt;div&gt;")).toBe("<div>");
  });

  it("should handle mixed content", () => {
    expect(sanitizeHTML("Hello <b>World</b>!")).toBe("Hello World!");
  });

  it("should handle multiple tags", () => {
    expect(sanitizeHTML("<p>Hello</p><p>World</p>")).toBe("HelloWorld");
  });
});

// ============================================================================
// Composite Field Validation
// ============================================================================

describe("validateField", () => {
  it("should pass with no rules", () => {
    const result = validateField("test", {});
    expect(result.valid).toBe(true);
  });

  it("should validate required field", () => {
    const rules: FieldValidationRules = { required: true };
    expect(validateField("", rules).valid).toBe(false);
    expect(validateField("test", rules).valid).toBe(true);
  });

  it("should validate min length", () => {
    const rules: FieldValidationRules = { minLength: 5 };
    expect(validateField("hi", rules).valid).toBe(false);
    expect(validateField("hello", rules).valid).toBe(true);
  });

  it("should validate max length", () => {
    const rules: FieldValidationRules = { maxLength: 5 };
    expect(validateField("hello world", rules).valid).toBe(false);
    expect(validateField("hello", rules).valid).toBe(true);
  });

  it("should validate email with custom validator", () => {
    const rules: FieldValidationRules = { 
      custom: (value) => validateEmail(value) 
    };
    expect(validateField("invalid", rules).valid).toBe(false);
    expect(validateField("user@example.com", rules).valid).toBe(true);
  });

  it("should validate phone with custom validator", () => {
    const rules: FieldValidationRules = { 
      custom: (value) => validatePhone(value) 
    };
    expect(validateField("invalid", rules).valid).toBe(false);
    expect(validateField("612345678", rules).valid).toBe(true);
  });

  it("should validate fullName with custom validator", () => {
    const rules: FieldValidationRules = { 
      custom: (value) => validateFullName(value) 
    };
    expect(validateField("Single", rules).valid).toBe(false);
    expect(validateField("Juan Pérez", rules).valid).toBe(true);
  });

  it("should validate url with custom validator", () => {
    const rules: FieldValidationRules = { 
      custom: (value) => validateURL(value) 
    };
    expect(validateField("invalid", rules).valid).toBe(false);
    expect(validateField("https://example.com", rules).valid).toBe(true);
  });

  it("should validate with pattern", () => {
    const rules: FieldValidationRules = { pattern: /^\d{3}$/ };
    expect(validateField("12", rules).valid).toBe(false);
    expect(validateField("123", rules).valid).toBe(true);
  });

  it("should include custom pattern error message", () => {
    const rules: FieldValidationRules = {
      pattern: { value: /^\d{3}$/, message: "Must be 3 digits" },
    };
    const result = validateField("12", rules);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Must be 3 digits");
  });

  it("should use custom validator", () => {
    const rules: FieldValidationRules = {
      custom: (value) =>
        value === "secret" ? { valid: true } : { valid: false, error: "Wrong secret" },
    };
    expect(validateField("wrong", rules).valid).toBe(false);
    expect(validateField("secret", rules).valid).toBe(true);
  });

  it("should return first error when multiple rules fail", () => {
    const rules: FieldValidationRules = {
      required: true,
      minLength: 5,
    };
    const result = validateField("", rules);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("obligatorio");
  });

  it("should check all rules in order", () => {
    const rules: FieldValidationRules = {
      required: true,
      minLength: 10,
      custom: (value) => validateEmail(value),
    };
    // Empty - fails required
    expect(validateField("", rules).error).toContain("obligatorio");
    // Too short - fails minLength
    expect(validateField("a@b.co", rules).error).toContain("10");
    // Long enough but invalid email - fails custom
    expect(validateField("abcdefghij", rules).error).toContain("email");
    // All pass
    expect(validateField("test@example.com", rules).valid).toBe(true);
  });

  it("should support custom locale", () => {
    const rules: FieldValidationRules = { required: true };
    const resultES = validateField("", rules, "es");
    const resultEN = validateField("", rules, "en");
    expect(resultES.error).toContain("obligatorio");
    expect(resultEN.error).toContain("required");
  });
});
