import * as React from "react";

type NextLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | { pathname?: string; query?: Record<string, string> };
};

export default function Link({ href, children, ...props }: NextLinkProps) {
  const resolvedHref = typeof href === "string" ? href : href.pathname ?? "#";
  return (
    <a href={resolvedHref} {...props}>
      {children}
    </a>
  );
}
