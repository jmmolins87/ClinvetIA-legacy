import type { Meta, StoryObj } from "@storybook/react-vite";

import * as React from "react";

import { Collapse, CollapseItem } from "../../components/ui/collapse";

const meta = {
  title: "UI/Collapse",
  component: Collapse,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Collapse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [openIndex, setOpenIndex] = React.useState<number | null>(0);

    const faqs = [
      {
        q: "¿Qué es Clinvetia?",
        a: "Clinvetia es una plataforma de inteligencia artificial para clínicas veterinarias que automatiza la atención al cliente y optimiza la gestión de la clínica.",
      },
      {
        q: "¿Cómo funciona?",
        a: "Nuestro sistema usa IA para responder consultas automáticamente, gestionar citas y proporcionar soporte 24/7 a los clientes de tu clínica.",
      },
      {
        q: "¿Es seguro?",
        a: "Sí, cumplimos con todas las normativas de protección de datos y garantizamos la seguridad de la información de tus clientes.",
      },
      {
        q: "¿Cuánto cuesta?",
        a: "Ofrecemos planes adaptados a las necesidades de tu clínica. Contáctanos para más información sobre precios.",
      },
    ];

    const toggleFaq = (index: number) => {
      setOpenIndex(openIndex === index ? null : index);
    };

    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Collapse Component</h1>
            <p className="mt-2 text-muted-foreground">
              Componente tipo acordeón expandible con animaciones.
            </p>
          </div>

          <Collapse>
            {faqs.map((faq, index) => (
              <CollapseItem
                key={index}
                title={faq.q}
                isOpen={openIndex === index}
                onToggle={() => toggleFaq(index)}
              >
                {faq.a}
              </CollapseItem>
            ))}
          </Collapse>
        </div>
      </div>
    );
  },
};

export const AllOpen: Story = {
  render: () => (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto">
        <Collapse>
          <CollapseItem title="Item 1 - Abierto" isOpen>
            Contenido del primer item...
          </CollapseItem>
          <CollapseItem title="Item 2 - Abierto" isOpen>
            Contenido del segundo item...
          </CollapseItem>
          <CollapseItem title="Item 3 - Abierto" isOpen>
            Contenido del tercer item...
          </CollapseItem>
        </Collapse>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [openItems, setOpenItems] = React.useState<Set<number>>(new Set([0]));

    const toggleItem = (index: number) => {
      setOpenItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    };

    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Collapse Interactivo</h1>
            <p className="mt-2 text-muted-foreground">
              Múltiples items pueden estar abiertos a la vez.
            </p>
          </div>

          <Collapse>
            <CollapseItem
              title="Item 1"
              isOpen={openItems.has(0)}
              onToggle={() => toggleItem(0)}
            >
              Contenido del primer item...
            </CollapseItem>
            <CollapseItem
              title="Item 2"
              isOpen={openItems.has(1)}
              onToggle={() => toggleItem(1)}
            >
              Contenido del segundo item...
            </CollapseItem>
            <CollapseItem
              title="Item 3"
              isOpen={openItems.has(2)}
              onToggle={() => toggleItem(2)}
            >
              Contenido del tercer item...
            </CollapseItem>
          </Collapse>
        </div>
      </div>
    );
  },
};
