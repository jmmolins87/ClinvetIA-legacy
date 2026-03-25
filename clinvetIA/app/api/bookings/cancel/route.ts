/**
 * POST /api/bookings/cancel        → cancelación programática (frontend)
 * GET  /api/bookings/cancel?token= → cancelación desde enlace de email
 *
 * Errores:
 *   400 — token ausente / inválido
 *   404 — token no encontrado
 *   503 — error de base de datos
 */

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { connectDB } from "@/src/server/db/connection";
import { BookingService } from "@/src/server/services/BookingService";
import { jsonSuccess, jsonError } from "@/src/server/utils/response";
import { logger } from "@/src/server/utils/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cancelBodySchema = z.object({
  token: z.string().min(8, "Token de cancelación inválido"),
});

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const t0 = Date.now();

  try {
    const body = await request.json();
    const { token } = cancelBodySchema.parse(body);

    logger.info({ token: token.slice(0, 14) + "..." }, "cancel booking request");

    await connectDB();

    const result = await BookingService.cancelBooking(token);

    if (!result.ok) {
      logger.warn({ code: result.code, ms: Date.now() - t0 }, "cancel rejected");
      return NextResponse.json(
        jsonError(result.code, result.message),
        { status: result.code === "TOKEN_INVALID" ? 404 : 503 }
      );
    }

    logger.info({ bookingId: result.data.booking.id, ms: Date.now() - t0 }, "booking cancelled");

    return NextResponse.json(jsonSuccess(result.data), { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        jsonError("INVALID_INPUT", error.issues[0]?.message ?? "Token inválido"),
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
      "cancel POST error"
    );

    return NextResponse.json(
      jsonError("INTERNAL_ERROR", "Error al cancelar la reserva"),
      { status: 503 }
    );
  }
}

// ── GET (desde enlace de email) ───────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token") ?? "";

  if (token.length < 8) {
    return NextResponse.json(
      jsonError("INVALID_INPUT", "Token de cancelación inválido"),
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const result = await BookingService.cancelBooking(token);

    if (!result.ok) {
      logger.warn({ code: result.code }, "cancel GET rejected");
      return NextResponse.json(
        jsonError(result.code, result.message),
        { status: result.code === "TOKEN_INVALID" ? 404 : 503 }
      );
    }

    logger.info({ bookingId: result.data.booking.id }, "booking cancelled via email link");

    // Redirige a la home con indicador visual
    return NextResponse.redirect(new URL("/?cancelled=1", request.url));
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "cancel GET error"
    );

    return NextResponse.json(
      jsonError("INTERNAL_ERROR", "Error al cancelar la reserva"),
      { status: 503 }
    );
  }
}
