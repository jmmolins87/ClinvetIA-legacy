import * as React from "react";

type NextImageLikeProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src: string | { src?: string };
  alt: string;
  priority?: boolean;
};

export default function Image(props: NextImageLikeProps) {
  const { src, priority, ...rest } = props;
  const resolvedSrc = typeof src === "string" ? src : src.src ?? "";

  return <img {...rest} src={resolvedSrc} />;
}
