/**
 * Health Check Endpoint
 * 
 * GET /api/health/db
 * 
 * Verifica la salud de la conexión a MongoDB.
 * Útil para monitoreo y debugging.
 * 
 * REGLAS:
 * - SIEMPRE retornar JSON válido
 * - NUNCA retornar HTML
 * - Status 200 si está sano, 503 si no
 */

import { NextResponse } from "next/server";
import { connectDB, getConnectionStatus } from "@/src/server/db/connection";
import { jsonSuccess, jsonError } from "@/src/server/utils/response";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/health/db
 * 
 * Verifica conexión a MongoDB.
 * 
 * @returns JSON con estado de conexión
 */
export async function GET() {
  try {
    // Intentar conectar si no está conectado
    await connectDB();

    const isConnected = getConnectionStatus();

    if (!isConnected) {
      return NextResponse.json(
        jsonError("DATABASE_ERROR", "Database not connected"),
        { status: 503 }
      );
    }

    // Obtener info de la DB
    const dbName = mongoose.connection.db?.databaseName || "unknown";
    
    // Intentar listar colecciones (prueba de que funciona)
    let collections: string[] = [];
    try {
      const colls = await mongoose.connection.db?.listCollections().toArray();
      collections = colls?.map((c) => c.name) || [];
    } catch (error) {
      console.warn("[Health] Could not list collections:", error);
      // No fallar si no se pueden listar colecciones
    }

    return NextResponse.json(
      jsonSuccess({
        db: "connected",
        name: dbName,
        collections,
        host: mongoose.connection.host || "unknown",
        readyState: mongoose.connection.readyState,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[Health] Database health check failed:", error);
    
    return NextResponse.json(
      jsonError(
        "DATABASE_ERROR",
        error instanceof Error ? error.message : "Unknown database error"
      ),
      { status: 503 }
    );
  }
}
