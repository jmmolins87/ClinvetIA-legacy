/**
 * SkipLinks Component
 *
 * Provides keyboard-accessible skip links for users who navigate with keyboard.
 * Links become visible when focused for screen reader and keyboard users.
 */

"use client";

import * as React from "react";

export interface SkipLinksProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
}

export function SkipLinks({ 
  links = [
    { href: "#main-content", label: "Skip to main content" },
    { href: "#primary-navigation", label: "Skip to navigation" },
  ] 
}: SkipLinksProps) {
  return (
    <div className="fixed top-0 left-0 z-[100]">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[101] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
