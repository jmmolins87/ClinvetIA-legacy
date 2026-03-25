/**
 * useForm Hook
 *
 * Manages form state with validation, sanitization, and error handling.
 * Works with ValidatedInput components or any custom validation logic.
 */

"use client";

import { useState, useCallback, useRef } from "react";
import {
  validateField,
  type FieldValidationRules,
  type ValidationLocale,
  type ValidationResult,
} from "@/lib/validators";

// ============================================================================
// Types
// ============================================================================

export interface FormFieldConfig {
  rules?: FieldValidationRules;
  sanitizer?: (value: string) => string;
}

export interface FormConfig<T extends Record<string, any>> {
  initialValues: T;
  fields?: Partial<Record<keyof T, FormFieldConfig>>;
  locale?: ValidationLocale;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FormField<T> {
  value: T;
  error: string | null;
  touched: boolean;
  validate: () => ValidationResult;
  setValue: (value: T) => void;
  setError: (error: string | null) => void;
  setTouched: (touched: boolean) => void;
}

export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string | null>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;

  // Field methods
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string | null) => void;
  setTouched: <K extends keyof T>(field: K, touched: boolean) => void;

  // Form methods
  validateField: <K extends keyof T>(field: K) => ValidationResult;
  validateForm: () => boolean;
  handleChange: <K extends keyof T>(field: K) => (value: string) => void;
  handleBlur: <K extends keyof T>(field: K) => () => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: Partial<T>) => void;
  setValues: (newValues: Partial<T>) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useForm<T extends Record<string, any>>(
  config: FormConfig<T>
): UseFormReturn<T> {
  const {
    initialValues,
    fields = {},
    locale = "es",
    validateOnChange = false,
    validateOnBlur = true,
  } = config;

  // State
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string | null>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store initial values to detect if form is dirty
  const initialValuesRef = useRef(initialValues);

  // Computed values
  const isValid = Object.values(errors).every((error) => !error);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);

  // ============================================================================
  // Field Methods
  // ============================================================================

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setError = useCallback(<K extends keyof T>(field: K, error: string | null) => {
    setErrorsState((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setTouched = useCallback(<K extends keyof T>(field: K, touchedValue: boolean) => {
    setTouchedState((prev) => ({ ...prev, [field]: touchedValue }));
  }, []);

  // ============================================================================
  // Validation Methods
  // ============================================================================

  const validateFieldFn = useCallback(
    <K extends keyof T>(field: K): ValidationResult => {
      const fieldConfig = (fields as Partial<Record<keyof T, FormFieldConfig>>)[field];
      const value = values[field];

      if (!fieldConfig?.rules) {
        return { valid: true };
      }

      // Convert value to string for validation
      const stringValue = value?.toString() || "";

      const result = validateField(stringValue, fieldConfig.rules, locale);

      // Update error state
      setError(field, result.valid ? null : result.error || null);

      return result;
    },
    [fields, values, locale, setError]
  );

  const validateForm = useCallback((): boolean => {
    let allValid = true;

    // Validate all fields that have rules
    Object.keys(fields).forEach((fieldKey) => {
      const field = fieldKey as keyof T;
      const result = validateFieldFn(field);

      if (!result.valid) {
        allValid = false;
      }

      // Mark as touched
      setTouched(field, true);
    });

    return allValid;
  }, [fields, validateFieldFn, setTouched]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleChange = useCallback(
    <K extends keyof T>(field: K) =>
      (value: string) => {
        setValue(field, value as T[K]);

        // Validate on change if enabled and field is touched
        if (validateOnChange && touched[field]) {
          validateFieldFn(field);
        }
      },
    [setValue, validateOnChange, touched, validateFieldFn]
  );

  const handleBlur = useCallback(
    <K extends keyof T>(field: K) =>
      () => {
        setTouched(field, true);

        // Apply sanitizer if configured
        const fieldConfig = (fields as Partial<Record<keyof T, FormFieldConfig>>)[field];
        if (fieldConfig?.sanitizer) {
          const currentValue = values[field];
          const stringValue = currentValue?.toString() || "";
          const sanitized = fieldConfig.sanitizer(stringValue);

          if (sanitized !== stringValue) {
            setValue(field, sanitized as T[K]);
          }
        }

        // Validate on blur if enabled
        if (validateOnBlur) {
          validateFieldFn(field);
        }
      },
    [setTouched, fields, values, setValue, validateOnBlur, validateFieldFn]
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) =>
      async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        // Validate entire form
        const formIsValid = validateForm();

        if (!formIsValid) {
          return;
        }

        // Submit
        setIsSubmitting(true);

        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      },
    [validateForm, values]
  );

  // ============================================================================
  // Form Methods
  // ============================================================================

  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues
      ? { ...initialValues, ...newValues }
      : initialValues;

    setValuesState(resetValues);
    setErrorsState({});
    setTouchedState({});
    setIsSubmitting(false);

    // Update initial values ref if new values provided
    if (newValues) {
      initialValuesRef.current = resetValues;
    }
  }, [initialValues]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,

    setValue,
    setError,
    setTouched,

    validateField: validateFieldFn,
    validateForm,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setIsSubmitting,
  };
}
