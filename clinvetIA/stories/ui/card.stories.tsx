import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import { CancelButton } from "@/components/ui/cancel-button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta = {
  title: "UI/Data Display/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[420px] max-w-full">
      <CardHeader className="border-b">
        <div>
          <CardTitle>Booking</CardTitle>
          <CardDescription>Card layout with header, content and footer.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="secondary">
            Action
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-sm leading-6">
          This is the card content area. Put forms, tables, or any other UI here.
        </div>
      </CardContent>
      <CardFooter className="border-t justify-end gap-2">
        <CancelButton>Cancel</CancelButton>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
};
