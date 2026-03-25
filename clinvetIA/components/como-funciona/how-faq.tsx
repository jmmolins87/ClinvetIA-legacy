"use client";

import * as React from "react";
import { useTranslation } from "@/components/providers/i18n-provider";
import { Collapse, CollapseItem } from "@/components/ui/collapse";

export function HowFaq() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      q: t("howItWorks.faq.items.0.q"),
      a: t("howItWorks.faq.items.0.a"),
    },
    {
      q: t("howItWorks.faq.items.1.q"),
      a: t("howItWorks.faq.items.1.a"),
    },
    {
      q: t("howItWorks.faq.items.2.q"),
      a: t("howItWorks.faq.items.2.a"),
    },
    {
      q: t("howItWorks.faq.items.3.q"),
      a: t("howItWorks.faq.items.3.a"),
    },
    {
      q: t("howItWorks.faq.items.4.q"),
      a: t("howItWorks.faq.items.4.a"),
    },
    {
      q: t("howItWorks.faq.items.5.q"),
      a: t("howItWorks.faq.items.5.a"),
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
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
  );
}
