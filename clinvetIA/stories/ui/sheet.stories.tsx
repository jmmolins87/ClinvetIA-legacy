import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const meta = {
  title: "UI/Overlays/Sheet",
  component: Sheet,
  tags: ["autodocs"],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {
  render: () => (
    <div className="min-h-[140dvh] bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[90dvh] bg-[radial-gradient(60rem_40rem_at_20%_25%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_65%),radial-gradient(50rem_34rem_at_85%_65%,color-mix(in_oklch,var(--accent)_14%,transparent),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-screen-2xl px-4 pt-24">
        <div className="max-w-xl text-sm text-muted-foreground">
          Open el sheet para ver el overlay: opacidad + desenfoque, sin dejar la pagina en blanco.
        </div>

        <div className="mt-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Open sheet</Button>
            </SheetTrigger>
            <SheetContent
              side="right"
            >
              <SheetHeader>
                <SheetTitle>Sheet title</SheetTitle>
                <SheetDescription>Content slides from the right.</SheetDescription>
              </SheetHeader>
              <div className="text-sm text-muted-foreground">Put any content here.</div>
              <SheetFooter>
                <Button>Done</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  ),
};

export const Left: Story = {
  render: () => (
    <div className="min-h-[140dvh] bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[90dvh] bg-[radial-gradient(60rem_40rem_at_20%_25%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_65%),radial-gradient(50rem_34rem_at_85%_65%,color-mix(in_oklch,var(--accent)_14%,transparent),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-screen-2xl px-4 pt-24">
        <Sheet>
          <SheetTrigger asChild>
            <Button>Open left</Button>
          </SheetTrigger>
          <SheetContent
            side="left"
          >
            <SheetHeader>
              <SheetTitle>Left sheet</SheetTitle>
              <SheetDescription>Content slides from the left.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  ),
};
