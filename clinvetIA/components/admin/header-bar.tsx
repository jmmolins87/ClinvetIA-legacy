"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiteThemeDropdown } from "@/components/blocks/site-theme-dropdown";

interface HeaderBarProps {
  onOpenMobileNav: () => void;
}

export function HeaderBar({ onOpenMobileNav }: HeaderBarProps) {
  const router = useRouter();
  const [q, setQ] = React.useState("");

  const session = {
    username: "Admin",
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Icon name="Menu" className="size-5" />
        </Button>

        <Link href="/" className="flex items-center gap-3">
          <div className="relative size-9 overflow-hidden rounded-lg border bg-muted/20">
            <Image
              src="/logo.png"
              alt="ClinvetIA"
              fill
              sizes="36px"
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold leading-none">Admin</div>
            <div className="text-muted-foreground mt-1 text-xs leading-none">ClinvetIA</div>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden w-[320px] lg:block">
            <Icon name="Search" className="text-muted-foreground absolute left-2 top-2.5 size-4" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search (UI)..."
              className="pl-8"
              aria-label="Search"
            />
          </div>

          <SiteThemeDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Avatar className="size-7">
                  <AvatarFallback>{session.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start sm:flex">
                  <span className="text-sm font-medium">{session.username}</span>
                </div>
                <Icon name="ChevronDown" className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-gradient-from/0 via-gradient-to/45 to-gradient-to/0"
      />
    </header>
  );
}
