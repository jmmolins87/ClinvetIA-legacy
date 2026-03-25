/**
 * MongoDB Connection Singleton
 * 
 * Maneja la conexión a MongoDB usando Mongoose con patrón singleton.
 * Compatible con Next.js App Router y entorno serverless (Vercel).
 * 
 * REGLAS:
 * - Usar SIEMPRE alias @ para imports
 * - Singleton para evitar múltiples conexiones
 * - Logging de eventos de conexión
 * - Graceful shutdown en desarrollo
 */

import mongoose from "mongoose";

// Flag global para tracking de conexión
let isConnected = false;

/**
 * Opciones de conexión optimizadas para Next.js + Vercel
 */
const CONNECTION_OPTIONS = {
  bufferCommands: false, // Deshabilitar buffering en serverless
  maxPoolSize: 10, // Máximo de conexiones en pool
  minPoolSize: 2, // Mínimo de conexiones activas
  socketTimeoutMS: 45000, // Timeout de socket
  serverSelectionTimeoutMS: 10000, // Timeout de selección de servidor
} as const;

/**
 * Conectar a MongoDB
 * 
 * Usa patrón singleton para evitar múltiples conexiones en Next.js.
 * Compatible con hot-reload en desarrollo.
 * 
 * @throws Error si MONGODB_URI no está definido
 * @throws Error si la conexión falla
 */
export async function connectDB(): Promise<void> {
  // Si ya está conectado, no hacer nada
  if (isConnected && mongoose.connection.readyState === 1) {
    console.debug("[MongoDB] Using existing connection");
    return;
  }

  // Validar que existe MONGODB_URI
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined in environment variables. " +
      "Please add it to .env.local"
    );
  }

  try {
    console.info("[MongoDB] Connecting to database...");

    const conn = await mongoose.connect(process.env.MONGODB_URI, CONNECTION_OPTIONS);

    isConnected = true;
    
    console.info(
      `[MongoDB] Connected successfully to database: ${conn.connection.name}`
    );

    // Event listeners para debugging
    mongoose.connection.on("error", (err) => {
      console.error("[MongoDB] Connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Disconnected from database");
      isConnected = false;
    });

    // Graceful shutdown en desarrollo (solo Node.js, no en Edge Runtime)
    if (process.env.NODE_ENV === "development" && typeof process !== "undefined") {
      process.on("SIGINT", async () => {
        await disconnectDB();
        process.exit(0);
      });
    }
  } catch (error) {
    console.error("[MongoDB] Failed to connect:", error);
    isConnected = false;
    throw error;
  }
}

/**
 * Desconectar de MongoDB
 * 
 * Cierra la conexión de forma limpia.
 * Útil para tests y shutdown graceful.
 */
export async function disconnectDB(): Promise<void> {
  if (!isConnected) {
    console.debug("[MongoDB] Not connected, nothing to disconnect");
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.info("[MongoDB] Disconnected successfully");
  } catch (error) {
    console.error("[MongoDB] Error disconnecting:", error);
    throw error;
  }
}

/**
 * Verificar estado de conexión
 * 
 * @returns true si está conectado, false si no
 */
export function getConnectionStatus(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Obtener información de la conexión
 * 
 * @returns Objeto con info de la conexión
 */
export function getConnectionInfo() {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    return {
      connected: false,
      readyState: mongoose.connection.readyState,
      name: null,
      host: null,
    };
  }

  return {
    connected: true,
    readyState: mongoose.connection.readyState,
    name: mongoose.connection.name,
    host: mongoose.connection.host,
  };
}
