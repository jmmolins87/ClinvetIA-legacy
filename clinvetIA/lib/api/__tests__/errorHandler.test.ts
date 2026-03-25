/**
 * Error Handler Tests
 *
 * Tests retry logic, exponential backoff, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  withErrorHandling,
  isNetworkError,
  isClientError,
  isServerError,
  shouldRetryError,
} from "../errorHandler";
import type { ApiError } from "@/services/api/bookings";

describe("errorHandler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("withErrorHandling", () => {
    it("should return result on success", async () => {
      const mockFn = vi.fn().mockResolvedValue({ ok: true, data: "success" });

      const result = await withErrorHandling(mockFn, {
        maxRetries: 3,
      });

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true, data: "success" });
    });

    it("should retry on network errors", async () => {
      const networkError: ApiError = {
        ok: false,
        code: "NETWORK_ERROR",
        message: "Network failed",
      };

      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue({ ok: true, data: "success" });

      const promise = withErrorHandling(mockFn, {
        maxRetries: 3,
        retryDelay: 1000,
      });

      // Advance timers for first retry
      await vi.advanceTimersByTimeAsync(1000);
      // Advance timers for second retry (exponential backoff: 2000ms)
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;

      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ ok: true, data: "success" });
    });

    it("should use exponential backoff", async () => {
      const networkError: ApiError = {
        ok: false,
        code: "NETWORK_ERROR",
        message: "Network failed",
      };

      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue({ ok: true, data: "success" });

      const promise = withErrorHandling(mockFn, {
        maxRetries: 3,
        retryDelay: 100, // Base delay
      });

      // First retry: ~100ms (2^0 * 100)
      await vi.advanceTimersByTimeAsync(150);
      // Second retry: ~200ms (2^1 * 100)
      await vi.advanceTimersByTimeAsync(250);

      const result = await promise;

      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ ok: true, data: "success" });
    });

    it("should not retry on client errors", async () => {
      const clientError: ApiError = {
        ok: false,
        code: "INVALID_INPUT",
        message: "Invalid input",
      };

      const mockFn = vi.fn().mockRejectedValue(clientError);

      await expect(
        withErrorHandling(mockFn, {
          maxRetries: 3,
          retryDelay: 100,
        })
      ).rejects.toEqual(clientError);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should respect maxRetries limit", async () => {
      const networkError: ApiError = {
        ok: false,
        code: "NETWORK_ERROR",
        message: "Network failed",
      };

      const mockFn = vi.fn().mockRejectedValue(networkError);

      const promise = withErrorHandling(mockFn, {
        maxRetries: 2,
        retryDelay: 10,
      });

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(10);
      await vi.advanceTimersByTimeAsync(20);

      await expect(promise).rejects.toEqual(networkError);

      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it("should use custom shouldRetry function", async () => {
      const error: ApiError = {
        ok: false,
        code: "CUSTOM_ERROR",
        message: "Custom error",
      };

      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ ok: true, data: "success" });

      const shouldRetry = vi.fn().mockReturnValue(true);

      const promise = withErrorHandling(mockFn, {
        maxRetries: 3,
        retryDelay: 10,
        shouldRetry,
      });

      await vi.advanceTimersByTimeAsync(20);

      const result = await promise;

      expect(shouldRetry).toHaveBeenCalledWith(error, 0);
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ ok: true, data: "success" });
    });

    it("should call onError callback", async () => {
      const error: ApiError = {
        ok: false,
        code: "NETWORK_ERROR",
        message: "Network failed",
      };

      const mockFn = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();

      const promise = withErrorHandling(mockFn, {
        maxRetries: 1,
        retryDelay: 10,
        onError,
        context: "test-api",
      });

      await vi.advanceTimersByTimeAsync(20);

      await expect(promise).rejects.toEqual(error);

      expect(onError).toHaveBeenCalledWith(error, "test-api");
      expect(onError).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    it("should handle timeout option", async () => {
      const mockFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true, data: "success" }), 5000);
          })
      );

      const promise = withErrorHandling(mockFn, {
        timeout: 1000,
        maxRetries: 0,
      });

      await vi.advanceTimersByTimeAsync(1000);

      await expect(promise).rejects.toThrow("TIMEOUT");
    });
  });

  describe("Error Classification", () => {
    it("should identify network errors", () => {
      expect(isNetworkError({ ok: false, code: "NETWORK_ERROR", message: "" })).toBe(true);
      expect(isNetworkError({ ok: false, code: "TIMEOUT", message: "" })).toBe(true);
      expect(isNetworkError({ ok: false, code: "INVALID_INPUT", message: "" })).toBe(false);
    });

    it("should identify client errors", () => {
      expect(isClientError({ ok: false, code: "INVALID_INPUT", message: "" })).toBe(true);
      expect(isClientError({ ok: false, code: "ROI_REQUIRED", message: "" })).toBe(true);
      expect(isClientError({ ok: false, code: "TOKEN_INVALID", message: "" })).toBe(true);
      expect(isClientError({ ok: false, code: "NETWORK_ERROR", message: "" })).toBe(false);
    });

    it("should identify server errors", () => {
      expect(isServerError({ ok: false, code: "INTERNAL_ERROR", message: "" })).toBe(true);
      expect(isServerError({ ok: false, code: "SERVICE_UNAVAILABLE", message: "" })).toBe(true);
      expect(isServerError({ ok: false, code: "INVALID_INPUT", message: "" })).toBe(false);
    });

    it("should recommend retry for appropriate errors", () => {
      expect(shouldRetryError({ ok: false, code: "NETWORK_ERROR", message: "" })).toBe(true);
      expect(shouldRetryError({ ok: false, code: "TIMEOUT", message: "" })).toBe(true);
      expect(shouldRetryError({ ok: false, code: "INTERNAL_ERROR", message: "" })).toBe(true);
      expect(shouldRetryError({ ok: false, code: "INVALID_INPUT", message: "" })).toBe(false);
      expect(shouldRetryError({ ok: false, code: "TOKEN_EXPIRED", message: "" })).toBe(false);
    });
  });
});
