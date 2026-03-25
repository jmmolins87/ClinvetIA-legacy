"use client";

import { ActivityTimeline, type ActivityEvent } from "@/components/admin/activity-timeline";
import { DateRangeChip } from "@/components/admin/date-range-chip";
import { KpiCard } from "@/components/admin/kpi-card";
import { RecentBookingsTable } from "@/components/admin/recent-bookings-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Booking } from "@/components/admin/booking-actions";

const MOCK_BOOKINGS: Booking[] = [
  { id: "1", email: "user1@example.com", status: "CONFIRMED", startAt: "2024-05-15T10:00:00Z", createdAt: "2024-05-10T10:00:00Z" },
  { id: "2", email: "user2@example.com", status: "CANCELLED", startAt: "2024-05-16T11:00:00Z", createdAt: "2024-05-11T11:00:00Z" },
  { id: "3", email: "user3@example.com", status: "RESCHEDULED", startAt: "2024-05-17T12:00:00Z", createdAt: "2024-05-12T12:00:00Z" },
  { id: "4", email: "user4@example.com", status: "CONFIRMED", startAt: "2024-05-18T13:00:00Z", createdAt: "2024-05-13T13:00:00Z" },
  { id: "5", email: "user5@example.com", status: "PENDING", startAt: "2024-05-19T14:00:00Z", createdAt: "2024-05-14T14:00:00Z" },
];

const MOCK_ACTIVITY: ActivityEvent[] = [
    { id: "1", title: "Booking confirmed", at: "2024-05-15T10:00:00Z", description: "user1@example.com", tone: "good", bookingId: "1" },
    { id: "2", title: "Booking cancelled", at: "2024-05-16T11:00:00Z", description: "user2@example.com", tone: "bad", bookingId: "2" },
    { id: "3", title: "Booking rescheduled", at: "2024-05-17T12:00:00Z", description: "user3@example.com", tone: "warn", bookingId: "3" },
];

const total = MOCK_BOOKINGS.length;
const confirmed = MOCK_BOOKINGS.filter((b) => b.status === "CONFIRMED").length;
const cancelled = MOCK_BOOKINGS.filter((b) => b.status === "CANCELLED").length;
const rescheduled = MOCK_BOOKINGS.filter((b) => b.status === "RESCHEDULED").length;

export default function AdminOverviewPage() {

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Bookings summary
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeChip />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Bookings"
          value={String(total)}
          hint="Last 30 days"
          icon="CalendarDays"
        />
        <KpiCard
          title="Confirmed"
          value={String(confirmed)}
          hint="Confirmed bookings"
          icon="CircleCheck"
          tone="good"
        />
        <KpiCard
          title="Cancelled"
          value={String(cancelled)}
          hint="Cancelled bookings"
          icon="CircleX"
          tone="bad"
        />
        <KpiCard
          title="Rescheduled"
          value={String(rescheduled)}
          hint="Rescheduled bookings"
          icon="RotateCcw"
          tone="warn"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <RecentBookingsTable bookings={MOCK_BOOKINGS} isDemo />

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline events={MOCK_ACTIVITY} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
