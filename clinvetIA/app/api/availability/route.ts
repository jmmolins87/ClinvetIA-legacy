/**
 * GET /api/availability?date=YYYY-MM-DD
 *
 * Devuelve los slots de 30 min (09:00–17:30) de un día laborable,
 * marcando cuáles están ocupados por holds/confirmaciones en MongoDB.
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { connectDB } from "@/src/server/db/connection";
import { AvailabilityService } from "@/src/server/services/AvailabilityService";
import { availabilityQuerySchema } from "@/src/server/validators/bookingSchemas";
import { jsonSuccess, jsonError } from "@/src/server/utils/response";
import { logger } from "@/src/server/utils/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const t0 = Date.now();

  try {
    // 1. Validar query param
    const { searchParams } = new URL(request.url);
    const { date } = availabilityQuerySchema.parse({
      date: searchParams.get("date") ?? "",
    });

    logger.info({ date }, "availability request");

    // 2. Conectar y calcular slots
    await connectDB();
    const result = await AvailabilityService.getAvailability(date);

    logger.info(
      { date, available: result.slots.filter((s) => s.available).length, ms: Date.now() - t0 },
      "availability response"
    );

    return NextResponse.json(jsonSuccess(result), {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        jsonError("INVALID_INPUT", error.issues[0]?.message ?? "Fecha inválida", {
          fields: error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    logger.error(
      { error: error instanceof Error ? error.message : String(error), ms: Date.now() - t0 },
      "availability error"
    );

    return NextResponse.json(
      jsonError("INTERNAL_ERROR", "Error al obtener disponibilidad"),
      { status: 503 }
    );
  }
}
