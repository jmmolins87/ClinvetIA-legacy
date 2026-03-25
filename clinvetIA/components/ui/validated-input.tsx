/**
 * Validated Input Component
 *
 * Input component with built-in validation, error messages, and sanitization.
 * Supports real-time validation (onChange/onBlur) and custom validators.
 */

"use client";

import * as React from "react";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";
import {
  validateField,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeName,
  sanitizeHTML,
  type FieldValidationRules,
  type ValidationLocale,
  type ValidationResult,
} from "@/lib/validators";

// ============================================================================
// Types
// ============================================================================

export type SanitizerType = "string" | "email" | "phone" | "name" | "html" | "none";

export interface ValidatedInputProps
  extends Omit<React.ComponentProps<"input">, "onChange"> {
  /**
   * Field label
   */
  label?: string;

  /**
   * Validation rules
   */
  rules?: FieldValidationRules;

  /**
   * Locale for error messages (default: "es")
   */
  locale?: ValidationLocale;

  /**
   * When to validate
   */
  validateOn?: "blur" | "change" | "both";

  /**
   * Sanitizer to apply on blur
   */
  sanitizer?: SanitizerType;

  /**
   * Show error message below input
   */
  showError?: boolean;

  /**
   * Custom error message (overrides validation error)
   */
  errorMessage?: string;

  /**
   * Callback when value changes (after sanitization)
   */
  onChange?: (value: string) => void;

  /**
   * Callback when validation state changes
   */
  onValidationChange?: (result: ValidationResult) => void;

  /**
   * External validation error (controlled)
   */
  externalError?: string;

  /**
   * Helper text (shown when no error)
   */
  helperText?: string;
}

// ============================================================================
// Sanitizer Functions
// ============================================================================

function applySanitizer(value: string, sanitizer: SanitizerType): string {
  switch (sanitizer) {
    case "string":
      return sanitizeString(value);
    case "email":
      return sanitizeEmail(value);
    case "phone":
      return sanitizePhone(value);
    case "name":
      return sanitizeName(value);
    case "html":
      return sanitizeHTML(value);
    case "none":
    default:
      return value;
  }
}

// ============================================================================
// Component
// ============================================================================

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      label,
      rules,
      locale = "es",
      validateOn = "blur",
      sanitizer = "string",
      showError = true,
      errorMessage: customErrorMessage,
      onChange,
      onValidationChange,
      externalError,
      helperText,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState(props.value?.toString() || props.defaultValue?.toString() || "");
    const [error, setError] = React.useState<string | null>(null);
    const [touched, setTouched] = React.useState(false);
    const inputId = id || React.useId();

    // Controlled value support
    const currentValue = props.value !== undefined ? props.value.toString() : value;

    // Determine which error to show
    const displayError = customErrorMessage || externalError || error;

    // Validate function
    const validate = React.useCallback(
      (valueToValidate: string): ValidationResult => {
        if (!rules) {
          return { valid: true };
        }

        const result = validateField(valueToValidate, rules, locale);

        // Update error state
        setError(result.valid ? null : result.error || null);

        // Notify parent
        if (onValidationChange) {
          onValidationChange(result);
        }

        return result;
      },
      [rules, locale, onValidationChange]
    );

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Validate on change if enabled
      if (validateOn === "change" || validateOn === "both") {
        if (touched) {
          validate(newValue);
        }
      }

      // Notify parent
      if (onChange) {
        onChange(newValue);
      }
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);

      let finalValue = e.target.value;

      // Apply sanitizer
      if (sanitizer !== "none") {
        finalValue = applySanitizer(finalValue, sanitizer);
        setValue(finalValue);

        // Notify parent of sanitized value
        if (onChange && finalValue !== e.target.value) {
          onChange(finalValue);
        }
      }

      // Validate on blur if enabled
      if (validateOn === "blur" || validateOn === "both") {
        validate(finalValue);
      }

      // Call original onBlur if provided
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    // Expose validation method via ref
    React.useImperativeHandle(
      ref,
      () => {
        const input = document.getElementById(inputId) as HTMLInputElement;
        return {
          ...input,
          validate: () => validate(currentValue),
        };
      },
      [inputId, currentValue, validate]
    );

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId} className={cn(displayError && touched && "text-destructive")}>
            {label}
            {rules?.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}

        <Input
          {...props}
          id={inputId}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!displayError && touched}
          aria-describedby={
            displayError && touched
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={cn(
            displayError && touched && "border-destructive focus-visible:ring-destructive",
            className
          )}
        />

        {showError && displayError && touched && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {displayError}
          </p>
        )}

        {!displayError && helperText && (
          <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";
