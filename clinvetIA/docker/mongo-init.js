/**
 * MongoDB Init Script — ejecutado una sola vez al crear el contenedor.
 *
 * Crea:
 *   1. Usuario de aplicación con permisos mínimos (readWrite en clinvetia)
 *   2. Colección bookings con validación JSON Schema
 *   3. Índices optimizados para los patrones de acceso
 *   4. Un documento de seed para desarrollo
 */

// ── 1. Base de datos y usuario app ───────────────────────────────────────────

db = db.getSiblingDB("clinvetia");

db.createUser({
  user: "clinvetia_app",
  pwd: "clinvetia_app_dev",
  roles: [{ role: "readWrite", db: "clinvetia" }],
});

print("[init] Usuario 'clinvetia_app' creado");

// ── 2. Colección con validación ───────────────────────────────────────────────

db.createCollection("bookings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "sessionToken", "cancelToken", "rescheduleToken",
        "date", "time", "startAt", "endAt", "timezone",
        "status", "locale",
      ],
      properties: {
        sessionToken:     { bsonType: "string" },
        cancelToken:      { bsonType: "string" },
        rescheduleToken:  { bsonType: "string" },
        date:    { bsonType: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        time:    { bsonType: "string", pattern: "^\\d{2}:\\d{2}$" },
        startAt: { bsonType: "date" },
        endAt:   { bsonType: "date" },
        timezone: { bsonType: "string" },
        status:  { bsonType: "string", enum: ["held", "confirmed", "expired", "cancelled"] },
        locale:  { bsonType: "string", enum: ["es", "en"] },
        expiresAt:   { bsonType: ["date", "null"] },
        confirmedAt: { bsonType: ["date", "null"] },
      },
    },
  },
  validationLevel: "moderate",
  validationAction: "warn",
});

print("[init] Colección 'bookings' creada con validación");

// ── 3. Índices ────────────────────────────────────────────────────────────────

// Únicos para tokens
db.bookings.createIndex({ sessionToken: 1 },    { unique: true, name: "idx_sessionToken" });
db.bookings.createIndex({ cancelToken: 1 },     { unique: true, name: "idx_cancelToken" });
db.bookings.createIndex({ rescheduleToken: 1 }, { unique: true, name: "idx_rescheduleToken" });

// Búsqueda por fecha y estado
db.bookings.createIndex({ date: 1 },              { name: "idx_date" });
db.bookings.createIndex({ date: 1, status: 1 },   { name: "idx_date_status" });

// Overlapping check (lo más crítico para disponibilidad)
db.bookings.createIndex(
  { startAt: 1, endAt: 1, status: 1 },
  { name: "idx_overlap" }
);

// TTL: MongoDB expira automáticamente los holds vencidos
db.bookings.createIndex(
  { expiresAt: 1 },
  {
    name: "idx_ttl_expires",
    expireAfterSeconds: 0,
    partialFilterExpression: { status: "held" },
  }
);

print("[init] Índices creados");

// ── 4. Seed ───────────────────────────────────────────────────────────────────

const now = new Date();

// Buscar el próximo día laborable
const seed = new Date(now);
seed.setDate(seed.getDate() + 1);
while (seed.getDay() === 0 || seed.getDay() === 6) {
  seed.setDate(seed.getDate() + 1);
}
const dateStr = seed.toISOString().split("T")[0];

db.bookings.insertOne({
  sessionToken:    "tok_seed_dev_only",
  cancelToken:     "cancel_seed_dev_only",
  rescheduleToken: "reschedule_seed_dev_only",
  date:     dateStr,
  time:     "10:00",
  startAt:  new Date(dateStr + "T09:00:00Z"),
  endAt:    new Date(dateStr + "T09:30:00Z"),
  timezone: "Europe/Madrid",
  status:   "confirmed",
  expiresAt:   null,
  confirmedAt: now,
  locale: "es",
  contact: {
    fullName:   "Demo Clinvetia",
    email:      "demo@clinvetia.com",
    phone:      "612345678",
    clinicName: "Clínica Demo",
    message:    "Booking de seed para desarrollo",
  },
  roi: { clinicType: "small", monthlyPatients: 100, avgTicket: 80, missedRate: 15 },
  email: { sent: false, sentAt: null, provider: null, messageId: null, error: null },
  createdAt: now,
  updatedAt: now,
});

print("[init] Seed booking creado para " + dateStr + " 10:00");
print("[init] ✓ Inicialización completada");
