/**
 * Chat Validation Schemas (Zod)
 * 
 * Schemas de validación para el endpoint de chat.
 */

import { z } from "zod";

/**
 * Schema para un mensaje individual
 */
const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "El mensaje no puede estar vacío"),
  timestamp: z.string().optional(),
});

/**
 * Schema para el contexto del chat
 */
const chatContextSchema = z.object({
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  locale: z.enum(["es", "en"]).optional().default("es"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema para POST /api/chat
 */
export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "El mensaje no puede estar vacío")
    .max(2000, "El mensaje no puede exceder 2000 caracteres")
    .transform((val) => val.trim()),
  conversationHistory: z.array(chatMessageSchema).optional().default([]),
  context: chatContextSchema.optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
