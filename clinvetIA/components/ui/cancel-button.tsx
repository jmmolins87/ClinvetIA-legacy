import * as React from "react";

import { Button } from "@/components/ui/button";

type CancelButtonProps = Omit<React.ComponentProps<typeof Button>, "variant"> & {
  children?: React.ReactNode;
};

export function CancelButton({ children = "Cancel", ...props }: CancelButtonProps) {
  return (
    <Button variant="destructive" {...props}>
      {children}
    </Button>
  );
}
