/**
 * Error Messages Tests
 *
 * Tests error message catalog and helper functions
 */

import { describe, it, expect } from "vitest";
import {
  getErrorMessage,
  getErrorTitle,
  getErrorDescription,
  getErrorAction,
  hasErrorAction,
  getNetworkErrorMessage,
  getTimeoutErrorMessage,
  getValidationErrorMessage,
} from "../errorMessages";
import type { ApiError } from "@/services/api/bookings";

describe("errorMessages", () => {
  describe("getErrorMessage", () => {
    it("should return Spanish error message by default", () => {
      const error: ApiError = {
        ok: false,
        code: "NETWORK_ERROR",
        message: "Network failed",
      };

      const message = getErrorMessage(error);

      expect(message.title).toBe("Sin conexión");
      expect(message.description).toContain("conexión a internet");
      expect(message.action).toBe("Reintentar");
    });

    it("should return English error message when specified", () => {
      const error: ApiError = {
        ok: false,
        code: "NETWORK_ERROR",
        message: "Network failed",
      };

      const message = getErrorMessage(error, "en");

      expect(message.title).toBe("No connection");
      expect(message.description).toContain("internet connection");
      expect(message.action).toBe("Retry");
    });

    it("should return UNKNOWN_ERROR for unrecognized codes", () => {
      const error: ApiError = {
        ok: false,
        code: "UNRECOGNIZED_CODE",
        message: "Unknown",
      };

      const message = getErrorMessage(error, "es");

      expect(message.title).toBe("Error inesperado");
    });

    it("should handle all error codes", () => {
      const codes = [
        "NETWORK_ERROR",
        "TIMEOUT",
        "SLOT_TAKEN",
        "TOKEN_EXPIRED",
        "TOKEN_INVALID",
        "BOOKING_NOT_HELD",
        "ROI_REQUIRED",
        "INVALID_INPUT",
        "INTERNAL_ERROR",
        "SERVICE_UNAVAILABLE",
        "NOT_FOUND",
        "EMAIL_FAILED",
        "UNKNOWN_ERROR",
      ];

      codes.forEach((code) => {
        const error: ApiError = { ok: false, code, message: "Test" };
        const messageES = getErrorMessage(error, "es");
        const messageEN = getErrorMessage(error, "en");

        expect(messageES.title).toBeTruthy();
        expect(messageES.description).toBeTruthy();
        expect(messageEN.title).toBeTruthy();
        expect(messageEN.description).toBeTruthy();
      });
    });
  });

  describe("Helper Functions", () => {
    it("getErrorTitle should return just the title", () => {
      const error: ApiError = {
        ok: false,
        code: "TIMEOUT",
        message: "Timeout",
      };

      expect(getErrorTitle(error, "es")).toBe("Tiempo agotado");
      expect(getErrorTitle(error, "en")).toBe("Timeout");
    });

    it("getErrorDescription should return just the description", () => {
      const error: ApiError = {
        ok: false,
        code: "TIMEOUT",
        message: "Timeout",
      };

      expect(getErrorDescription(error, "es")).toContain("inténtalo de nuevo");
      expect(getErrorDescription(error, "en")).toContain("try again");
    });

    it("getErrorAction should return action when present", () => {
      const error: ApiError = {
        ok: false,
        code: "SLOT_TAKEN",
        message: "Slot taken",
      };

      expect(getErrorAction(error, "es")).toBe("Ver otros horarios");
      expect(getErrorAction(error, "en")).toBe("View other times");
    });

    it("hasErrorAction should return true when action exists", () => {
      const errorWithAction: ApiError = {
        ok: false,
        code: "SLOT_TAKEN",
        message: "Slot taken",
      };

      const errorWithoutAction: ApiError = {
        ok: false,
        code: "UNKNOWN_ERROR",
        message: "Unknown",
      };

      expect(hasErrorAction(errorWithAction)).toBe(true);
      expect(hasErrorAction(errorWithoutAction)).toBeTruthy(); // UNKNOWN_ERROR has action
    });
  });

  describe("Common Error Patterns", () => {
    it("getNetworkErrorMessage should return network error", () => {
      const messageES = getNetworkErrorMessage("es");
      const messageEN = getNetworkErrorMessage("en");

      expect(messageES.title).toBe("Sin conexión");
      expect(messageEN.title).toBe("No connection");
    });

    it("getTimeoutErrorMessage should return timeout error", () => {
      const messageES = getTimeoutErrorMessage("es");
      const messageEN = getTimeoutErrorMessage("en");

      expect(messageES.title).toBe("Tiempo agotado");
      expect(messageEN.title).toBe("Timeout");
    });

    it("getValidationErrorMessage should return validation error", () => {
      const messageES = getValidationErrorMessage(undefined, "es");
      const messageEN = getValidationErrorMessage(undefined, "en");

      expect(messageES.title).toBe("Datos inválidos");
      expect(messageEN.title).toBe("Invalid data");
    });

    it("getValidationErrorMessage should include field name when provided", () => {
      const messageES = getValidationErrorMessage("email", "es");
      const messageEN = getValidationErrorMessage("email", "en");

      expect(messageES.description).toContain("email");
      expect(messageEN.description).toContain("email");
    });
  });

  describe("Bilingual Support", () => {
    it("should have matching keys for ES and EN", () => {
      const codes = [
        "NETWORK_ERROR",
        "TIMEOUT",
        "SLOT_TAKEN",
        "TOKEN_EXPIRED",
        "TOKEN_INVALID",
        "BOOKING_NOT_HELD",
        "ROI_REQUIRED",
        "INVALID_INPUT",
        "INTERNAL_ERROR",
        "SERVICE_UNAVAILABLE",
        "NOT_FOUND",
        "EMAIL_FAILED",
        "UNKNOWN_ERROR",
      ];

      codes.forEach((code) => {
        const error: ApiError = { ok: false, code, message: "Test" };
        const messageES = getErrorMessage(error, "es");
        const messageEN = getErrorMessage(error, "en");

        // Both should have title and description
        expect(messageES.title).toBeTruthy();
        expect(messageEN.title).toBeTruthy();
        expect(messageES.description).toBeTruthy();
        expect(messageEN.description).toBeTruthy();

        // Both should have same presence of action
        expect(!!messageES.action).toBe(!!messageEN.action);
      });
    });
  });
});
