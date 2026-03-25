/**
 * POST /api/bookings
 *
 * Crea un hold temporal de 10 minutos para un slot.
 * Devuelve sessionToken que el cliente usará para confirmar.
 *
 * Errores:
 *   400 — validación Zod
 *   409 — slot ya ocupado
 *   422 — fecha inválida (pasada / weekend / cutoff)
 *   503 — error de base de datos
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { connectDB } from "@/src/server/db/connection";
import { BookingService } from "@/src/server/services/BookingService";
import { createHoldSchema } from "@/src/server/validators/bookingSchemas";
import { jsonSuccess, jsonError } from "@/src/server/utils/response";
import { logger } from "@/src/server/utils/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STATUS_MAP: Record<string, number> = {
  SLOT_TAKEN:            409,
  INVALID_TIMEZONE:      400,
  INVALID_DATE:          422,
  DATE_IN_PAST:          422,
  WEEKEND_NOT_ALLOWED:   422,
  CUTOFF_EXCEEDED:       422,
  INTERNAL_ERROR:        503,
};

export async function POST(request: NextRequest) {
  const t0 = Date.now();

  try {
    const body = await request.json();
    const validated = createHoldSchema.parse(body);

    logger.info({ date: validated.date, time: validated.time }, "create hold request");

    await connectDB();

    const result = await BookingService.createHold(validated);

    if (!result.ok) {
      logger.warn({ code: result.code, ms: Date.now() - t0 }, "hold rejected");
      return NextResponse.json(
        jsonError(result.code, result.message),
        { status: STATUS_MAP[result.code] ?? 400 }
      );
    }

    logger.info(
      { token: result.data.sessionToken.slice(0, 12), ms: Date.now() - t0 },
      "hold created"
    );

    return NextResponse.json(jsonSuccess(result.data), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        jsonError("INVALID_INPUT", error.issues[0]?.message ?? "Datos inválidos", {
          fields: error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        jsonError("INVALID_INPUT", "El body debe ser JSON válido"),
        { status: 400 }
      );
    }

    logger.error(
      { error: error instanceof Error ? error.message : String(error), ms: Date.now() - t0 },
      "create hold error"
    );

    return NextResponse.json(
      jsonError("INTERNAL_ERROR", "Error al crear la reserva temporal"),
      { status: 503 }
    );
  }
}
