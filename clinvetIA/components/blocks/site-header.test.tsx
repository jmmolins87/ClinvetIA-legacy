import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

function mockNavigation(pathname: string) {
  vi.resetModules();
  vi.doMock("next/navigation", () => {
    return {
      usePathname: () => pathname,
      useSearchParams: () => new URLSearchParams(),
      useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
      }),
    };
  });
}

describe("SiteHeader", () => {
  it(
    "renders nav links",
    async () => {
      mockNavigation("/solucion");
      const { I18nProvider } = await import("@/components/providers/i18n-provider");
      const mod = await import("@/components/blocks/site-header");

    render(
      <I18nProvider>
        <mod.SiteHeader />
      </I18nProvider>
    );
      expect(screen.getByRole("navigation", { name: "Principal" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Solucion" })).toHaveAttribute("href", "/solucion");
      expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute("href", "/contacto");
    },
    15_000
  );

  it("opens and closes mobile menu", async () => {
    const user = userEvent.setup();
    mockNavigation("/");
    const { I18nProvider } = await import("@/components/providers/i18n-provider");
    const mod = await import("@/components/blocks/site-header");
    render(
      <I18nProvider>
        <mod.SiteHeader />
      </I18nProvider>
    );

    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getAllByRole("link", { name: "Solucion" }).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    // Dialog content is removed; ensure close button is gone
    expect(screen.queryByRole("button", { name: "Cerrar" })).not.toBeInTheDocument();
  });

  it("home logo click scrolls to top", async () => {
    const user = userEvent.setup();
    mockNavigation("/");
    const { I18nProvider } = await import("@/components/providers/i18n-provider");
    const mod = await import("@/components/blocks/site-header");

    const scrollSpy = vi.spyOn(window, "scrollTo");
    render(
      <I18nProvider>
        <mod.SiteHeader />
      </I18nProvider>
    );
    await user.click(screen.getByRole("button", { name: "Ir arriba" }));
    expect(scrollSpy).toHaveBeenCalled();
  });

  it("mobile menu logo click navigates to home when not on home", async () => {
    const user = userEvent.setup();

    vi.resetModules();
    const push = vi.fn();
    vi.doMock("next/navigation", () => {
      return {
        usePathname: () => "/contacto",
        useSearchParams: () => new URLSearchParams(),
        useRouter: () => ({
          push,
          replace: vi.fn(),
          back: vi.fn(),
          forward: vi.fn(),
          refresh: vi.fn(),
        }),
      };
    });

    const { I18nProvider } = await import("@/components/providers/i18n-provider");
    const mod = await import("@/components/blocks/site-header");
    render(
      <I18nProvider>
        <mod.SiteHeader />
      </I18nProvider>
    );

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(screen.getByRole("button", { name: "Ir arriba" }));
    expect(push).toHaveBeenCalledWith("/");
  });
});
