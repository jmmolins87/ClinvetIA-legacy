import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRateLimiter, debounce, throttle } from "../rateLimit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should allow attempts within the limit", () => {
    const limiter = createRateLimiter(3, 60_000); // 3 attempts per minute

    expect(limiter.canProceed()).toBe(true);
    limiter.recordAttempt();

    expect(limiter.canProceed()).toBe(true);
    limiter.recordAttempt();

    expect(limiter.canProceed()).toBe(true);
    limiter.recordAttempt();

    expect(limiter.getAttemptCount()).toBe(3);
  });

  it("should block attempts after reaching the limit", () => {
    const limiter = createRateLimiter(3, 60_000);

    // Make 3 attempts
    limiter.recordAttempt();
    limiter.recordAttempt();
    limiter.recordAttempt();

    // 4th attempt should be blocked
    expect(limiter.canProceed()).toBe(false);
    expect(limiter.getAttemptCount()).toBe(3);
  });

  it("should allow attempts after time window expires", () => {
    const limiter = createRateLimiter(2, 1000); // 2 attempts per second

    // Make 2 attempts
    limiter.recordAttempt();
    limiter.recordAttempt();

    expect(limiter.canProceed()).toBe(false);

    // Advance time by 1 second
    vi.advanceTimersByTime(1000);

    // Should be allowed again
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.getAttemptCount()).toBe(0);
  });

  it("should calculate remaining time correctly", () => {
    const limiter = createRateLimiter(2, 60_000);

    limiter.recordAttempt();
    limiter.recordAttempt();

    // Should be blocked
    expect(limiter.canProceed()).toBe(false);

    // Remaining time should be close to 60 seconds
    const remaining = limiter.getRemainingTime();
    expect(remaining).toBeGreaterThan(59_000);
    expect(remaining).toBeLessThanOrEqual(60_000);
  });

  it("should return 0 remaining time when not blocked", () => {
    const limiter = createRateLimiter(5, 60_000);

    limiter.recordAttempt();

    expect(limiter.canProceed()).toBe(true);
    expect(limiter.getRemainingTime()).toBe(0);
  });

  it("should clean up old attempts", () => {
    const limiter = createRateLimiter(3, 1000);

    // Make 3 attempts
    limiter.recordAttempt();
    limiter.recordAttempt();
    limiter.recordAttempt();

    expect(limiter.getAttemptCount()).toBe(3);
    expect(limiter.canProceed()).toBe(false);

    // Advance time by 500ms (half the window)
    vi.advanceTimersByTime(500);
    expect(limiter.getAttemptCount()).toBe(3);

    // Advance another 500ms (full window)
    vi.advanceTimersByTime(500);
    expect(limiter.getAttemptCount()).toBe(0);
    expect(limiter.canProceed()).toBe(true);
  });

  it("should reset all attempts", () => {
    const limiter = createRateLimiter(2, 60_000);

    limiter.recordAttempt();
    limiter.recordAttempt();

    expect(limiter.canProceed()).toBe(false);
    expect(limiter.getAttemptCount()).toBe(2);

    limiter.reset();

    expect(limiter.canProceed()).toBe(true);
    expect(limiter.getAttemptCount()).toBe(0);
  });

  it("should handle sliding window correctly", () => {
    const limiter = createRateLimiter(3, 2000); // 3 attempts per 2 seconds

    // t=0: Make 2 attempts
    limiter.recordAttempt();
    limiter.recordAttempt();
    expect(limiter.getAttemptCount()).toBe(2);

    // t=1000: Advance 1 second, make 1 more attempt (now at limit)
    vi.advanceTimersByTime(1000);
    limiter.recordAttempt();
    expect(limiter.getAttemptCount()).toBe(3);
    expect(limiter.canProceed()).toBe(false);

    // t=2000: Advance 1 more second, first 2 attempts should expire
    vi.advanceTimersByTime(1000);
    expect(limiter.getAttemptCount()).toBe(1); // Only the 3rd attempt remains
    expect(limiter.canProceed()).toBe(true);
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should delay function execution", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 1000);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should cancel previous calls", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 1000);

    debounced();
    vi.advanceTimersByTime(500);

    debounced(); // This should cancel the first call
    vi.advanceTimersByTime(500);

    expect(fn).not.toHaveBeenCalled(); // First call was cancelled

    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1); // Only second call executes
  });

  it("should pass arguments correctly", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 500);

    debounced("hello", 123);
    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledWith("hello", 123);
  });
});

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should execute immediately on first call", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should ignore calls within delay period", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1); // Still 1, ignored

    vi.advanceTimersByTime(500);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2); // Now allowed
  });

  it("should pass arguments correctly", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 500);

    throttled("test", 42);
    expect(fn).toHaveBeenCalledWith("test", 42);

    vi.advanceTimersByTime(500);
    throttled("another", 99);
    expect(fn).toHaveBeenCalledWith("another", 99);
  });
});
