import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("SiteThemeDropdown", () => {
  it(
    "renders trigger button",
    async () => {
      vi.resetModules();
      vi.doMock("next-themes", () => {
        return {
          useTheme: () => ({ theme: "system", setTheme: vi.fn() }),
        };
      });

    const { I18nProvider } = await import("@/components/providers/i18n-provider");
    const mod = await import("@/components/blocks/site-theme-dropdown");
    render(
      <I18nProvider>
        <mod.SiteThemeDropdown />
      </I18nProvider>
    );
    expect(await screen.findByRole("button", { name: "Cambiar tema" })).toBeInTheDocument();
    },
    15_000
  );

  it("opens menu and allows selecting theme", async () => {
    const user = userEvent.setup();

    const setTheme = vi.fn();
    vi.resetModules();
    vi.doMock("next-themes", () => ({
      useTheme: () => ({ theme: "system", setTheme }),
    }));

    const { I18nProvider } = await import("@/components/providers/i18n-provider");
    const mod = await import("@/components/blocks/site-theme-dropdown");
    render(
      <I18nProvider>
        <mod.SiteThemeDropdown />
      </I18nProvider>
    );

    await user.click(screen.getByRole("button", { name: "Cambiar tema" }));
    await user.click(screen.getByText("Claro"));

    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("supports size=large", async () => {
    vi.resetModules();
    vi.doMock("next-themes", () => {
      return {
        useTheme: () => ({ theme: "system", setTheme: vi.fn() }),
      };
    });

    const { I18nProvider } = await import("@/components/providers/i18n-provider");
    const mod = await import("@/components/blocks/site-theme-dropdown");
    render(
      <I18nProvider>
        <mod.SiteThemeDropdown size="large" />
      </I18nProvider>
    );
    expect(await screen.findByRole("button", { name: "Cambiar tema" })).toBeInTheDocument();
  });
});
