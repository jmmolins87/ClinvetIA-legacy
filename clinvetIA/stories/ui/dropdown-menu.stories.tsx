import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Copy, LogOut, Monitor, Moon, Settings, Sun, Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const meta = {
  title: "UI/Overlays/DropdownMenu",
  component: DropdownMenuContent,
  tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenuContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User />
            Profile
            <DropdownMenuShortcut>\u2318P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy />
            Copy link
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 />
          Delete
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <LogOut />
          Sign out (disabled)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxRadioSub: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>More options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Preferences</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Show hints</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Enable sounds</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="compact">
          <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>PDF</DropdownMenuItem>
            <DropdownMenuItem>CSV</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const ThemeToggleStyle: Story = {
  render: () => <ThemeToggleLikeDropdown />,
};

function ThemeToggleLikeDropdown(): JSX.Element {
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center p-4 rounded-lg cursor-pointer transition-colors hover:bg-accent"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Sun className="h-7 w-7" />
          ) : theme === "dark" ? (
            <Moon className="h-7 w-7" />
          ) : (
            <Monitor className="h-7 w-7" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="center"
        className="min-w-[120px] origin-bottom fan-open"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer flex flex-col items-center justify-center py-4 relative"
        >
          <Sun className="h-7 w-7 mb-2" />
          <span className="text-sm font-medium">Light</span>
          {theme === "light" ? (
            <span className="absolute top-2 right-2 text-gradient-to dark:text-primary text-sm">
              ✓
            </span>
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer flex flex-col items-center justify-center py-4 relative"
        >
          <Moon className="h-7 w-7 mb-2" />
          <span className="text-sm font-medium">Dark</span>
          {theme === "dark" ? (
            <span className="absolute top-2 right-2 text-gradient-to dark:text-primary text-sm">
              ✓
            </span>
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer flex flex-col items-center justify-center py-4 relative"
        >
          <Monitor className="h-7 w-7 mb-2" />
          <span className="text-sm font-medium">System</span>
          {theme === "system" ? (
            <span className="absolute top-2 right-2 text-gradient-to dark:text-primary text-sm">
              ✓
            </span>
          ) : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
