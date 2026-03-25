import { render, screen } from "@testing-library/react";

import { SiteCta } from "@/components/blocks/site-cta";

describe("SiteCta", () => {
  it("renders content and links", () => {
    render(
      <SiteCta
        title="Titulo"
        description="Desc"
        roiLabel="ROI"
        roiHref="/roi"
        demoLabel="Reservar demo"
        demoHref="/reservar"
      />
    );

    expect(screen.getByRole("heading", { name: "Titulo" })).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ROI" })).toHaveAttribute("href", "/roi");
    expect(screen.getByRole("link", { name: "Reservar demo" })).toHaveAttribute(
      "href",
      "/reservar"
    );
  });
});
