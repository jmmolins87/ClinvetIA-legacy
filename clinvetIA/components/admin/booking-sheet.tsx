"use client";

import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge, type BookingStatus } from "@/components/admin/status-badge";
import { Icon } from "@/components/ui/icon";

export interface Booking {
  id: string;
  uid?: string;
  email: string;
  contactEmail?: string;
  name?: string;
  contactName?: string;
  status: BookingStatus;
  startAt: string;
  createdAt: string;
  durationMinutes?: number;
  locale?: string;
  contactPhone?: string;
  contactClinicName?: string;
  form?: {
    company: string;
    role: string;
    clinicSize: string;
  };
}

function Kv({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 py-2">
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

export function BookingSheet({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const title = booking ? `${booking.uid || booking.id}` : "View";
  const clientName: string = booking?.name || booking?.contactName || "No name";
  const clientEmail: string = booking?.email || booking?.contactEmail || "No email";
  const duration: number = booking?.durationMinutes || 30;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-3">
            <span className="truncate">{title}</span>
            {booking ? <StatusBadge status={booking.status} /> : null}
          </SheetTitle>
          <SheetDescription>
            {booking ? `${new Date(booking.startAt).toLocaleString()} • ${duration}m • ${booking.status}` : ""}
          </SheetDescription>
        </SheetHeader>

        {booking ? (
          <div className="grid gap-4 px-4 pb-4">
            <Card className="p-4">
              <div className="text-sm font-semibold">Client</div>
              <div className="text-muted-foreground mt-1 text-sm">{clientName}</div>
              <div className="mt-3 border-t pt-3">
                <Kv label="Email" value={clientEmail} />
                {booking.locale && <Kv label="Locale" value={booking.locale} />}
                {booking.contactPhone && <Kv label="Phone" value={booking.contactPhone} />}
                {booking.contactClinicName && <Kv label="Clinic" value={booking.contactClinicName} />}
                <Kv label="Created" value={new Date(booking.createdAt).toLocaleString()} />
              </div>
            </Card>

            {booking.form && (
              <Card className="p-4">
                <div className="text-sm font-semibold">Form</div>
                <div className="mt-3 space-y-2">
                  <Kv label="Company" value={booking.form.company} />
                  <Kv label="Role" value={booking.form.role} />
                  <Kv label="Size" value={booking.form.clinicSize} />
                </div>
              </Card>
            )}
          </div>
        ) : null}

        <SheetFooter className="gap-2">
          {booking ? (
            <>
              <Button
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(clientEmail);
                    toast.success("Email copied");
                  } catch {
                    toast.error("Could not copy email");
                  }
                }}
              >
                <Icon name="Copy" className="size-4" />
                Copy Email
              </Button>
              <Button className="gap-2 bg-gradient-neon-glow glow-sm" asChild>
                <Link href={`/admin/bookings/${booking.id}`}>
                  <Icon name="ExternalLink" className="size-4" />
                  Open
                </Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
