import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const meta = {
  title: "UI/Data Display/Table",
  component: Table,
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Table className="min-w-[560px]">
      <TableCaption>Example table</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Owner</TableHead>
          <TableHead>Pet</TableHead>
          <TableHead className="text-right">Visits</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Juan</TableCell>
          <TableCell>Milo</TableCell>
          <TableCell className="text-right">3</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell>Ana</TableCell>
          <TableCell>Luna</TableCell>
          <TableCell className="text-right">7</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Mario</TableCell>
          <TableCell>Toby</TableCell>
          <TableCell className="text-right">1</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
