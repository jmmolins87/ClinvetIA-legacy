/**
 * ValidatedInput Component Test Suite
 *
 * Tests for the validated input component with validation and sanitization.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ValidatedInput } from "@/components/ui/validated-input";
import { validateField } from "@/lib/validators";

describe("ValidatedInput", () => {
  describe("Rendering", () => {
    it("renders input with label", () => {
      render(
        <ValidatedInput label="Email" name="email" placeholder="Enter email" />
      );

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("renders without label when not provided", () => {
      render(<ValidatedInput name="email" placeholder="Enter email" />);

      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    });

    it("renders with placeholder", () => {
      render(<ValidatedInput name="email" placeholder="Enter email" />);

      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    });

    it("renders with required indicator when rules.required is true", () => {
      render(<ValidatedInput label="Email" name="email" rules={{ required: true }} />);

      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("renders with helper text", () => {
      render(
        <ValidatedInput
          name="email"
          helperText="We will never share your email"
        />
      );

      expect(screen.getByText("We will never share your email")).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("shows error on blur when invalid", async () => {
      render(
        <ValidatedInput
          label="Email"
          name="email"
          rules={{ required: true }}
          validateOn="blur"
        />
      );

      const input = screen.getByLabelText("Email");
      fireEvent.blur(input, { target: { value: "" } });

      await waitFor(() => {
        expect(screen.getByText(/obligatorio/i)).toBeInTheDocument();
      });
    });

    it("does not show error on blur when valid", async () => {
      render(
        <ValidatedInput
          label="Name"
          name="name"
          rules={{ minLength: 2 }}
          validateOn="blur"
        />
      );

      const input = screen.getByLabelText("Name");
      fireEvent.change(input, { target: { value: "John" } });
      fireEvent.blur(input, { target: { value: "John" } });

      await waitFor(() => {
        expect(screen.queryByText(/obligatorio/i)).not.toBeInTheDocument();
      });
    });

    it("validates on change when validateOn is 'change'", async () => {
      render(
        <ValidatedInput
          label="Email"
          name="email"
          rules={{ required: true }}
          validateOn="change"
        />
      );

      const input = screen.getByLabelText("Email");
      fireEvent.change(input, { target: { value: "test" } });

      await waitFor(() => {
        expect(screen.getByText(/email/i)).toBeInTheDocument();
      });
    });

    it("shows custom error message", async () => {
      render(
        <ValidatedInput
          label="Name"
          name="name"
          rules={{ required: "Este campo es muy importante" }}
          validateOn="blur"
        />
      );

      const input = screen.getByLabelText("Name");
      fireEvent.blur(input, { target: { value: "" } });

      await waitFor(() => {
        expect(screen.getByText("Este campo es muy importante")).toBeInTheDocument();
      });
    });

    it("calls onChange callback", () => {
      const onChange = vi.fn();

      render(
        <ValidatedInput
          label="Email"
          name="email"
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText("Email");
      fireEvent.change(input, { target: { value: "test@example.com" } });

      expect(onChange).toHaveBeenCalledWith("test@example.com");
    });

    it("calls onValidationChange callback", async () => {
      const onValidationChange = vi.fn();

      render(
        <ValidatedInput
          label="Email"
          name="email"
          rules={{ required: true }}
          onValidationChange={onValidationChange}
          validateOn="blur"
        />
      );

      const input = screen.getByLabelText("Email");
      fireEvent.blur(input, { target: { value: "" } });

      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalledWith(
          expect.objectContaining({ valid: false })
        );
      });
    });
  });

  describe("Sanitization", () => {
    it("sanitizes on blur with 'string' sanitizer", async () => {
      const onChange = vi.fn();

      render(
        <ValidatedInput
          label="Name"
          name="name"
          sanitizer="string"
          onChange={onChange}
          validateOn="blur"
        />
      );

      const input = screen.getByLabelText("Name");
      fireEvent.change(input, { target: { value: "  John  " } });
      fireEvent.blur(input, { target: { value: "  John  " } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith("John");
      });
    });

    it("sanitizes email on blur with 'email' sanitizer", async () => {
      const onChange = vi.fn();

      render(
        <ValidatedInput
          label="Email"
          name="email"
          sanitizer="email"
          onChange={onChange}
          validateOn="blur"
        />
      );

      const input = screen.getByLabelText("Email");
      fireEvent.change(input, { target: { value: "TEST@EXAMPLE.COM" } });
      fireEvent.blur(input, { target: { value: "TEST@EXAMPLE.COM" } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith("test@example.com");
      });
    });

    it("sanitizes phone on blur with 'phone' sanitizer", async () => {
      const onChange = vi.fn();

      render(
        <ValidatedInput
          label="Phone"
          name="phone"
          sanitizer="phone"
          onChange={onChange}
          validateOn="blur"
        />
      );

      const input = screen.getByLabelText("Phone");
      fireEvent.change(input, { target: { value: "612 34 56 78" } });
      fireEvent.blur(input, { target: { value: "612 34 56 78" } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith("612345678");
      });
    });

    it("sanitizes name on blur with 'name' sanitizer", async () => {
      const onChange = vi.fn();

      render(
        <ValidatedInput
          label="Name"
          name="name"
          sanitizer="name"
          onChange={onChange}
          validateOn="blur"
        />
      );

      const input = screen.getByLabelText("Name");
      fireEvent.change(input, { target: { value: "john doe" } });
      fireEvent.blur(input, { target: { value: "john doe" } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith("John Doe");
      });
    });

    it("does not sanitize when sanitizer is 'none'", async () => {
      const onChange = vi.fn();

      render(
        <ValidatedInput
          label="Name"
          name="name"
          sanitizer="none"
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText("Name");
      fireEvent.change(input, { target: { value: "  John  " } });
      fireEvent.blur(input, { target: { value: "  John  " } });

      await waitFor(() => {
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("sets aria-invalid when there's an error", async () => {
      render(
        <ValidatedInput
          label="Email"
          name="email"
          rules={{ required: true }}
          validateOn="blur"
        />
      );

      const input = screen.getByLabelText("Email");
      fireEvent.blur(input, { target: { value: "" } });

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("sets aria-describedby with error message id", async () => {
      render(
        <ValidatedInput
          label="Email"
          name="email"
          rules={{ required: true }}
          validateOn="blur"
        />
      );

      const input = screen.getByLabelText("Email");
      fireEvent.blur(input, { target: { value: "" } });

      await waitFor(() => {
        expect(input).toHaveAttribute(
          "aria-describedby",
          expect.stringContaining("-error")
        );
      });
    });

    it("shows error with role='alert'", async () => {
      render(
        <ValidatedInput
          label="Email"
          name="email"
          rules={{ required: true }}
          validateOn="blur"
        />
      );

      const input = screen.getByLabelText("Email");
      fireEvent.blur(input, { target: { value: "" } });

      await waitFor(() => {
        const error = screen.getByRole("alert");
        expect(error).toBeInTheDocument();
      });
    });
  });

  describe("Controlled mode", () => {
    it("uses controlled value when provided", () => {
      render(
        <ValidatedInput
          label="Email"
          name="email"
          value="controlled@example.com"
        />
      );

      const input = screen.getByLabelText("Email") as HTMLInputElement;
      expect(input.value).toBe("controlled@example.com");
    });

    it("shows external error when provided", () => {
      render(
        <ValidatedInput
          label="Email"
          name="email"
          externalError="This is an external error"
        />
      );

      expect(screen.getByText("This is an external error")).toBeInTheDocument();
    });
  });

  describe("Disabled state", () => {
    it("disables input when disabled prop is true", () => {
      render(<ValidatedInput name="email" disabled />);

      const input = screen.getByLabelText(/email/i);
      expect(input).toBeDisabled();
    });
  });
});
