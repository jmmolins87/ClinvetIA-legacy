/**
 * PageMain Component
 *
 * Wrapper component that provides the main content landmark for accessibility.
 * Use this as the main container for page content.
 */

"use client";

import * as React from "react";

export interface PageMainProps {
  children: React.ReactNode;
  className?: string;
}

export function PageMain({ children, className }: PageMainProps) {
  return (
    <main id="main-content" className={className} tabIndex={-1}>
      {children}
    </main>
  );
}
