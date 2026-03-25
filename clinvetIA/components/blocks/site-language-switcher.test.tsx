import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SiteLanguageSwitcher } from "@/components/blocks/site-language-switcher";
import { I18nProvider } from "@/components/providers/i18n-provider";

describe("SiteLanguageSwitcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = "es";
  });

  it("renders ES/EN labels and toggles language", async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <SiteLanguageSwitcher defaultLanguage="es" />
      </I18nProvider>
    );

    expect(screen.getByText("ES")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();

    const sw = screen.getByRole("switch", { name: "Cambiar idioma" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.lang).toBe("es");

    await user.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(window.localStorage.getItem("clinvetia.lang")).toBe("en");
    expect(document.documentElement.lang).toBe("en");
  });

  it("loads language from localStorage", async () => {
    window.localStorage.setItem("clinvetia.lang", "en");
    render(
      <I18nProvider>
        <SiteLanguageSwitcher defaultLanguage="es" />
      </I18nProvider>
    );

    const sw = screen.getByRole("switch");
    await waitFor(() => {
      expect(sw).toHaveAttribute("aria-checked", "true");
    });
  });

  it("calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <I18nProvider>
        <SiteLanguageSwitcher defaultLanguage="es" onChange={onChange} />
      </I18nProvider>
    );

    await user.click(screen.getByRole("switch", { name: "Cambiar idioma" }));
    expect(onChange).toHaveBeenCalledWith("en");
  });
});
