/**
 * SSR-safe localStorage and sessionStorage utilities
 * All functions guard against server-side rendering
 * 
 * Includes fallback to in-memory storage for browsers that block
 * localStorage (e.g., Safari private mode)
 */

// ============================================================================
// In-memory fallback storage
// ============================================================================

const memoryLocalStorage = new Map<string, string>();
const memorySessionStorage = new Map<string, string>();

let localStorageAvailable: boolean | null = null;
let sessionStorageAvailable: boolean | null = null;

function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorageAvailable !== null) return localStorageAvailable;

  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "test");
    window.localStorage.removeItem(testKey);
    localStorageAvailable = true;
    return true;
  } catch {
    console.warn("localStorage not available, using in-memory fallback");
    localStorageAvailable = false;
    return false;
  }
}

function isSessionStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorageAvailable !== null) return sessionStorageAvailable;

  try {
    const testKey = "__storage_test__";
    window.sessionStorage.setItem(testKey, "test");
    window.sessionStorage.removeItem(testKey);
    sessionStorageAvailable = true;
    return true;
  } catch {
    console.warn("sessionStorage not available, using in-memory fallback");
    sessionStorageAvailable = false;
    return false;
  }
}

// ============================================================================
// localStorage Utilities
// ============================================================================

export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    let item: string | null = null;

    if (isLocalStorageAvailable()) {
      item = window.localStorage.getItem(key);
    } else {
      item = memoryLocalStorage.get(key) ?? null;
    }

    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to get item "${key}" from localStorage:`, error);
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    const serialized = JSON.stringify(value);

    if (isLocalStorageAvailable()) {
      window.localStorage.setItem(key, serialized);
    } else {
      memoryLocalStorage.set(key, serialized);
    }
  } catch (error) {
    console.error(`Failed to set item "${key}" in localStorage:`, error);
  }
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return;

  try {
    if (isLocalStorageAvailable()) {
      window.localStorage.removeItem(key);
    } else {
      memoryLocalStorage.delete(key);
    }
  } catch (error) {
    console.error(`Failed to remove item "${key}" from localStorage:`, error);
  }
}

// Aliases for consistency
export const getLocalStorage = getItem;
export const setLocalStorage = setItem;
export const removeLocalStorage = removeItem;

// ============================================================================
// sessionStorage Utilities
// ============================================================================

export function getSessionItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    let item: string | null = null;

    if (isSessionStorageAvailable()) {
      item = window.sessionStorage.getItem(key);
    } else {
      item = memorySessionStorage.get(key) ?? null;
    }

    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to get item "${key}" from sessionStorage:`, error);
    return null;
  }
}

export function setSessionItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    const serialized = JSON.stringify(value);

    if (isSessionStorageAvailable()) {
      window.sessionStorage.setItem(key, serialized);
    } else {
      memorySessionStorage.set(key, serialized);
    }
  } catch (error) {
    console.error(`Failed to set item "${key}" in sessionStorage:`, error);
  }
}

export function removeSessionItem(key: string): void {
  if (typeof window === "undefined") return;

  try {
    if (isSessionStorageAvailable()) {
      window.sessionStorage.removeItem(key);
    } else {
      memorySessionStorage.delete(key);
    }
  } catch (error) {
    console.error(`Failed to remove item "${key}" from sessionStorage:`, error);
  }
}

// Aliases for consistency
export const getSessionStorage = getSessionItem;
export const setSessionStorage = setSessionItem;
export const removeSessionStorage = removeSessionItem;
