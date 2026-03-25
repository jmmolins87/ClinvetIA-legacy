import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export function DateRangeChip({ label = "Date Range" }: { label?: string }) {
  return (
    <Button variant="outline" className="justify-start gap-2">
      <Icon name="CalendarRange" className="size-4" />
      <span className="text-sm">{label}</span>
      <span className="text-muted-foreground hidden text-xs sm:inline">
        (placeholder)
      </span>
    </Button>
  );
}
