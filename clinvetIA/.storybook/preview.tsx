import type { Preview } from "@storybook/react-vite";
import * as React from "react";

import "../app/globals.css";
import "../styles/storybook.css";

import { I18nProvider } from "../components/providers/i18n-provider";
import { ThemeProvider } from "../components/providers/theme-provider";

const preview = {
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <I18nProvider>
          <Story />
        </I18nProvider>
      </ThemeProvider>
    ),
  ],
  parameters: {
    options: {
      storySort: {
        order: [
          "Foundations",
          "Blocks",
          "UI",
          [
            "Buttons",
            "Alerts",
            "Loaders",
            "Overlays",
            "Forms",
            "Avatars",
            "Data Display",
            "Navigation",
            "Layout",
            "Feedback",
          ],
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
} satisfies Preview;

export default preview;
