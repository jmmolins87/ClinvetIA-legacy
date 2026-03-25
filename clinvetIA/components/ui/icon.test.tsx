import { render } from "@testing-library/react";

import { Icon, type IconName } from "@/components/ui/icon";

describe("Icon", () => {
  it("renders a valid lucide icon", () => {
    const { container } = render(<Icon name="Menu" aria-label="Menu" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("returns null for invalid icon", () => {
    const { container } = render(
      <Icon name={"__NOPE__" as unknown as IconName} />
    );
    expect(container.firstChild).toBeNull();
  });
});
