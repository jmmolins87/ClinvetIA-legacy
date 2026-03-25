"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { BookingActions, type Booking } from "@/components/admin/booking-actions";
import { BookingSheet } from "@/components/admin/booking-sheet";

interface RecentBookingsTableProps {
  bookings: Booking[];
  isDemo?: boolean;
}

export function RecentBookingsTable({ bookings, isDemo = false }: RecentBookingsTableProps) {
  const [selected, setSelected] = React.useState<Booking | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Starts At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                    {isDemo ? "No results" : "No recent bookings"}
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(b.startAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-muted-foreground">
                      {b.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <BookingActions
                        booking={b}
                        onView={(booking) => {
                          setSelected(booking);
                          setSheetOpen(true);
                        }}
                        compact
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BookingSheet
        booking={selected}
        open={sheetOpen}
        onOpenChange={(next) => {
          setSheetOpen(next);
          if (!next) setSelected(null);
        }}
      />
    </>
  );
}
