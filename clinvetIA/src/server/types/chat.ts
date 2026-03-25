/**
 * Chat Types
 * 
 * Tipos TypeScript para el sistema de chat con Activepieces.
 */

/**
 * Mensaje de chat del usuario
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

/**
 * Contexto adicional para el chat
 */
export interface ChatContext {
  sessionId?: string;
  userId?: string;
  locale?: "es" | "en";
  metadata?: Record<string, unknown>;
}

/**
 * Request body para POST /api/chat
 */
export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  context?: ChatContext;
}

/**
 * Response del endpoint /api/chat
 */
export interface ChatResponse {
  ok: true;
  reply: string;
  conversationId?: string;
  timestamp: string;
}

/**
 * Error response
 */
export interface ChatError {
  ok: false;
  code: string;
  message: string;
}
