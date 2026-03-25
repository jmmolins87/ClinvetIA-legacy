import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("AiAssistantDock", () => {
  it("opens the right sheet", async () => {
    const user = userEvent.setup();
    const { I18nProvider } = await import("@/components/providers/i18n-provider");
    const mod = await import("@/components/blocks/ai-assistant-dock");

    render(
      <I18nProvider>
        <mod.AiAssistantDock />
      </I18nProvider>
    );

    await user.click(screen.getByRole("button", { name: "Abrir asistente" }));
    expect(await screen.findByText("¡Hola soy ClinvetIA!")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reservar demo" })).toHaveAttribute(
      "href",
      "/reservar"
    );
  });
});
