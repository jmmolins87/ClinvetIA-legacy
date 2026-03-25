import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheck, Info, OctagonX, TriangleAlert } from "lucide-react";

import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";

const meta = {
  title: "UI/Alerts/Alert",
  component: Alert,
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertIcon>
        <TriangleAlert className="h-4 w-4" />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>En proceso</AlertTitle>
        <AlertDescription>Esta seccion aun esta en desarrollo.</AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertIcon>
        <Info className="h-4 w-4" />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Nota</AlertTitle>
        <AlertDescription>Mensaje neutral para el usuario.</AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert variant="success">
      <AlertIcon>
        <CircleCheck className="h-4 w-4" />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Listo</AlertTitle>
        <AlertDescription>La accion se completo correctamente.</AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const InfoVariant: Story = {
  render: () => (
    <Alert variant="info">
      <AlertIcon>
        <Info className="h-4 w-4" />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Informacion</AlertTitle>
        <AlertDescription>Este es un mensaje informativo.</AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertIcon>
        <OctagonX className="h-4 w-4" />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Algo fallo. Intentalo de nuevo.</AlertDescription>
      </AlertContent>
    </Alert>
  ),
};
