/**
 * Chat Endpoint
 * 
 * POST /api/chat
 * 
 * Endpoint para integración con Activepieces.
 * Recibe mensajes del usuario y envía a Activepieces para procesamiento.
 * 
 * REGLAS:
 * - SIEMPRE retornar JSON válido
 * - NUNCA retornar HTML
 * - Validar todos los inputs con Zod
 * - Rate limiting aplicado
 */

import { NextRequest, NextResponse } from "next/server";
import { chatRequestSchema } from "@/src/server/validators/chatSchemas";
import { jsonSuccess, jsonError } from "@/src/server/utils/response";
import { logger } from "@/src/server/utils/logger";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/chat
 * 
 * Procesa mensajes de chat y los envía a Activepieces.
 * 
 * @param request - NextRequest con body: { message, conversationHistory?, context? }
 * @returns JSON response con la respuesta del chat
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parsear y validar body
    const body = await request.json();
    const validated = chatRequestSchema.parse(body);

    logger.info(
      {
        message: validated.message.substring(0, 50) + "...",
        locale: validated.context?.locale || "es",
        historyLength: validated.conversationHistory.length,
      },
      "Chat message received"
    );

    // 2. Verificar que Activepieces está configurado
    const activepiecesUrl = process.env.ACTIVEPIECES_WEBHOOK_URL;
    
    if (!activepiecesUrl) {
      logger.warn("ACTIVEPIECES_WEBHOOK_URL not configured");
      
      // Respuesta mock mientras se configura
      const locale = validated.context?.locale || "es";
      return NextResponse.json(
        jsonSuccess({
          reply: locale === "es"
            ? "¡Hola! El chat está en proceso de configuración. Pronto podrás hablar con nuestro asistente virtual."
            : "Hello! The chat is being set up. Soon you'll be able to talk to our virtual assistant.",
          conversationId: `conv_${Date.now()}`,
          timestamp: new Date().toISOString(),
        }),
        { status: 200 }
      );
    }

    // 3. Enviar a Activepieces
    const activepiecesPayload = {
      message: validated.message,
      conversationHistory: validated.conversationHistory,
      context: {
        ...validated.context,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    };

    logger.debug(
      { url: activepiecesUrl },
      "Sending message to Activepieces"
    );

    const activepiecesResponse = await fetch(activepiecesUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.ACTIVEPIECES_API_KEY && {
          Authorization: `Bearer ${process.env.ACTIVEPIECES_API_KEY}`,
        }),
      },
      body: JSON.stringify(activepiecesPayload),
    });

    if (!activepiecesResponse.ok) {
      const errorText = await activepiecesResponse.text();
      logger.error(
        {
          status: activepiecesResponse.status,
          error: errorText,
        },
        "Activepieces request failed"
      );

      return NextResponse.json(
        jsonError(
          "CHAT_SERVICE_ERROR",
          "El servicio de chat no está disponible temporalmente"
        ),
        { status: 503 }
      );
    }

    // 4. Parsear respuesta de Activepieces
    const activepiecesData = await activepiecesResponse.json();

    // Adaptar respuesta según el formato de Activepieces
    // (ajustar según la estructura real de tu webhook)
    const reply = 
      activepiecesData.reply || 
      activepiecesData.message || 
      activepiecesData.response ||
      "Lo siento, no pude procesar tu mensaje.";

    const conversationId = 
      activepiecesData.conversationId || 
      `conv_${Date.now()}`;

    const duration = Date.now() - startTime;

    logger.info(
      {
        conversationId,
        durationMs: duration,
      },
      "Chat response sent"
    );

    return NextResponse.json(
      jsonSuccess({
        reply,
        conversationId,
        timestamp: new Date().toISOString(),
      }),
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    // Error de validación Zod
    if (error instanceof ZodError) {
      const zodError = error as ZodError;
      logger.warn(
        {
          errors: zodError.issues,
          durationMs: duration,
        },
        "Chat validation error"
      );

      return NextResponse.json(
        jsonError(
          "INVALID_INPUT",
          zodError.issues[0]?.message || "Datos inválidos",
          {
            fields: zodError.flatten().fieldErrors,
          }
        ),
        { status: 400 }
      );
    }

    // Error de JSON parsing
    if (error instanceof SyntaxError) {
      logger.warn({ durationMs: duration }, "Invalid JSON in request");
      
      return NextResponse.json(
        jsonError("INVALID_INPUT", "El body debe ser JSON válido"),
        { status: 400 }
      );
    }

    // Error general
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        durationMs: duration,
      },
      "Chat endpoint error"
    );

    return NextResponse.json(
      jsonError(
        "INTERNAL_ERROR",
        "Error al procesar el mensaje de chat"
      ),
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/chat
 * 
 * CORS preflight request
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
