/**
 * useForm Hook Test Suite
 *
 * Tests form state management, validation, and sanitization.
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useForm, type FormConfig } from "@/hooks/useForm";
import { validateEmail } from "@/lib/validators";

// ============================================================================
// Basic Form State
// ============================================================================

describe("useForm - Basic State", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "John", email: "" },
      })
    );

    expect(result.current.values).toEqual({ name: "John", email: "" });
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isValid).toBe(true);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should update field value", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "" },
      })
    );

    act(() => {
      result.current.setValue("name", "Jane");
    });

    expect(result.current.values.name).toBe("Jane");
    expect(result.current.isDirty).toBe(true);
  });

  it("should set field error", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: "" },
      })
    );

    act(() => {
      result.current.setError("email", "Invalid email");
    });

    expect(result.current.errors.email).toBe("Invalid email");
    expect(result.current.isValid).toBe(false);
  });

  it("should set field touched", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "" },
      })
    );

    act(() => {
      result.current.setTouched("name", true);
    });

    expect(result.current.touched.name).toBe(true);
  });

  it("should set multiple values at once", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "", email: "" },
      })
    );

    act(() => {
      result.current.setValues({ name: "John", email: "john@example.com" });
    });

    expect(result.current.values.name).toBe("John");
    expect(result.current.values.email).toBe("john@example.com");
  });
});

// ============================================================================
// Validation
// ============================================================================

describe("useForm - Validation", () => {
  it("should validate required field", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "" },
        fields: {
          name: { rules: { required: true } },
        },
      })
    );

    act(() => {
      const validationResult = result.current.validateField("name");
      expect(validationResult.valid).toBe(false);
    });

    expect(result.current.errors.name).toBeDefined();
    expect(result.current.isValid).toBe(false);
  });

  it("should validate field with custom validator", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: "invalid" },
        fields: {
          email: {
            rules: { custom: (value) => validateEmail(value) },
          },
        },
      })
    );

    act(() => {
      result.current.validateField("email");
    });

    expect(result.current.errors.email).toBeDefined();
    expect(result.current.isValid).toBe(false);
  });

  it("should validate min length", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { password: "123" },
        fields: {
          password: { rules: { minLength: 8 } },
        },
      })
    );

    act(() => {
      result.current.validateField("password");
    });

    expect(result.current.errors.password).toContain("8");
  });

  it("should validate max length", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { username: "verylongusername" },
        fields: {
          username: { rules: { maxLength: 10 } },
        },
      })
    );

    act(() => {
      result.current.validateField("username");
    });

    expect(result.current.errors.username).toContain("10");
  });

  it("should validate pattern", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { code: "ABC" },
        fields: {
          code: { rules: { pattern: /^\d{3}$/ } },
        },
      })
    );

    act(() => {
      result.current.validateField("code");
    });

    expect(result.current.errors.code).toBeDefined();
  });

  it("should validate entire form", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "", email: "" },
        fields: {
          name: { rules: { required: true } },
          email: { rules: { required: true } },
        },
      })
    );

    act(() => {
      const isValid = result.current.validateForm();
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.email).toBeDefined();
    expect(result.current.touched.name).toBe(true);
    expect(result.current.touched.email).toBe(true);
  });

  it("should clear errors when field becomes valid", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: "" },
        fields: {
          email: { rules: { custom: (value) => validateEmail(value) } },
        },
      })
    );

    // First validate with invalid value
    act(() => {
      result.current.validateField("email");
    });
    expect(result.current.errors.email).toBeDefined();

    // Update to valid value and validate again
    act(() => {
      result.current.setValue("email", "test@example.com");
      result.current.validateField("email");
    });

    expect(result.current.errors.email).toBeNull();
    expect(result.current.isValid).toBe(true);
  });
});

// ============================================================================
// Sanitization
// ============================================================================

describe("useForm - Sanitization", () => {
  it("should apply sanitizer on blur", () => {
    const sanitizer = vi.fn((value: string) => value.trim());

    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "  John  " },
        fields: {
          name: { sanitizer },
        },
      })
    );

    act(() => {
      const handleBlur = result.current.handleBlur("name");
      handleBlur();
    });

    expect(sanitizer).toHaveBeenCalledWith("  John  ");
    expect(result.current.values.name).toBe("John");
  });

  it("should not apply sanitizer on change", () => {
    const sanitizer = vi.fn((value: string) => value.trim());

    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "" },
        fields: {
          name: { sanitizer },
        },
      })
    );

    act(() => {
      const handleChange = result.current.handleChange("name");
      handleChange("  John  ");
    });

    expect(sanitizer).not.toHaveBeenCalled();
    expect(result.current.values.name).toBe("  John  ");
  });
});

// ============================================================================
// Event Handlers
// ============================================================================

describe("useForm - Event Handlers", () => {
  it("should handle change event", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "" },
      })
    );

    act(() => {
      const handleChange = result.current.handleChange("name");
      handleChange("Jane");
    });

    expect(result.current.values.name).toBe("Jane");
  });

  it("should validate on change when enabled and field is touched", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: "" },
        fields: {
          email: { rules: { custom: (value) => validateEmail(value) } },
        },
        validateOnChange: true,
      })
    );

    // First touch the field
    act(() => {
      result.current.setTouched("email", true);
    });

    // Then change it
    act(() => {
      const handleChange = result.current.handleChange("email");
      handleChange("invalid");
    });

    expect(result.current.errors.email).toBeDefined();
  });

  it("should not validate on change when field is not touched", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: "" },
        fields: {
          email: { rules: { custom: (value) => validateEmail(value) } },
        },
        validateOnChange: true,
      })
    );

    act(() => {
      const handleChange = result.current.handleChange("email");
      handleChange("invalid");
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it("should handle blur event", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "" },
        fields: {
          name: { rules: { required: true } },
        },
      })
    );

    act(() => {
      const handleBlur = result.current.handleBlur("name");
      handleBlur();
    });

    expect(result.current.touched.name).toBe(true);
    expect(result.current.errors.name).toBeDefined();
  });

  it("should validate on blur when enabled", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: "invalid" },
        fields: {
          email: { rules: { custom: (value) => validateEmail(value) } },
        },
        validateOnBlur: true,
      })
    );

    act(() => {
      const handleBlur = result.current.handleBlur("email");
      handleBlur();
    });

    expect(result.current.errors.email).toBeDefined();
  });

  it("should not validate on blur when disabled", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: "invalid" },
        fields: {
          email: { rules: { custom: (value) => validateEmail(value) } },
        },
        validateOnBlur: false,
      })
    );

    act(() => {
      const handleBlur = result.current.handleBlur("email");
      handleBlur();
    });

    expect(result.current.errors.email).toBeUndefined();
  });
});

// ============================================================================
// Form Submission
// ============================================================================

describe("useForm - Submission", () => {
  it("should submit form when valid", async () => {
    const onSubmit = vi.fn();

    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "John" },
        fields: {
          name: { rules: { required: true } },
        },
      })
    );

    await act(async () => {
      const handleSubmit = result.current.handleSubmit(onSubmit);
      await handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: "John" });
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should not submit form when invalid", async () => {
    const onSubmit = vi.fn();

    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "" },
        fields: {
          name: { rules: { required: true } },
        },
      })
    );

    await act(async () => {
      const handleSubmit = result.current.handleSubmit(onSubmit);
      await handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBeDefined();
  });

  it("should set isSubmitting during submission", async () => {
    const onSubmit = async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "John" },
      })
    );

    const submitPromise = act(async () => {
      const handleSubmit = result.current.handleSubmit(onSubmit);
      await handleSubmit();
    });

    // Check that isSubmitting is true during submission
    expect(result.current.isSubmitting).toBe(true);

    await submitPromise;

    expect(result.current.isSubmitting).toBe(false);
  });

  it("should handle async submission errors", async () => {
    let submitCalled = false;
    const onSubmit = async () => {
      submitCalled = true;
      throw new Error("Submit failed");
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "John" },
      })
    );

    await act(async () => {
      const handleSubmit = result.current.handleSubmit(onSubmit);
      await handleSubmit().catch(() => {
        // Expected to throw
      });
    });

    expect(submitCalled).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
  });
});

// ============================================================================
// Form Reset
// ============================================================================

describe("useForm - Reset", () => {
  it("should reset form to initial values", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "John", email: "john@example.com" },
      })
    );

    // Change values
    act(() => {
      result.current.setValue("name", "Jane");
      result.current.setError("name", "Error");
      result.current.setTouched("name", true);
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual({
      name: "John",
      email: "john@example.com",
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isDirty).toBe(false);
  });

  it("should reset form to new values", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "John" },
      })
    );

    act(() => {
      result.current.reset({ name: "Jane" });
    });

    expect(result.current.values.name).toBe("Jane");
    expect(result.current.isDirty).toBe(false);
  });
});

// ============================================================================
// Locale Support
// ============================================================================

describe("useForm - Locale", () => {
  it("should use Spanish locale by default", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "" },
        fields: {
          name: { rules: { required: true } },
        },
      })
    );

    act(() => {
      result.current.validateField("name");
    });

    expect(result.current.errors.name).toContain("obligatorio");
  });

  it("should use English locale when specified", () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "" },
        fields: {
          name: { rules: { required: true } },
        },
        locale: "en",
      })
    );

    act(() => {
      result.current.validateField("name");
    });

    expect(result.current.errors.name).toContain("required");
  });
});
