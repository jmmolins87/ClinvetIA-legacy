/**
 * Mock API - Index
 *
 * Punto de entrada para las APIs mockeadas.
 *
 * Configuración:
 * - Set NEXT_PUBLIC_USE_MOCK_API=true en .env.local para activar mocks
 * - Por defecto usa APIs reales (cuando existan)
 *
 * Uso:
 *   import { api } from '@/services/mockApi';
 *   const result = await api.getAvailability(date);
 */

export { mockGetAvailability } from "./availability";
export { mockCreateHold } from "./holds";
export { mockConfirmBooking } from "./bookings";
export { mockState } from "./mockState";
