import { Badge } from "@/components/ui/badge";

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "RESCHEDULED" | "PENDING" | "EXPIRED";

export function StatusBadge({ status }: { status: BookingStatus }) {
  const variant =
    status === "CONFIRMED"
      ? "success"
      : status === "CANCELLED"
        ? "destructive"
        : status === "RESCHEDULED"
          ? "warning"
          : status === "EXPIRED"
            ? "outline"
            : "secondary";

  return <Badge variant={variant}>{status}</Badge>;
}
