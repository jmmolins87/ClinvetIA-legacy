import { render, screen } from "@testing-library/react";

import { Logo } from "@/components/logo";

describe("Logo", () => {
  it("renders image", () => {
    render(<Logo width={100} height={30} />);
    expect(screen.getByAltText("Clinvetia")).toBeInTheDocument();
  });
});
