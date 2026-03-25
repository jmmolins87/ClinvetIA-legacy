"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { Icon } from "@/components/ui/icon";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      duration={5000}
      icons={{
        success: <Icon name="CircleCheck" className="size-4" />,
        info: <Icon name="Info" className="size-4" />,
        warning: <Icon name="TriangleAlert" className="size-4" />,
        error: <Icon name="OctagonX" className="size-4" />,
        loading: <Icon name="Loader" className="size-4 animate-spin" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
