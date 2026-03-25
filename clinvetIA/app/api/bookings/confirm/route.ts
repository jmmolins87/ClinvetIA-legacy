/**
 * POST /api/bookings/confirm
 *
 * Convierte un hold en reserva confirmada.
 * Requiere sessionToken válido + datos de contacto + ROI data.
 *
 * Errores:
 *   400 — validación / ROI ausente
 *   404 — token no encontrado
 *   409 — hold ya confirmado/cancelado
 *   410 — hold expirado
 *   503 — error de base de datos
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { connectDB } from "@/src/server/db/connection";
import { BookingService } from "@/src/server/services/BookingService";
import { confirmBookingSchema } from "@/src/server/validators/bookingSchemas";
import { jsonSuccess, jsonError } from "@/src/server/utils/response";
import { logger } from "@/src/server/utils/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STATUS_MAP: Record<string, number> = {
  TOKEN_INVALID:    404,
  TOKEN_EXPIRED:    410,
  BOOKING_NOT_HELD: 409,
  ROI_REQUIRED:     400,
  INTERNAL_ERROR:   503,
};

export async function POST(request: NextRequest) {
  const t0 = Date.now();

  try {
    const body = await request.json();
    const validated = confirmBookingSchema.parse(body);

    logger.info(
      { token: validated.sessionToken.slice(0, 12) + "..." },
      "confirm booking request"
    );

    await connectDB();

    const result = await BookingService.confirmBooking({
      sessionToken: validated.sessionToken,
      contact: {
        fullName:   validated.contact.fullName,
        email:      validated.contact.email,
        phone:      validated.contact.phone,
        clinicName: validated.contact.clinicName ?? undefined,
        message:    validated.contact.message ?? undefined,
      },
      roi: validated.roi as Record<string, unknown>,
    });

    if (!result.ok) {
      logger.warn({ code: result.code, ms: Date.now() - t0 }, "confirm rejected");
      return NextResponse.json(
        jsonError(result.code, result.message),
        { status: STATUS_MAP[result.code] ?? 400 }
      );
    }

    logger.info(
      { bookingId: result.data.booking.id, ms: Date.now() - t0 },
      "booking confirmed"
    );

    return NextResponse.json(jsonSuccess(result.data), { status: 200 });
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
      "confirm error"
    );

    return NextResponse.json(
      jsonError("INTERNAL_ERROR", "Error al confirmar la reserva"),
      { status: 503 }
    );
  }
}
