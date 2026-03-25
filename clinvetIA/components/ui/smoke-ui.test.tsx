import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

describe("UI smoke", () => {
  it("renders common primitives", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Alert>
          <AlertIcon>!</AlertIcon>
          <AlertContent>
            <AlertTitle>T</AlertTitle>
            <AlertDescription>D</AlertDescription>
          </AlertContent>
        </Alert>
        <Badge>Badge</Badge>
        <Label htmlFor="i">Label</Label>
        <Input id="i" defaultValue="x" />
        <Textarea defaultValue="y" />
        <Separator />
        <Skeleton className="h-4 w-10" />
        <Switch aria-label="sw" />
        <Checkbox aria-label="cb" />

         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <button type="button">Open</button>
           </DropdownMenuTrigger>
           <DropdownMenuContent>
             <DropdownMenuItem>Item</DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <button type="button">P</button>
          </PopoverTrigger>
          <PopoverContent>PC</PopoverContent>
        </Popover>

        <Select aria-label="Select" defaultValue="a">
          <option value="a">A</option>
        </Select>

         <Sheet>
           <SheetTrigger asChild>
             <button type="button">S</button>
           </SheetTrigger>
           <SheetContent>SC</SheetContent>
         </Sheet>

         <Dialog>
           <DialogTrigger asChild>
             <button type="button">D</button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>DT</DialogTitle>
               <DialogDescription>DD</DialogDescription>
             </DialogHeader>
           </DialogContent>
         </Dialog>

        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button">T</button>
          </TooltipTrigger>
          <TooltipContent>TC</TooltipContent>
        </Tooltip>

        <ScrollArea className="h-10 w-10">
          <div>Scroll</div>
        </ScrollArea>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>H</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>C</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );

    expect(screen.getByText("Badge")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "P" }));
    expect(screen.getByText("PC")).toBeInTheDocument();

    await user.hover(screen.getByRole("button", { name: "T" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent("TC");

    await user.click(screen.getByRole("button", { name: "D" }));
    expect(await screen.findByText("DT")).toBeInTheDocument();
  });
});
